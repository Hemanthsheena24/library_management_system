const mongoose = require("mongoose");
const Book = require("../models/Book");

/**
 * PUBLIC: Get all books
 */
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("Fetch books error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

/**
 * PUBLIC: Get books by category
 */
exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    const query = category ? { category } : {};
    const books = await Book.find(query);

    res.json(books);
  } catch (error) {
    console.error("Fetch category error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

/**
 * ADMIN: Add a new book
 */
exports.addBook = async (req, res) => {
  try {
    let { title, author, category, quantity } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        message: "Title and author are required"
      });
    }

    quantity = Number(quantity) || 1;

    // Check if book already exists
    const existingBook = await Book.findOne({
      title: title.trim(),
      author: author.trim()
    });

    if (existingBook) {
      existingBook.quantity += quantity;
      if (category) existingBook.category = category;
      await existingBook.save();

      return res.status(200).json({
        message: "Book quantity updated",
        book: existingBook
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category || "General",
      quantity
    });

    res.status(201).json({
      message: "Book added successfully",
      book
    });

  } catch (error) {
    console.error("Add book error:", error);
    res.status(500).json({ message: "Failed to add book" });
  }
};

/**
 * ADMIN: Update book details / quantity
 */
exports.updateBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({
      message: "Book updated successfully",
      book: updatedBook
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Failed to update book" });
  }
};

/**
 * ADMIN: Delete a book
 */
exports.deleteBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
};
