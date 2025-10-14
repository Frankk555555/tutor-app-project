import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import './StudentProfilePage.css'; // สร้างไฟล์ CSS นี้ด้วย

const API_BASE_URL = 'http://localhost:5000';

const StudentProfilePage = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.getStudentProfileById(id);
                setStudent(res.data);
            } catch (error) {
                console.error("Failed to fetch student profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (loading) return <Spinner />;
    if (!student) return <p>ไม่พบข้อมูลนักเรียน</p>;

    const imageUrl = student.profile_picture
        ? `${API_BASE_URL}/${student.profile_picture}`
        : 'https://via.placeholder.com/150';

    return (
        <div className="student-profile-container">
            <div className="profile-card">
                <img src={imageUrl} alt="Student Profile" className="profile-avatar" />
                <h1>{student.first_name} {student.last_name}</h1>
                <p>เป็นสมาชิกเมื่อ: {new Date(student.created_at).toLocaleDateString('th-TH')}</p>
            </div>
        </div>
    );
};

export default StudentProfilePage;