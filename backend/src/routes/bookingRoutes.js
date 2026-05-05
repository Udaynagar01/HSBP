const express = require("express");
const {
  createBooking,
  createPaymentOrder,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, allowRoles("user", "provider"), createBooking);
router.post("/payment/order", protect, allowRoles("user", "provider"), createPaymentOrder);
router.get("/my", protect, allowRoles("user", "provider"), getMyBookings);
router.get("/provider", protect, allowRoles("provider"), getProviderBookings);
router.patch("/:id/status", protect, allowRoles("user", "provider"), updateBookingStatus);

module.exports = router;
