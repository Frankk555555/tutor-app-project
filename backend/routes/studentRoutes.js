// backend/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware, isStudent } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// === เส้นทางสำหรับนักเรียนเท่านั้น (ป้องกันด้วย isStudent) ===
// เส้นทางเหล่านี้จะเข้าได้ก็ต่อเมื่อผู้ใช้ที่ล็อกอินเป็น "นักเรียน" เท่านั้น
router.get('/my-profile', authMiddleware, isStudent, studentController.getMyProfile);
router.put('/my-profile', authMiddleware, isStudent, studentController.updateMyProfile);
router.put(
    '/my-profile/picture',
    authMiddleware, 
    isStudent,
    upload.single('profileImage'),
    studentController.uploadProfilePicture
);

// === เส้นทางสำหรับผู้ใช้ที่ล็อกอินแล้ว (ใครก็ได้ที่ล็อกอินแล้วเข้าถึงได้) ===
// ติวเตอร์จำเป็นต้องเห็นโปรไฟล์ของนักเรียน ดังนั้นเราจะตรวจแค่ว่าล็อกอินแล้วหรือยัง (`authMiddleware`) ก็พอ
router.get('/profile/:studentId', authMiddleware, studentController.getStudentProfileById);

module.exports = router;