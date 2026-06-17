import api from '../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // [แก้ไข] เปลี่ยนมาใช้ useNavigate
import TutorCard from '../components/TutorCard'; // Import TutorCard
import Spinner from '../components/Spinner';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredTutors, setFeaturedTutors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tutorsRes, subjectsRes] = await Promise.all([
                    api.getFeaturedTutors(),
                    api.getAllSubjects()
                ]);
                setFeaturedTutors(tutorsRes.data);
                setSubjects(subjectsRes.data);
            } catch (error) {
                console.error("Failed to fetch homepage data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (selectedSubject) params.append('subjectId', selectedSubject);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <>
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">ค้นหาติวเตอร์ที่ใช่สำหรับคุณ</h1>
                    <p className="hero-subtitle">
                        แพลตฟอร์มค้นหาติวเตอร์คุณภาพ ทุกวิชา ทุกระดับชั้น
                    </p>
                    
                    {/* Homepage Search Bar Form */}
                    <form onSubmit={handleSearchSubmit} className="hero-search-form">
                        <div className="hero-search-inputs">
                            <div className="search-input-wrapper">
                                <span className="search-input-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="ค้นหาติวเตอร์ (เช่น ชื่อ, วิชา...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="hero-search-input"
                                />
                            </div>
                            <div className="search-select-wrapper">
                                <span className="search-select-icon">📚</span>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="hero-search-select"
                                >
                                    <option value="">ทุกวิชา</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="hero-search-button">
                                ค้นหาติวเตอร์
                            </button>
                        </div>
                    </form>
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
                        <div className="step-icon-svg-container">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg-icon">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <h3>1. ค้นหา</h3>
                        <p>ค้นหาติวเตอร์ที่ใช่จากวิชา, ระดับชั้น, และราคาที่คุณต้องการ</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon-svg-container">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg-icon">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <h3>2. นัดหมาย</h3>
                        <p>ดูตารางเวลาว่างและทำการนัดหมายผ่านระบบออนไลน์ได้ทันที</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon-svg-container">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg-icon">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                            </svg>
                        </div>
                        <h3>3. เริ่มเรียน</h3>
                        <p>เริ่มต้นการเรียนรู้กับติวเตอร์คุณภาพตามวันเวลาที่คุณสะดวก</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;