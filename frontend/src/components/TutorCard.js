import React from 'react';
import { Link } from 'react-router-dom';

// 1. กำหนด URL หลักของ Backend ให้ถูกต้อง
const API_BASE_URL = 'http://localhost:5000';

const TutorCard = ({ tutor }) => {

  // 2. สร้าง URL รูปภาพให้สมบูรณ์ โดยเช็คก่อนว่ามีข้อมูล profile_picture หรือไม่
  const imageUrl = tutor.profile_picture
    ? `${API_BASE_URL}/${tutor.profile_picture}` // ถ้ามี ให้เติม URL หลักข้างหน้า
    : 'https://www.flaticon.com/free-icon/user_3024605?term=person&page=1&position=7&origin=search&related_id=3024605';      // ถ้าไม่มี ให้ใช้รูปสำรอง

  return (
    <Link to={`/tutor/${tutor.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="tutor-card">
        {/* 3. นำตัวแปร imageUrl มาใช้งาน */}
        <img src={imageUrl} alt={`${tutor.first_name}`} />
        
        <h3>{tutor.first_name} {tutor.last_name}</h3>
        <p>{tutor.bio?.substring(0, 80) || 'ติวเตอร์ผู้มีประสบการณ์'}{tutor.bio && tutor.bio.length > 80 ? '...' : ''}</p>
        <p className="rate">฿{tutor.hourly_rate || 'N/A'} / ชั่วโมง</p>
      </div>
    </Link>
  );
};

export default TutorCard;