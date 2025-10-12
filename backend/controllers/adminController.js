const pool = require('../models/db');

// ดึงข้อมูลผู้ใช้ทั้งหมด (ยกเว้น admin)
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC"
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching users." });
    }
};

// ลบผู้ใช้
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await pool.query("DELETE FROM users WHERE id = ? AND role != 'admin'", [userId]);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user.' });
    }
};

// สร้างวิชาใหม่
exports.createSubject = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name is required.' });
    try {
        await pool.query("INSERT INTO subjects (name) VALUES (?)", [name]);
        res.status(201).json({ message: 'Subject created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating subject.' });
    }
};

// ลบวิชา
exports.deleteSubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        await pool.query("DELETE FROM subjects WHERE id = ?", [subjectId]);
        res.json({ message: 'Subject deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject.' });
    }
};

exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    // รับข้อมูลใหม่จาก body
    const { first_name, last_name, email, role } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!first_name || !last_name || !email || !role) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        await pool.query(
            "UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?",
            [first_name, last_name, email, role, userId]
        );
        res.json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
};

exports.getAllAppointments = async (req, res) => {
    // 1. ดึงค่า status จาก query string (เช่น /api/admin/appointments?status=pending)
    const { status } = req.query;

    let query = `
        SELECT 
            a.id, a.appointment_time, a.status, a.total_price,
            s.first_name as student_first_name, s.last_name as student_last_name,
            t.first_name as tutor_first_name, t.last_name as tutor_last_name
        FROM appointments a
        JOIN users s ON a.student_user_id = s.id
        JOIN users t ON a.tutor_user_id = t.id
    `;
    const values = [];

    // 2. เพิ่มเงื่อนไข WHERE ถ้ามีการส่งค่า status มาด้วย
    if (status) {
        query += ' WHERE a.status = ?';
        values.push(status);
    }

    query += ' ORDER BY a.appointment_time DESC';

    try {
        // 3. ส่ง values ไปกับ query เพื่อความปลอดภัย
        const [appointments] = await pool.query(query, values);
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        res.status(500).json({ message: "Server error" });
    }
};

