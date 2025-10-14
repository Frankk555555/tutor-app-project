const pool = require('../models/db');

exports.getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await pool.query('SELECT id, name FROM subjects ORDER BY name ASC');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.searchSubjects = async (req, res) => {
    // รับคำค้นหาจาก query string (เช่น /api/subjects/search?q=คณิ)
    const { q } = req.query;

    if (!q) {
        return res.json([]); // ถ้าไม่มีคำค้นหา ก็ส่ง array ว่างกลับไป
    }

    try {
        // สร้าง term สำหรับใช้กับ SQL LIKE (ค้นหาคำที่ขึ้นต้นด้วย...)
        const searchTerm = `${q}%`; 
        
        // ค้นหาในตาราง subjects โดยจำกัดผลลัพธ์แค่ 5 รายการ
        const [subjects] = await pool.query(
            "SELECT id, name FROM subjects WHERE name LIKE ? LIMIT 5",
            [searchTerm]
        );
        res.json(subjects);
    } catch (error) {
        console.error('Error searching subjects:', error);
        res.status(500).json({ message: 'Server error' });
    }
};