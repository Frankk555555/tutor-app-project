const multer = require('multer');
const path = require('path');

// ตั้งค่าการจัดเก็บไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // บอกให้ Multer เก็บไฟล์ไว้ในโฟลเดอร์ uploads
    },
    filename: function (req, file, cb) {
        // ป้องกันชื่อไฟล์ซ้ำกัน: userId-timestamp.extension
        const uniqueSuffix = req.user.userId + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// สร้าง middleware ของ multer
const upload = multer({ storage: storage });

module.exports = upload;