const express = require("express");
const AuthAdmin = require("../middleware/AuthAdmin");
const { seedAdmin } = require("../controllers/adminController");

const router = express.Router();

/**
 * DEV ONLY — create admin
 */
router.get("/seed", seedAdmin);

/**
 * Protected admin route
 */
router.get("/profile", AuthAdmin, (req, res) => {
  res.json({
    message: "Admin authenticated successfully",
    admin: req.user,
  });
});

module.exports = router;
