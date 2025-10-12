const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// ใช้ middleware ตรวจสอบการล็อกอินกับทุก route
router.use(authMiddleware);

// GET /api/notifications -> ดึงการแจ้งเตือนของตัวเอง
router.get('/', notificationController.getMyNotifications);

// PATCH /api/notifications/read-all -> อัปเดตทั้งหมดเป็นอ่านแล้ว
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;