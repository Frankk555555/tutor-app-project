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
                            {/* ส่วนแสดงข้อมูลหลัก */}
                            <div>
                                <strong>ติวเตอร์: {app.tutor_first_name} {app.tutor_last_name}</strong>
                                <br />
                                <strong>เวลา:</strong>{' '}
                                {new Date(app.appointment_time).toLocaleString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                                <br />
                                <strong>ระยะเวลา:</strong> {app.duration} นาที
                            </div>

                            {/* ส่วนแสดงสถานะและปุ่ม */}
                            <div className="appointment-actions">
                                <div className='status-price-group'>
                                    <strong>สถานะ:</strong>{' '}
                                    <span className={`status-text status-${app.status}`}>{app.status}</span>
                                    <br />
                                    <strong>ราคา:</strong> {app.total_price} บาท
                                </div>
                                
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
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StudentAppointmentHistory;