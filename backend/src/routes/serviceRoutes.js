const express = require("express");
const { getAllServices, createService, getMyServices, deleteService } = require("../controllers/serviceController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllServices);
router.post("/", protect, allowRoles("provider"), createService);
router.get("/mine", protect, allowRoles("provider"), getMyServices);
router.delete("/:id", protect, allowRoles("provider"), deleteService);

module.exports = router;
