import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';
import './TutorProfilePage.css';
import Spinner from '../components/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TutorProfilePage = () => {
    const { id } = useParams();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const response = await api.getTutorById(id);
                setTutor(response.data);
            } catch (err) {
                setError('ไม่พบข้อมูลติวเตอร์');
            } finally {
                setLoading(false);
            }
        };
        fetchTutor();
    }, [id]);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleBookAppointment = async (details) => {
        try {
            await api.createAppointment({ tutorId: tutor.id, ...details });
            alert('ส่งคำขอนัดหมายสำเร็จ!');
            handleCloseModal();
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการนัดหมาย');
        }
    };

    const renderActionButtons = () => {
        if (!loggedInUser) return null;
        if (loggedInUser.role === 'tutor' && loggedInUser.userId === tutor.id) {
            return <Link to="/tutor/dashboard" className="btn profile-action-btn">แก้ไขโปรไฟล์</Link>;
        }
        if (loggedInUser.role === 'student') {
            return <button className="btn profile-action-btn" onClick={handleOpenModal}>นัดหมายติวเตอร์</button>;
        }
        return null;
    };

    if (loading) return <Spinner></Spinner>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!tutor) return <p>ไม่พบข้อมูลติวเตอร์</p>;

    const imageUrl = tutor.profile_picture 
        ? (tutor.profile_picture.startsWith('http') ? tutor.profile_picture : `${API_BASE_URL}/${tutor.profile_picture}`)
        : 'https://via.placeholder.com/150';

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={imageUrl} alt={tutor.first_name} />
                <div className="profile-info">
                    <h1>{tutor.first_name} {tutor.last_name}</h1>
                    
                    {tutor.reviews && (
                        <div className="rating-summary">
                            <span className="star-icon">★</span>
                            <strong>{tutor.averageRating}</strong>
                            <span>({tutor.reviews.length} รีวิว)</span>
                        </div>
                    )}
                    
                    <p className="hourly-rate">ราคา: {tutor.hourly_rate} บาท/ชั่วโมง</p>
                    {renderActionButtons()}
                </div>
            </div>

            <div className="profile-details">
                <div className="detail-section">
                    <h3>เกี่ยวกับติวเตอร์</h3>
                    <p>{tutor.bio || 'ไม่มีข้อมูล'}</p>
                </div>
                
                {/* ----- [แก้ไข] เติมโค้ดส่วนที่หายไป ----- */}
                <div className="detail-section">
                    <h3>วิชาที่สอน</h3>
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                        <ul className="subjects-list">
                            {tutor.subjects.map(s => <li key={s.id}>{s.name}</li>)}
                        </ul>
                    ) : (
                        <p>ยังไม่มีวิชาที่สอน</p>
                    )}
                </div>
                
                <div className="detail-section">
                    <h3>รีวิวจากนักเรียน</h3>
                    {tutor.reviews && tutor.reviews.length > 0 ? (
                        <ul className="review-list">
                            {tutor.reviews.map((review, index) => (
                                <li key={index} className="review-item">
                                    <div className="review-header">
                                        <strong>{review.student_name}</strong>
                                        <span className="review-rating">
                                            {[...Array(review.rating)].map((e, i) => <span key={i} className="star-icon">★</span>)}
                                        </span>
                                    </div>
                                    <p className="review-comment">{review.comment || 'ไม่มีความคิดเห็น'}</p>
                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString('th-TH')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>ยังไม่มีรีวิว</p>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <h2>นัดหมายติวเตอร์: {tutor.first_name}</h2>
                <BookingForm tutor={tutor} onBook={handleBookAppointment} />
            </Modal>
        </div>
    );
};

export default TutorProfilePage;