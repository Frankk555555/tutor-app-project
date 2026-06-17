const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// ตั้งค่า Cloudinary ด้วย Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ตั้งค่าการจัดเก็บไฟล์บน Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tutor_platform_profiles', // ชื่อโฟลเดอร์ใน Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // ย่อรูปภาพก่อนเซฟ
  },
});

// สร้าง middleware ของ multer
const upload = multer({ storage: storage });

module.exports = upload;