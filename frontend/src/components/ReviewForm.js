import React, { useState } from 'react';
import StarRating from './StarRating';
import './ReviewForm.css';
import { toast } from 'react-toastify';

const ReviewForm = ({ appointment, onSubmit, onClose }) => {
    // 1. [แก้ไข] ย้ายการเรียก Hooks ทั้งหมดขึ้นมาไว้บนสุด
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    // 2. [แก้ไข] ย้าย Safety Check มาไว้หลังจากเรียก Hooks แล้ว
    // ถ้าไม่มีข้อมูล appointment ส่งมา ให้ไม่ต้องแสดงผลอะไรเลย
    if (!appointment) {
        return null; 
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('กรุณาให้คะแนนอย่างน้อย 1 ดาว');
            return;
        }
        onSubmit({
            appointmentId: appointment.id,
            rating,
            comment,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <p>ให้คะแนนการสอนของ <strong>{appointment.tutor_first_name}</strong></p>
            
            <div className="form-group">
                <label>คะแนน</label>
                <StarRating rating={rating} onRating={setRating} />
            </div>

            <div className="form-group">
                <label>ความคิดเห็น (ถ้ามี)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="เล่าประสบการณ์ของคุณ..."
                ></textarea>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>ยกเลิก</button>
                <button type="submit" className="btn">ส่งรีวิว</button>
            </div>
        </form>
    );
};

export default ReviewForm;