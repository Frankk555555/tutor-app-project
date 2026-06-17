const pool = require("../models/db");

// ดึงข้อมูลติวเตอร์ทั้งหมด (พร้อม Filter)
exports.getAllTutors = async (req, res) => {
    const { subjectId, levelId, minPrice, maxPrice, sortBy, query: searchQuery } = req.query;

    let query = `
        SELECT DISTINCT 
            u.id, u.first_name, u.last_name, u.profile_picture, 
            tp.bio, tp.education, tp.hourly_rate,
            COALESCE(avg_rev.avg_rating, 0) AS average_rating,
            COALESCE(avg_rev.review_count, 0) AS review_count,
            1 AS is_verified
        FROM users u
        JOIN tutor_profiles tp ON u.id = tp.user_id
        LEFT JOIN (
            SELECT tutor_user_id, AVG(rating) AS avg_rating, COUNT(id) AS review_count
            FROM reviews
            GROUP BY tutor_user_id
        ) avg_rev ON u.id = avg_rev.tutor_user_id
    `;
    const joins = new Set(); // ใช้ Set เพื่อป้องกันการ JOIN ซ้ำซ้อน
    const conditions = [`u.role = 'tutor'`, `u.status = 'active'`];
    const values = [];

    if (searchQuery) {
        joins.add(`LEFT JOIN tutor_subjects ts ON u.id = ts.tutor_user_id`);
        joins.add(`LEFT JOIN subjects s ON ts.subject_id = s.id`);
        conditions.push(`(u.first_name LIKE ? OR u.last_name LIKE ? OR s.name LIKE ?)`);
        const searchTermLike = `%${searchQuery}%`;
        values.push(searchTermLike, searchTermLike, searchTermLike);
    }

    if (subjectId) {
        joins.add(`LEFT JOIN tutor_subjects ts ON u.id = ts.tutor_user_id`);
        conditions.push(`ts.subject_id = ?`);
        values.push(subjectId);
    }
    
    if (levelId) {
        joins.add(`LEFT JOIN tutor_levels tl ON u.id = tl.tutor_user_id`);
        conditions.push(`tl.level_id = ?`);
        values.push(levelId);
    }

    if (minPrice) {
        conditions.push(`tp.hourly_rate >= ?`);
        values.push(minPrice);
    }
    if (maxPrice) {
        conditions.push(`tp.hourly_rate <= ?`);
        values.push(maxPrice);
    }

    // นำ JOIN ทั้งหมดมาต่อกัน
    query += ' ' + Array.from(joins).join(' ');

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    switch (sortBy) {
        case 'price_asc':
            query += ` ORDER BY tp.hourly_rate ASC`;
            break;
        case 'price_desc':
            query += ` ORDER BY tp.hourly_rate DESC`;
            break;
        default:
            query += ` ORDER BY u.id DESC`;
    }

    try {
        const [tutors] = await pool.query(query, values);
        res.json(tutors);
    } catch (error) {
        console.error("SQL Error in getAllTutors:", error); 
        res.status(500).json({ message: "Server error" });
    }
};

// ดึงข้อมูลโปรไฟล์ติวเตอร์รายคน (สำหรับให้ทุกคนดู)
exports.getTutorById = async (req, res) => {
    const { id } = req.params;
    try {
        const [tutorInfo] = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.profile_picture, tp.bio, tp.education, tp.hourly_rate,
                    1 AS is_verified
             FROM users u
             JOIN tutor_profiles tp ON u.id = tp.user_id
             WHERE u.id = ? AND u.role = 'tutor'`,
            [id]
        );

        if (tutorInfo.length === 0) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        const [subjects] = await pool.query(
            `SELECT s.id, s.name FROM subjects s
             JOIN tutor_subjects ts ON s.id = ts.subject_id
             WHERE ts.tutor_user_id = ?`,
            [id]
        );
        
        const [levels] = await pool.query(
            `SELECT l.id, l.name FROM levels l
             JOIN tutor_levels tl ON l.id = tl.level_id
             WHERE tl.tutor_user_id = ?`,
            [id]
        );

        const [availability] = await pool.query(
            'SELECT available_date, start_time, end_time FROM tutor_availability WHERE tutor_user_id = ? ORDER BY available_date, start_time',
            [id]
        );

        const [reviews] = await pool.query(
            `SELECT r.rating, r.comment, r.created_at, u.first_name as student_name
             FROM reviews r
             JOIN users u ON r.student_user_id = u.id
             WHERE r.tutor_user_id = ?
             ORDER BY r.created_at DESC`,
            [id]
        );
        
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        const response = {
            ...tutorInfo[0],
            subjects,
            levels,
            availability,
            reviews,
            averageRating,
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching tutor by id:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ดึงข้อมูลโปรไฟล์ของติวเตอร์ที่ล็อกอินอยู่
exports.getMyProfile = async (req, res) => {
    const tutorId = req.user.userId;
    try {
        const [profile] = await pool.query(
            `SELECT u.profile_picture, tp.bio, tp.education, tp.hourly_rate 
             FROM tutor_profiles tp
             JOIN users u ON tp.user_id = u.id
             WHERE tp.user_id = ?`,
            [tutorId]
        );
        
        const [subjects] = await pool.query(
            `SELECT s.id, s.name FROM subjects s
             JOIN tutor_subjects ts ON s.id = ts.subject_id
             WHERE ts.tutor_user_id = ?`,
            [tutorId]
        );
        
        const [levels] = await pool.query(
            `SELECT l.id, l.name FROM levels l
             JOIN tutor_levels tl ON l.id = tl.level_id
             WHERE tl.tutor_user_id = ?`,
            [tutorId]
        );

        if (profile.length === 0) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }

        res.json({
            profile: profile[0],
            subjects,
            levels,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// อัปเดตโปรไฟล์ (bio, education, hourly_rate)
exports.updateMyProfile = async (req, res) => {
    const tutorId = req.user.userId;
    const { bio, education, hourly_rate } = req.body;
    try {
        await pool.query(
            "UPDATE tutor_profiles SET bio = ?, education = ?, hourly_rate = ? WHERE user_id = ?",
            [bio, education, hourly_rate, tutorId]
        );
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error updating profile" });
    }
};

// เพิ่มวิชาที่สอน
exports.addMySubject = async (req, res) => {
    const tutorId = req.user.userId;
    const { subjectName } = req.body;
    if (!subjectName) {
        return res.status(400).json({ message: "Subject name is required." });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let [subjects] = await connection.query("SELECT id FROM subjects WHERE name = ?", [subjectName]);
        let subjectId;
        if (subjects.length > 0) {
            subjectId = subjects[0].id;
        } else {
            const [result] = await connection.query("INSERT INTO subjects (name) VALUES (?)", [subjectName]);
            subjectId = result.insertId;
        }
        await connection.query("INSERT INTO tutor_subjects (tutor_user_id, subject_id) VALUES (?, ?)", [tutorId, subjectId]);
        await connection.commit();
        res.status(201).json({ message: "Subject added successfully", subjectId, subjectName });
    } catch (error) {
        await connection.rollback();
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "You already teach this subject." });
        }
        console.error(error);
        res.status(500).json({ message: "Server error adding subject" });
    } finally {
        connection.release();
    }
};

// ลบวิชาที่สอน
exports.deleteMySubject = async (req, res) => {
    const tutorId = req.user.userId;
    const { subjectId } = req.params;
    try {
        const [result] = await pool.query(
            "DELETE FROM tutor_subjects WHERE tutor_user_id = ? AND subject_id = ?",
            [tutorId, subjectId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subject not found or you don't teach it." });
        }
        res.json({ message: "Subject removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error removing subject" });
    }
};

// เพิ่มระดับชั้นที่สอน
exports.addMyLevel = async (req, res) => {
    const tutorId = req.user.userId;
    const { levelId } = req.body;
    if (!levelId) return res.status(400).json({ message: "Level ID is required." });

    try {
        await pool.query(
            "INSERT INTO tutor_levels (tutor_user_id, level_id) VALUES (?, ?)",
            [tutorId, levelId]
        );
        res.status(201).json({ message: "Level added successfully." });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "You already have this level." });
        }
        res.status(500).json({ message: "Error adding level." });
    }
};

// ลบระดับชั้นที่สอน
exports.deleteMyLevel = async (req, res) => {
    const tutorId = req.user.userId;
    const { levelId } = req.params;
    try {
        const [result] = await pool.query(
            "DELETE FROM tutor_levels WHERE tutor_user_id = ? AND level_id = ?",
            [tutorId, levelId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Level not found." });
        }
        res.json({ message: "Level removed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error removing level." });
    }
};

// อัปโหลดรูปโปรไฟล์
exports.uploadProfilePicture = async (req, res) => {
    const tutorId = req.user.userId;
    if (!req.file) {
        return res.status(400).json({ message: "Please upload a file." });
    }
    const filePath = `uploads/${req.file.filename}`;
    try {
        await pool.query("UPDATE users SET profile_picture = ? WHERE id = ?", [filePath, tutorId]);
        res.json({ message: "Profile picture uploaded successfully", filePath });
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        res.status(500).json({ message: "Server error while uploading picture." });
    }
};

// ดึงตารางเวลาว่างของติวเตอร์ที่ล็อกอินอยู่
exports.getMyAvailability = async (req, res) => {
    const tutorId = req.user.userId;
    try {
        const [availability] = await pool.query(
            'SELECT * FROM tutor_availability WHERE tutor_user_id = ? ORDER BY available_date, start_time',
            [tutorId]
        );
        res.json(availability);
    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: "Server error fetching availability." });
    }
};

// เพิ่มช่วงเวลาว่างใหม่
exports.addMyAvailability = async (req, res) => {
    const tutorId = req.user.userId;
    const { available_date, start_time, end_time } = req.body;
    if (!available_date || !start_time || !end_time) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO tutor_availability (tutor_user_id, available_date, start_time, end_time) VALUES (?, ?, ?, ?)',
            [tutorId, available_date, start_time, end_time]
        );
        res.status(201).json({ message: 'เพิ่มตารางเวลาสำเร็จ', newSlot: { id: result.insertId, ...req.body } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'มีช่วงเวลานี้ในระบบแล้ว' });
        }
        console.error("Error adding availability:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มตารางเวลา' });
    }
};

// ลบช่วงเวลาว่าง
exports.deleteMyAvailability = async (req, res) => {
    const tutorId = req.user.userId;
    const { availabilityId } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM tutor_availability WHERE id = ? AND tutor_user_id = ?',
            [availabilityId, tutorId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบตารางเวลาที่ต้องการลบ' });
        }
        res.json({ message: 'ลบตารางเวลาสำเร็จ' });
    } catch (error) {
        console.error("Error deleting availability:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบตารางเวลา' });
    }
    
};

exports.getFeaturedTutors = async (req, res) => {
    try {
        const [tutors] = await pool.query(`
            SELECT u.id, u.first_name, u.last_name, u.profile_picture, tp.bio, tp.hourly_rate,
                   COALESCE(avg_rev.avg_rating, 0) AS average_rating,
                   COALESCE(avg_rev.review_count, 0) AS review_count,
                   1 AS is_verified
            FROM users u
            JOIN tutor_profiles tp ON u.id = tp.user_id
            LEFT JOIN (
                SELECT tutor_user_id, AVG(rating) AS avg_rating, COUNT(id) AS review_count
                FROM reviews
                GROUP BY tutor_user_id
            ) avg_rev ON u.id = avg_rev.tutor_user_id
            WHERE u.role = 'tutor' AND u.status = 'active'
            ORDER BY u.id DESC 
            LIMIT 4
        `);
        res.json(tutors);
    } catch (error) {
        console.error("Error fetching featured tutors:", error);
        res.status(500).json({ message: "Server error" });
    }
};