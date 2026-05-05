const express = require("express");
const {
  getAllUsers,
  setProviderApproval,
  getAllBookings,
  changeUserPassword,
} = require("../controllers/adminController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect, allowRoles("admin"), getAllUsers);
router.patch("/providers/:id/approval", protect, allowRoles("admin"), setProviderApproval);
router.get("/bookings", protect, allowRoles("admin"), getAllBookings);
router.patch("/users/:id/password", protect, allowRoles("admin"), changeUserPassword);

module.exports = router;
