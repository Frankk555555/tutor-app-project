const pool = require('../models/db');

// (นักเรียน) สร้างรีวิวใหม่
exports.createReview = async (req, res) => {
    const studentId = req.user.userId;
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
        return res.status(400).json({ message: 'Appointment ID and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. ตรวจสอบว่าการนัดหมายนี้มีอยู่จริง, เสร็จสิ้นแล้ว, และยังไม่ถูกรีวิว
        const [appRows] = await connection.query(
            'SELECT * FROM appointments WHERE id = ? AND student_user_id = ? AND status = ? AND has_been_reviewed = ?',
            [appointmentId, studentId, 'completed', false]
        );

        if (appRows.length === 0) {
            await connection.rollback();
            return res.status(403).json({ message: 'This appointment cannot be reviewed.' });
        }

        const appointment = appRows[0];
        const tutorId = appointment.tutor_user_id;

        // 2. บันทึกรีวิวลงในตาราง reviews
        await connection.query(
            'INSERT INTO reviews (student_user_id, tutor_user_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [studentId, tutorId, appointmentId, rating, comment]
        );

        // 3. อัปเดตสถานะการนัดหมายว่าถูกรีวิวแล้ว
        await connection.query('UPDATE appointments SET has_been_reviewed = TRUE WHERE id = ?', [appointmentId]);
        
        await connection.commit();
        res.status(201).json({ message: 'Review submitted successfully!' });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error while submitting review.' });
    } finally {
        connection.release();
    }
};