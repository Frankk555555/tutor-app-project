const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const levelRoutes = require('./routes/levelRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // อนุญาตให้ส่ง cookie ข้าม origin
}));
app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // สำหรับอ่าน cookie จาก request
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ใช้ apiLimiter กับเส้นทางที่ขึ้นต้นด้วย /api ทั้งหมดเพื่อป้องกัน DDoS/Flood
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/levels', levelRoutes);


app.get('/', (req, res) => {
    res.send('Tutor Finder API is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});