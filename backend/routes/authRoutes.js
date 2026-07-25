const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, validateResult } = require('../middleware/validator');

// ใช้ authLimiter เฉพาะเส้นทางที่มีความเสี่ยงต่อการโดนสุ่มรหัสหรือสแปมสมัคร
router.post('/register', authLimiter, registerValidation, validateResult, authController.register);
router.post('/login', authLimiter, loginValidation, validateResult, authController.login);
router.post('/logout', authController.logout);

module.exports = router;