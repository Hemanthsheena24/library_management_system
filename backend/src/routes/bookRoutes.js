const express = require("express");
const AuthAdmin = require("../middleware/AuthAdmin");

const {
  getAllBooks,
  getBooksByCategory,
  addBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const router = express.Router();

/**
 * PUBLIC ROUTES
 */
router.get("/", getAllBooks);
router.get("/category", getBooksByCategory);

/**
 * ADMIN ROUTES
 */
router.post("/", AuthAdmin, addBook);
router.put("/:id", AuthAdmin, updateBook);
router.delete("/:id", AuthAdmin, deleteBook);

module.exports = router;
