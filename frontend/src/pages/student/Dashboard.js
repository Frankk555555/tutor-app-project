import React, { useState } from 'react';
import StudentAppointmentHistory from '../../components/StudentAppointmentHistory';
import StudentEditProfile from '../../components/StudentEditProfile';
import Modal from '../../components/Modal';
import ReviewForm from '../../components/ReviewForm';
import api from '../../services/api';
import './StudentDashboard.css';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    // 1. [เพิ่ม] สร้าง State ใหม่เพื่อใช้เป็นตัวกระตุ้นการรีเฟรช
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleOpenReviewModal = (appointment) => {
        setSelectedAppointment(appointment);
        setReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setReviewModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            await api.createReview(reviewData);
            toast.success('ส่งรีวิวสำเร็จ!');
            handleCloseReviewModal();
            
            // 2. [เพิ่ม] เมื่อรีวิวสำเร็จ ให้เปลี่ยนค่า State เพื่อส่งสัญญาณ
            setRefreshTrigger(prev => prev + 1); 

        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการส่งรีวิว');
            console.error(error);
        }
    };

    return (
        <div className="student-dashboard">
            <h2>แดชบอร์ดของ {user?.name || 'นักเรียน'}</h2>
            
            <div className="tab-container">
                <button
                    className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    ประวัติการนัดหมาย
                </button>
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    แก้ไขโปรไฟล์
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'appointments' && (
                    // 3. [เพิ่ม] ส่งตัวกระตุ้นลงไปเป็น prop ที่ชื่อ `key`
                    // เมื่อ `key` เปลี่ยน React จะบังคับให้ Component นี้โหลดใหม่ทั้งหมด
                    <StudentAppointmentHistory 
                        key={refreshTrigger} 
                        onOpenReviewModal={handleOpenReviewModal} 
                    />
                )}
                {activeTab === 'profile' && <StudentEditProfile />}
            </div>

            <Modal isOpen={isReviewModalOpen} onClose={handleCloseReviewModal}>
                <h2>ให้คะแนนและรีวิว</h2>
                {selectedAppointment && (
                    <ReviewForm
                        appointment={selectedAppointment}
                        onSubmit={handleReviewSubmit}
                        onClose={handleCloseReviewModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default StudentDashboard;