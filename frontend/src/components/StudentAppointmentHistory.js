import React, { useState, useEffect } from 'react';
import api from '../services/api';

// รับ onOpenReviewModal เข้ามาเป็น Prop
const StudentAppointmentHistory = ({ onOpenReviewModal }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.getStudentAppointments();
                setAppointments(response.data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลการนัดหมายได้');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="dashboard-section">
            <h3>ประวัติการนัดหมาย</h3>
            {appointments.length === 0 ? (
                <p>คุณยังไม่มีรายการนัดหมาย</p>
            ) : (
                <ul className="appointment-list">
                    {appointments.map((app) => (
                        <li key={app.id} className={`appointment-item status-${app.status}`}>
                            <div className="appointment-details">
                                <h4 className="appointment-tutor-name">
                                    ติวเตอร์: {app.tutor_first_name} {app.tutor_last_name}
                                </h4>
                                <div className="appointment-meta">
                                    <span className="appointment-time">
                                        <i className="icon-calendar"></i>{' '}
                                        {new Date(app.appointment_time).toLocaleString('th-TH', {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                    <span className="appointment-duration">
                                        <i className="icon-clock"></i> ระยะเวลา: {app.duration} นาที
                                    </span>
                                </div>
                            </div>

                            <div className="appointment-actions">
                                <div className="appointment-price-container">
                                    <span className="action-label">ราคา</span>
                                    <span className="appointment-price">฿{app.total_price}</span>
                                </div>
                                
                                <div className="appointment-status-container">
                                    <span className="action-label">สถานะ</span>
                                    <div className="status-and-button">
                                        <span className={`status-text status-${app.status}`}>{app.status}</span>
                                        {/* ปุ่ม "ให้คะแนน" จะแสดงผลตามเงื่อนไข */}
                                        {app.status === 'completed' && !app.has_been_reviewed && (
                                            <button
                                                onClick={() => onOpenReviewModal(app)}
                                                className="btn-review"
                                            >
                                                ให้คะแนน
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StudentAppointmentHistory;