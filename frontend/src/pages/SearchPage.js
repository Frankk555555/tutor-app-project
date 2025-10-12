import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TutorCard from '../components/TutorCard';
import './SearchPage.css';

const SearchPage = () => {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    subjectId: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
  });
  const [loading, setLoading] = useState(true);

  // 1. [แก้ไข] useEffect นี้จะทำหน้าที่แค่ "โหลดข้อมูลเริ่มต้น" เท่านั้น
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลติวเตอร์ทั้งหมด (โดยไม่ใช้ filter) และรายชื่อวิชา
        const [tutorsRes, subjectsRes] = await Promise.all([
          api.getTutors({}), // ส่ง object ว่างไปเพื่อโหลดทั้งหมด
          api.getAllSubjects()
        ]);
        setTutors(tutorsRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []); // dependency array ว่างถูกต้องแล้ว เพราะเราต้องการให้ทำงานแค่ครั้งเดียว

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // 2. [แก้ไข] ฟังก์ชันนี้จะรับผิดชอบการ "ค้นหา" ทั้งหมด
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        <p>กำลังค้นหา...</p>
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