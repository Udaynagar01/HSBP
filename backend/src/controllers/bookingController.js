const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const hasPlaceholderRazorpayKeys =
  !razorpayKeyId ||
  !razorpayKeySecret ||
  razorpayKeyId.includes("xxxx") ||
  razorpayKeySecret.includes("xxxx");

const razorpay =
  !hasPlaceholderRazorpayKeys
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

const createBookingRecord = async ({
  req,
  service,
  address,
  scheduledAt,
  paymentStatus,
  razorpayOrderId = null,
  razorpayPaymentId = null,
  razorpaySignature = null,
}) => {
  return Booking.create({
    user: req.user._id,
    service: service._id,
    provider: service.provider,
    address,
    scheduledAt,
    amount: service.price,
    paymentStatus,
    paymentMethod: "razorpay",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
};

const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      address,
      scheduledAt,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMode,
    } = req.body;
    if (!serviceId || !address || !scheduledAt) {
      return res.status(400).json({ message: "Please provide service, address, and schedule" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own service" });
    }

    const isDemoPayment = paymentMode === "demo";
    if (isDemoPayment) {
      if (!razorpayPaymentId || !String(razorpayPaymentId).startsWith("demo_pay_")) {
        return res.status(400).json({ message: "Invalid demo payment data" });
      }
    } else {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: "Payment verification data is missing" });
      }

      if (!razorpayKeySecret || hasPlaceholderRazorpayKeys) {
        return res.status(500).json({ message: "Payment gateway is not configured on server" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    const alreadyBooked = await Booking.findOne({ razorpayPaymentId });
    if (alreadyBooked) {
      return res.status(400).json({ message: "This payment has already been used for booking" });
    }

    const booking = await createBookingRecord({
      req,
      service,
      address,
      scheduledAt,
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
};

const createPaymentOrder = async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ message: "Service id is required" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own service" });
    }

    const amountInPaise = Math.round(Number(service.price) * 100);
    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ message: "Service price is invalid for payment" });
    }

    if (!razorpay || !razorpayKeyId) {
      return res.status(201).json({
        key: null,
        orderId: `demo_order_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        servicePrice: service.price,
        serviceTitle: service.title,
        mockMode: true,
        message: "Demo payment mode enabled because Razorpay keys are not configured.",
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `hsbp_${req.user._id}_${Date.now()}`,
      notes: {
        serviceId: String(service._id),
        userId: String(req.user._id),
      },
    });

    res.status(201).json({
      key: razorpayKeyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      servicePrice: service.price,
      serviceTitle: service.title,
    });
  } catch (error) {
    const razorpayApiMessage =
      error?.error?.description || error?.description || error?.error?.reason || error?.message;
    const statusCode = error?.statusCode || 500;
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      message: razorpayApiMessage || "Failed to create payment order",
      error: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service", "title category price")
      .populate("provider", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("service", "title category price")
      .populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch provider bookings", error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isAssignedProvider = booking.provider.toString() === req.user._id.toString();
    const isBookingOwner     = booking.user.toString()     === req.user._id.toString();

    const providerAllowed = ["accepted", "completed", "cancelled"];
    const ownerAllowed    = ["cancelled"];

    if (isAssignedProvider && providerAllowed.includes(status)) {
      booking.status = status;
    } else if (isBookingOwner && ownerAllowed.includes(status)) {
      booking.status = status;
    } else {
      return res.status(403).json({ message: "Not allowed to set this status" });
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking status", error: error.message });
  }
};

module.exports = {
  createBooking,
  createPaymentOrder,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
};
