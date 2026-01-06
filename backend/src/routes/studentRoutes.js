const express = require("express");
const { registerStudent } = require("../controllers/studentController");
const AuthStudent = require("../middleware/AuthStudent");

const router = express.Router();

router.post("/register", registerStudent);

// protected test route
router.get("/profile", AuthStudent, (req, res) => {
  res.json({
    message: "Student authenticated successfully",
    user: req.user,
  });
});

module.exports = router;
