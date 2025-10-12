const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const { authMiddleware, isTutor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// === Public Routes ===
// GET /api/tutors -> ดูรายชื่อติวเตอร์ทั้งหมด (กรองได้)
router.get('/', tutorController.getAllTutors);

// === Private Routes (ต้องอยู่ก่อน /:id เพื่อไม่ให้สับสน) ===
// GET /api/tutors/my-profile -> ดึงข้อมูลโปรไฟล์ของตัวเอง
router.get('/my-profile', authMiddleware, isTutor, tutorController.getMyProfile);

// GET /api/tutors/my-availability -> ดึงตารางเวลาของตัวเอง
router.get('/my-availability', authMiddleware, isTutor, tutorController.getMyAvailability);

// === Public Route ที่รับ Parameter (ต้องอยู่หลังสุดของกลุ่ม GET) ===
// GET /api/tutors/:id -> ดูโปรไฟล์ของติวเตอร์รายคน
router.get('/:id', tutorController.getTutorById);


// === Private Routes (ที่เหลือ) ===
// POST /api/tutors/my-availability -> เพิ่มตารางเวลา
router.post('/my-availability', authMiddleware, isTutor, tutorController.addMyAvailability);

// DELETE /api/tutors/my-availability/:availabilityId -> ลบตารางเวลา
router.delete('/my-availability/:availabilityId', authMiddleware, isTutor, tutorController.deleteMyAvailability);

// PUT /api/tutors/my-profile -> อัปเดตข้อมูลโปรไฟล์ (Bio, Education)
router.put('/my-profile', authMiddleware, isTutor, tutorController.updateMyProfile);

// PUT /api/tutors/my-profile/picture -> อัปเดต รูปโปรไฟล์
router.put('/my-profile/picture', authMiddleware, isTutor, upload.single('profileImage'), tutorController.uploadProfilePicture);

// POST /api/tutors/my-subjects -> เพิ่มวิชาที่สอน
router.post('/my-subjects', authMiddleware, isTutor, tutorController.addMySubject);

// DELETE /api/tutors/my-subjects/:subjectId -> ลบวิชาที่สอน
router.delete('/my-subjects/:subjectId', authMiddleware, isTutor, tutorController.deleteMySubject);


module.exports = router;