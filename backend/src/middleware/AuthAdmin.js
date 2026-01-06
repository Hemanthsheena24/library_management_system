const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const AuthAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    const base64Credentials = authHeader.split(" ")[1];
    const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");

    const [email, password] = decoded.split(":");

    if (!email || !password) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    req.user = {
      id: admin._id,
      role: "ADMIN",
      email: admin.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Admin authentication failed" });
  }
};

module.exports = AuthAdmin;
