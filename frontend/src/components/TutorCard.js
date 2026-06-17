import React from 'react';
import { Link } from 'react-router-dom';

// 1. กำหนด URL หลักของ Backend ให้ถูกต้อง
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TutorCard = ({ tutor }) => {

  // 2. สร้าง URL รูปภาพให้สมบูรณ์ โดยเช็คก่อนว่ามีข้อมูล profile_picture หรือไม่
  const imageUrl = tutor.profile_picture
    ? (tutor.profile_picture.startsWith('http') ? tutor.profile_picture : `${API_BASE_URL}/${tutor.profile_picture}`)
    : 'https://www.flaticon.com/free-icon/user_3024605?term=person&page=1&position=7&origin=search&related_id=3024605';      // ถ้าไม่มี ให้ใช้รูปสำรอง

  // Render star ratings based on rating value
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f1c40f" stroke="#f1c40f" strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f1c40f" strokeWidth="2">
            <defs>
              <linearGradient id={`halfGrad-${tutor.id}`}>
                <stop offset="50%" stopColor="#f1c40f" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#halfGrad-${tutor.id})`} stroke="#f1c40f" strokeWidth="1" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <Link to={`/tutor/${tutor.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="tutor-card">
        {/* 3. นำตัวแปร imageUrl มาใช้งาน */}
        <img src={imageUrl} alt={`${tutor.first_name}`} />
        
        {tutor.is_verified === 1 && (
          <div className="verified-badge-container">
            <span className="verified-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="verified-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              ยืนยันแล้ว
            </span>
          </div>
        )}

        <h3>{tutor.first_name} {tutor.last_name}</h3>
        
        {/* Tutor Rating Row */}
        <div className="tutor-rating-row">
          <div className="stars-container">
            {renderStars(tutor.average_rating || 0)}
          </div>
          <span className="rating-text">
            {tutor.average_rating > 0 ? parseFloat(tutor.average_rating).toFixed(1) : "ไม่มีรีวิว"}
            {tutor.review_count > 0 && ` (${tutor.review_count})`}
          </span>
        </div>

        <p>{tutor.bio?.substring(0, 80) || 'ติวเตอร์ผู้มีประสบการณ์'}{tutor.bio && tutor.bio.length > 80 ? '...' : ''}</p>
        <p className="rate">฿{tutor.hourly_rate || 'N/A'} / ชั่วโมง</p>
      </div>
    </Link>
  );
};

export default TutorCard;