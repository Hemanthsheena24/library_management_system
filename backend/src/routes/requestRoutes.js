const express = require("express");

const AuthStudent = require("../middleware/AuthStudent");
const AuthAdmin = require("../middleware/AuthAdmin");

const {
  createRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  returnBook,
  getMyRequests,
} = require("../controllers/requestController");

const router = express.Router();

/**
 * STUDENT ROUTES
 */

// create a new book request
router.post("/create", AuthStudent, createRequest);

// return an approved book
router.post("/return/:id", AuthStudent, returnBook);

// view my own requests
router.get("/my", AuthStudent, getMyRequests);

/**
 * ADMIN ROUTES
 */

// view all requests
router.get("/", AuthAdmin, getAllRequests);

// approve a request
router.post("/approve/:id", AuthAdmin, approveRequest);

// reject a request
router.post("/reject/:id", AuthAdmin, rejectRequest);

module.exports = router;
