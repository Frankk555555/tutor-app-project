const pool = require('../models/db');

// ดึงการแจ้งเตือนทั้งหมด (ที่ยังไม่อ่าน) ของผู้ใช้ที่ล็อกอินอยู่
exports.getMyNotifications = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [notifications] = await pool.query(
            "SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC",
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching notifications." });
    }
};

// อัปเดตสถานะการแจ้งเตือนทั้งหมดเป็น "อ่านแล้ว"
exports.markAllAsRead = async (req, res) => {
    const userId = req.user.userId;
    try {
        await pool.query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
            [userId]
        );
        res.json({ message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: "Server error updating notifications." });
    }
};