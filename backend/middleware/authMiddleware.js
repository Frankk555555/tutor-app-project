const jwt = require('jsonwebtoken');

// ฟังก์ชันหลัก: อ่าน Token จาก httpOnly cookie ก่อน, fallback เป็น Authorization header
const authMiddleware = (req, res, next) => {
    // 1. ลองอ่านจาก cookie ก่อน (วิธีหลัก)
    let token = req.cookies?.token;

    // 2. ถ้าไม่มี cookie ให้ลอง fallback จาก Authorization header (สำหรับ Postman/API tools)
    if (!token) {
        const authHeader = req.header('Authorization');
        if (authHeader) {
            token = authHeader.replace('Bearer ', '');
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId: 1, role: 'student' }
        next();
    } catch (ex) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};


const isTutor = (req, res, next) => {
    if (req.user.role !== 'tutor') {
        return res.status(403).json({ message: 'Access denied. Tutors only resource.' });
    }
    next();
};

const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Students only resource.' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only resource.' });
    }
    next();
};

module.exports = {
    authMiddleware,
    isTutor,
    isStudent,
    isAdmin,
};