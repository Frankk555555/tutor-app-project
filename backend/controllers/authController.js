const pool = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';

// ตั้งค่า Cookie options สำหรับ JWT token
const cookieOptions = {
    httpOnly: true,        // JavaScript ฝั่ง client เข้าถึงไม่ได้ (ป้องกัน XSS)
    secure: isProduction,  // ใช้ HTTPS เท่านั้นใน production
    sameSite: isProduction ? 'strict' : 'lax', // ป้องกัน CSRF
    maxAge: 24 * 60 * 60 * 1000, // 1 วัน (มิลลิวินาที)
    path: '/',
};

exports.register = async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!['student', 'tutor'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName, role]
        );
        const userId = result.insertId;

        if (role === 'tutor') {
            await pool.query('INSERT INTO tutor_profiles (user_id) VALUES (?)', [userId]);
        }

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // ส่ง JWT ผ่าน httpOnly cookie แทนการส่งใน body
        res.cookie('token', token, cookieOptions);

        // ส่งข้อมูลที่ไม่ใช่ความลับกลับไปเพื่อให้ Frontend ใช้แสดง UI
        res.json({ role: user.role, userId: user.id, name: user.first_name });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    // เคลียร์ cookie โดยตั้งค่าเหมือนกัน (path, domain ต้องตรง)
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/',
    });
    res.json({ message: 'Logged out successfully' });
};