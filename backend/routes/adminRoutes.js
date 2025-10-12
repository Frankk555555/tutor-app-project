const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// ใช้ middleware ตรวจสอบว่าเป็น admin หรือไม่กับทุก route ในไฟล์นี้
router.use(authMiddleware, isAdmin);


// GET /api/admin/appointments
router.get('/appointments', adminController.getAllAppointments);

// User Management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.put('/users/:userId', adminController.updateUser);


// Subject Management
router.post('/subjects', adminController.createSubject);
router.delete('/subjects/:subjectId', adminController.deleteSubject);

module.exports = router;