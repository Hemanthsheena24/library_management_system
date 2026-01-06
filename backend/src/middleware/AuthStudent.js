const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

const AuthStudent = async (req, res, next) => {
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

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.user = {
      id: student._id,
      role: "STUDENT",
      email: student.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = AuthStudent;
