const mongoose = require("mongoose");
const BookRequest = require("../models/BookRequest");
const Book = require("../models/Book");

/**
 * STUDENT: Create a book request
 */
exports.createRequest = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.quantity <= 0) {
      return res.status(400).json({ message: "Book not available" });
    }

    // prevent duplicate active requests
    const existingRequest = await BookRequest.findOne({
      student: req.user.id,
      book: bookId,
      status: { $in: ["PENDING", "APPROVED"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have an active request for this book",
      });
    }

    const request = await BookRequest.create({
      student: req.user.id,
      book: bookId,
    });

    res.status(201).json({
      message: "Book request submitted",
      requestId: request._id,
    });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Failed to create request" });
  }
};

/**
 * ADMIN: View all requests
 */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BookRequest.find()
      .populate("student", "email")
      .populate("book", "title author");

    res.json(requests);
  } catch (error) {
    console.error("Fetch requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/**
 * ADMIN: Approve request
 */
exports.approveRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const request = await BookRequest.findById(req.params.id);
    if (!request || request.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const book = await Book.findById(request.book);
    if (!book || book.quantity <= 0) {
      return res.status(400).json({ message: "Book not available" });
    }

    request.status = "APPROVED";
    book.quantity -= 1;

    await book.save();
    await request.save();

    res.json({ message: "Request approved" });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({ message: "Approval failed" });
  }
};

/**
 * ADMIN: Reject request
 */
exports.rejectRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const request = await BookRequest.findById(req.params.id);
    if (!request || request.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid request" });
    }

    request.status = "REJECTED";
    await request.save();

    res.json({ message: "Request rejected" });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ message: "Rejection failed" });
  }
};

/**
 * STUDENT: Return a book
 */
exports.returnBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({
        message: "Request not eligible for return",
      });
    }

    // ownership check
    if (request.student.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You cannot return this book",
      });
    }

    const book = await Book.findById(request.book);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    request.status = "RETURNED";
    book.quantity += 1;

   _toggle:
    await book.save();
    await request.save();

    res.json({ message: "Book returned successfully" });
  } catch (error) {
    console.error("Return book error:", error);
    res.status(500).json({ message: "Return failed" });
  }
};

/**
 * STUDENT: View my requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BookRequest.find({
      student: req.user.id,
    }).populate("book", "title author");

    res.json(requests);
  } catch (error) {
    console.error("Fetch my requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
