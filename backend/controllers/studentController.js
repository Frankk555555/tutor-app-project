const pool = require('../models/db');

// ดึงข้อมูลโปรไฟล์ของนักเรียนที่ล็อกอินอยู่
exports.getMyProfile = async (req, res) => {
    const studentId = req.user.userId;
    try {
        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, profile_picture FROM users WHERE id = ?',
            [studentId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// อัปเดตโปรไฟล์ (ชื่อ, นามสกุล)
exports.updateMyProfile = async (req, res) => {
    const studentId = req.user.userId;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required.' });
    }

    try {
        await pool.query(
            'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
            [firstName, lastName, studentId]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    const studentId = req.user.userId;

    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }

    const filePath = `uploads/${req.file.filename}`;

    try {
        await pool.query(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [filePath, studentId]
        );
        res.json({ message: 'Profile picture uploaded successfully', filePath });
    } catch (error) {
        console.error('Error uploading student profile picture:', error);
        res.status(500).json({ message: 'Server error while uploading picture.' });
    }
};

exports.getStudentProfileById = async (req, res) => {
    const { studentId } = req.params;
    try {
        // เลือกเฉพาะข้อมูลที่ไม่ใช่ข้อมูลส่วนตัว (ห้ามส่ง password, email)
        const [rows] = await pool.query(
            'SELECT id, first_name, last_name, profile_picture, created_at FROM users WHERE id = ? AND role = ?',
            [studentId, 'student']
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};