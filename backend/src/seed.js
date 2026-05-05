require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const password = await bcrypt.hash("admin123", 10);
  await User.findOneAndUpdate(
    { email: "admin@hsbp.com" },
    {
      $set: {
        name: "Admin",
        email: "admin@hsbp.com",
        password,
        role: "admin",
        isApproved: true,
      },
    },
    { upsert: true, new: true }
  );

  console.log("Admin user is ready (created/updated).");
  console.log("Email: admin@hsbp.com");
  console.log("Password: admin123");
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
