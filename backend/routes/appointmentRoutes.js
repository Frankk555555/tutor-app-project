const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware, isStudent, isTutor } = require('../middleware/authMiddleware');

// (นักเรียน) สร้างการนัดหมาย
router.post('/', authMiddleware, isStudent, appointmentController.createAppointment);

// (นักเรียน) ดูประวัติการนัดหมายของตัวเอง
router.get('/student', authMiddleware, isStudent, appointmentController.getStudentAppointments);

// (ติวเตอร์) ดูรายการนัดหมายทั้งหมดของตัวเอง
router.get('/tutor', authMiddleware, isTutor, appointmentController.getTutorAppointments);

// (ติวเตอร์) อัปเดตสถานะการนัดหมาย (ตอบรับ/ปฏิเสธ)
router.patch('/:appointmentId', authMiddleware, isTutor, appointmentController.updateAppointmentStatus);


module.exports = router;