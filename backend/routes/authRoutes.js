const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// ใช้ authLimiter เฉพาะเส้นทางที่มีความเสี่ยงต่อการโดนสุ่มรหัสหรือสแปมสมัคร
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);

module.exports = router;