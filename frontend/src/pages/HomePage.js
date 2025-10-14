import api from '../services/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // [แก้ไข] เปลี่ยนมาใช้ Link แทน useNavigate
import TutorCard from '../components/TutorCard'; // Import TutorCard
import Spinner from '../components/Spinner';
import './HomePage.css';

const HomePage = () => {

    const [featuredTutors, setFeaturedTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await api.getFeaturedTutors();
                setFeaturedTutors(res.data);
            } catch (error) {
                console.error("Failed to fetch featured tutors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <>
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">ค้นหาติวเตอร์ที่ใช่สำหรับคุณ</h1>
                    <p className="hero-subtitle">
                        แพลตฟอร์มค้นหาติวเตอร์คุณภาพ ทุกวิชา ทุกระดับชั้น
                    </p>
                    <Link to="/search" className="hero-cta-button">
                        เริ่มค้นหาติวเตอร์
                    </Link>
                </div>
            </section>

            <section className="featured-tutors-section">
                <h2 className="section-title">ติวเตอร์แนะนำ</h2>
                {loading ? (
                    <Spinner />
                ) : (
                    <div className="tutor-grid">
                        {featuredTutors.map(tutor => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))}
                    </div>
                )}
            </section>

            {/* ส่วน "มันทำงานอย่างไร?" */}
            <section className="how-it-works-section">
                <h2 className="section-title">ใช้งานง่ายๆ ใน 3 ขั้นตอน</h2>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-icon">🔍</div>
                        <h3>1. ค้นหา</h3>
                        <p>ค้นหาติวเตอร์ที่ใช่จากวิชา, ระดับชั้น, และราคาที่คุณต้องการ</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon">📅</div>
                        <h3>2. นัดหมาย</h3>
                        <p>ดูตารางเวลาว่างและทำการนัดหมายผ่านระบบออนไลน์ได้ทันที</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon">🎓</div>
                        <h3>3. เริ่มเรียน</h3>
                        <p>เริ่มต้นการเรียนรู้กับติวเตอร์คุณภาพตามวันเวลาที่คุณสะดวก</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;