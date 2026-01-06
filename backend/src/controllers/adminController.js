const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

/**
 * DEV ONLY: Seed default admin
 */
exports.seedAdmin = async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: "admin@library.com" });
    if (existing) {
      return res.json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await Admin.create({
      email: "admin@library.com",
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        email: admin.email,
        id: admin._id,
      },
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    res.status(500).json({ message: "Failed to seed admin" });
  }
};
