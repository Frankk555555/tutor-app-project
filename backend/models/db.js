const mysql = require('mysql2/promise'); // <-- [สำคัญ] ต้องมี /promise ต่อท้าย
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // เพิ่ม Port และค่าเริ่มต้น
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;