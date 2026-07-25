const rateLimit = require('express-rate-limit');

// Helper สำหรับเช็คว่าเป็น localhost หรือไม่ เพื่อข้ามการจำกัด Rate Limit ตอนพัฒนาระบบ
const isLocalhost = (req) => {
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost';
};

// 1. Auth Limiter: จำกัดเฉพาะหน้า Login และ Register (ป้องกัน Brute-force/Spam)
// เช่น ยอมให้ลองผิด/ยิงรีเควสได้ 10 ครั้ง ภายใน 15 นาที
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 10, // จำกัด 10 ครั้งต่อ 1 IP ในระยะเวลา 15 นาที
    skip: isLocalhost, // ข้ามการจำกัดสำหรับ localhost
    message: {
        message: "คุณพยายามเข้าสู่ระบบ/สมัครสมาชิกบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. API Limiter: จำกัดการเรียก API ทั่วไป (ป้องกัน DDoS หรือดึงข้อมูลรัวๆ)
// เช่น ยอมให้เรียก API อื่นๆ ได้ 100 ครั้ง ภายใน 15 นาที
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // จำกัด 100 ครั้งต่อ 1 IP
    skip: isLocalhost, // ข้ามการจำกัดสำหรับ localhost
    message: {
        message: "มีการเรียกข้อมูลบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter
};
