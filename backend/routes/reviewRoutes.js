const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, isStudent } = require('../middleware/authMiddleware');

// (นักเรียน) ส่งรีวิวใหม่
router.post('/', authMiddleware, isStudent, reviewController.createReview);

module.exports = router;