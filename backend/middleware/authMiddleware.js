const jwt = require('jsonwebtoken');

// ฟังก์ชันเดิม (ไม่ต้องแก้)
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Malformed token.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId: 1, role: 'student' }
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
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