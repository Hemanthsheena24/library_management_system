const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};
