const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "RETURNED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookRequest", bookRequestSchema);

