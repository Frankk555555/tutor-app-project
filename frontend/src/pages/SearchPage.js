import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TutorCard from '../components/TutorCard';
import Spinner from '../components/Spinner'; // Import Spinner มาใช้งาน
import './SearchPage.css';
import { useSearchParams } from 'react-router-dom';

const SearchPage = () => {
    const [tutors, setTutors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [levels, setLevels] = useState([]);
    const [filters, setFilters] = useState({
        query: '',
        subjectId: '',
        levelId: '',
        minPrice: '',
        maxPrice: '',
        sortBy: '',
    });
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const loadStaticData = async () => {
            try {
                const [subjectsRes, levelsRes] = await Promise.all([
                    api.getAllSubjects(),
                    api.getAllLevels()
                ]);
                setSubjects(subjectsRes.data);
                setLevels(levelsRes.data);
            } catch (error) {
                console.error("Failed to load static data", error);
            }
        };
        loadStaticData();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // สร้าง object filter จาก URL parameters
                const currentFilters = {
                    query: searchParams.get('query') || '',
                    subjectId: searchParams.get('subjectId') || '',
                    levelId: searchParams.get('levelId') || '',
                    minPrice: searchParams.get('minPrice') || '',
                    maxPrice: searchParams.get('maxPrice') || '',
                    sortBy: searchParams.get('sortBy') || '',
                };

                // อัปเดต state ของ filter ให้ตรงกับ URL
                setFilters(currentFilters);
                
                // ยิง API ด้วย filter จาก URL
                const tutorsRes = await api.getTutors(currentFilters);
                setTutors(tutorsRes.data);
            } catch (error) {
                console.error("Failed to fetch tutors", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [searchParams]);

    // ฟังก์ชันสำหรับอัปเดตค่าใน state 'filters'
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // ฟังก์ชันนี้จะรับผิดชอบการ "ค้นหา" ทั้งหมด
    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchParams(filters);
        try {
            // ส่งค่า filters ล่าสุดไปกับ API call
            const response = await api.getTutors(filters);
            setTutors(response.data);
        } catch (error) {
            console.error("Failed to fetch tutors", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>ค้นหาติวเตอร์</h2>

            <form onSubmit={handleSearch} className="filter-form">
                <div className="filter-group">
                    <select name="subjectId" value={filters.subjectId} onChange={handleFilterChange}>
                        <option value="">ทุกวิชา</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                    <select name="levelId" value={filters.levelId} onChange={handleFilterChange}>
                        <option value="">ทุกระดับชั้น</option>
                        {levels.map(level => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="ราคาต่ำสุด"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="ราคาสูงสุด"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                    />
                    <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                        <option value="">เรียงลำดับ</option>
                        <option value="price_asc">ราคา: น้อยไปมาก</option>
                        <option value="price_desc">ราคา: มากไปน้อย</option>
                    </select>
                </div>
                <button type="submit" className="btn">ค้นหา</button>
            </form>

            {loading ? (
                <Spinner />
            ) : (
                <div className="tutor-grid">
                    {tutors.length > 0 ? (
                        tutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)
                    ) : (
                        <p>ไม่พบติวเตอร์ตามเงื่อนไขที่กำหนด</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;