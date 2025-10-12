const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware, isStudent } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware นี้จะถูกใช้กับทุก Route ในไฟล์นี้
router.use(authMiddleware, isStudent);

// GET http://localhost:5000/api/students/my-profile
router.get('/my-profile', studentController.getMyProfile);

// PUT http://localhost:5000/api/students/my-profile
router.put('/my-profile', studentController.updateMyProfile);

router.put(
    '/my-profile/picture',
    upload.single('profileImage'), // ใช้ middleware เดียวกับติวเตอร์
    studentController.uploadProfilePicture
);

module.exports = router;