const Service = require("../models/Service");

const getAllServices = async (_req, res) => {
  try {
    const services = await Service.find().populate("provider", "name email");
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services", error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: "Provider is not approved by admin yet" });
    }

    const { title, category, description, price } = req.body;
    if (!title || !category || price === undefined) {
      return res.status(400).json({ message: "Please provide title, category, and price" });
    }

    const service = await Service.create({
      title,
      category,
      description,
      price,
      provider: req.user._id,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Failed to create service", error: error.message });
  }
};

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your services", error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this service" });
    }
    await service.deleteOne();
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete service", error: error.message });
  }
};

module.exports = { getAllServices, createService, getMyServices, deleteService };
