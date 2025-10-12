const pool = require("../models/db");

// (นักเรียน) สร้างการนัดหมายใหม่
exports.createAppointment = async (req, res) => {
  const studentId = req.user.userId;
  const { tutorId, appointmentTime, duration, studentMessage } = req.body;

  if (!tutorId || !appointmentTime || !duration) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // 1. ดึงราคาต่อชั่วโมงของติวเตอร์
    const [tutorProfile] = await pool.query(
      "SELECT hourly_rate FROM tutor_profiles WHERE user_id = ?",
      [tutorId]
    );
    if (tutorProfile.length === 0) {
      return res.status(404).json({ message: "Tutor not found." });
    }
    const hourlyRate = tutorProfile[0].hourly_rate;

    // 2. คำนวณราคารวม
    const totalPrice = (hourlyRate / 60) * duration;

    // 3. บันทึกข้อมูลลงฐานข้อมูล
    const [result] = await pool.query(
      "INSERT INTO appointments (student_user_id, tutor_user_id, appointment_time, duration, total_price, student_message, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        studentId,
        tutorId,
        appointmentTime,
        duration,
        totalPrice,
        studentMessage,
        "pending",
      ]
    );

    const [student] = await pool.query('SELECT first_name FROM users WHERE id = ?', [studentId]);
        const message = `${student[0].first_name} ได้ส่งคำขอนัดหมายใหม่ถึงคุณ`;
        await pool.query(
            'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
            [tutorId, message, '/tutor/dashboard'] // ส่งไปหาติวเตอร์
        );

    res
      .status(201)
      .json({
        message: "Appointment request sent successfully!",
        appointmentId: result.insertId,
      });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res
      .status(500)
      .json({ message: "Server error while creating appointment." });
  }
};

// (ติวเตอร์) ดูรายการนัดหมายที่เข้ามาหาตัวเอง
exports.getTutorAppointments = async (req, res) => {
  const tutorId = req.user.userId;
  try {
    const [appointments] = await pool.query(
      `
            SELECT a.id, a.appointment_time, a.status, a.duration, a.total_price,
                   u.first_name as student_first_name, u.last_name as student_last_name
            FROM appointments a
            JOIN users u ON a.student_user_id = u.id
            WHERE a.tutor_user_id = ?
            ORDER BY a.appointment_time DESC
        `,
      [tutorId]
    );
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// (ติวเตอร์) ตอบรับ หรือ ปฏิเสธ การนัดหมาย
exports.updateAppointmentStatus = async (req, res) => {
  const tutorId = req.user.userId;
  const { appointmentId } = req.params;
  const { status } = req.body; // รับ 'approved' หรือ 'rejected'

  if (!["approved", "rejected","completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE appointments SET status = ? WHERE id = ? AND tutor_user_id = ?",
      [status, appointmentId, tutorId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Appointment not found or you are not authorized." });
    }
    
    const [appointment] = await pool.query('SELECT student_user_id FROM appointments WHERE id = ?', [appointmentId]);
        const studentId = appointment[0].student_user_id;
        const message = `การนัดหมายของคุณได้รับการอัปเดตสถานะเป็น: ${status}`;
        await pool.query(
            'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
            [studentId, message, '/student/dashboard'] // ส่งไปหานักเรียน
        );

    res.json({ message: `Appointment has been ${status}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// (นักเรียน) ดูประวัติการนัดหมายของตัวเอง
exports.getStudentAppointments = async (req, res) => {
  const studentId = req.user.userId;
  try {
    const [appointments] = await pool.query(
      `
            SELECT a.id, a.appointment_time, a.status, a.duration, a.total_price,a.has_been_reviewed,
                   u.first_name as tutor_first_name, u.last_name as tutor_last_name
            FROM appointments a
            JOIN users u ON a.tutor_user_id = u.id
            WHERE a.student_user_id = ?
            ORDER BY a.appointment_time DESC
        `,
      [studentId]
    );
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
