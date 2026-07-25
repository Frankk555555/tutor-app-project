const { body, validationResult } = require('express-validator');

// 1. กฎการตรวจสอบสำหรับการสมัครสมาชิก
const registerValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(), // แปลงเป็นตัวพิมพ์เล็ก ป้องกันซ้ำ
    
    body('password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่าน')
        .isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),

    body('firstName')
        .trim()
        .notEmpty().withMessage('กรุณากรอกชื่อจริง'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('กรุณากรอกนามสกุล'),

    body('role')
        .notEmpty().withMessage('กรุณาระบุบทบาท (นักเรียน หรือ ติวเตอร์)')
        .isIn(['student', 'tutor']).withMessage('บทบาทต้องเป็น student หรือ tutor เท่านั้น'),
];

// 2. กฎการตรวจสอบสำหรับการเข้าสู่ระบบ
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
];

// 3. Middleware สำหรับรับผลลัพธ์การตรวจสอบและส่ง Error กลับ (ถ้ามี)
const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // หากมี Error จาก Express Validator ให้ส่ง 400 Bad Request กลับไปพร้อมรายการ Error
        return res.status(400).json({ 
            message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', 
            errors: errors.array() 
        });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    validateResult
};
