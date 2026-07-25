import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from 'date-fns';
import "./TutorDashboard.css";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const recurringDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const statusTranslation = {
    pending: "รอดำเนินการ",
    approved: "ยืนยันแล้ว",
    rejected: "ปฏิเสธ",
    completed: "เสร็จสิ้น"
};

// Skeleton Loader Component
const DashboardSkeleton = () => (
    <div className="skeleton-loader">
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
    </div>
);

const TutorDashboard = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('appointments');
    const [profileData, setProfileData] = useState({ bio: "", education: "", hourly_rate: "", profile_picture: "", subjects: [], levels: [] });
    const [allLevels, setAllLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [newSlot, setNewSlot] = useState({ available_date: '', start_time: '', end_time: '' });
    const [newSubject, setNewSubject] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recurringSlot, setRecurringSlot] = useState({ day_of_week: 'Monday', start_time: '', end_time: '', start_date: '', end_date: '' });

    // --- Data Fetching ---
    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [profileRes, appointmentsRes, availabilityRes, allLevelsRes] = await Promise.all([
                    api.getTutorProfile(),
                    api.getTutorAppointments(),
                    api.getTutorAvailability(),
                    api.getAllLevels()
                ]);

                setProfileData({
                    bio: profileRes.data.profile.bio || "",
                    education: profileRes.data.profile.education || "",
                    hourly_rate: profileRes.data.profile.hourly_rate || "",
                    profile_picture: profileRes.data.profile.profile_picture || "",
                    subjects: profileRes.data.subjects || [],
                    levels: profileRes.data.levels || [],
                });

                setAppointments(appointmentsRes.data);
                setAvailability(availabilityRes.data);
                setAllLevels(allLevelsRes.data);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
                toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    // --- Event Handlers ---
    const handleRecurringSubmit = async (e) => {
        e.preventDefault();
        const { day_of_week, start_time, end_time, start_date, end_date } = recurringSlot;
        if (!start_time || !end_time || !start_date || !end_date) {
            toast.warn('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        const dayIndex = recurringDaysOfWeek.indexOf(day_of_week);
        const slotsToAdd = [];
        let currentDate = new Date(start_date);
        const lastDate = new Date(end_date);
        while (currentDate <= lastDate) {
            if (currentDate.getDay() === dayIndex) {
                slotsToAdd.push({ available_date: format(currentDate, 'yyyy-MM-dd'), start_time, end_time });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        if (slotsToAdd.length === 0) {
            toast.warn('ไม่พบวันที่ตรงกับเงื่อนไขในช่วงที่เลือก');
            return;
        }
        try {
            await Promise.all(slotsToAdd.map(slot => api.addTutorAvailability(slot)));
            toast.success(`เพิ่มตารางเวลาประจำสำเร็จ ${slotsToAdd.length} รายการ!`);
            const availabilityRes = await api.getTutorAvailability();
            setAvailability(availabilityRes.data);
            setRecurringSlot({ day_of_week: 'Monday', start_time: '', end_time: '', start_date: '', end_date: '' });
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการเพิ่มตารางเวลาประจำ');
        }
    };

    const handleAddAvailability = async (e) => {
        e.preventDefault();
        try {
            const response = await api.addTutorAvailability(newSlot);
            const updatedAvailability = [...availability, response.data.newSlot].sort((a, b) => new Date(a.available_date) - new Date(b.available_date));
            setAvailability(updatedAvailability);
            setNewSlot({ available_date: '', start_time: '', end_time: '' });
            toast.success('เพิ่มตารางเวลาสำเร็จ!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'เพิ่มตารางเวลาไม่สำเร็จ');
        }
    };

    const handleDeleteAvailability = async (availabilityId) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณแน่ใจหรือไม่ว่าต้องการลบช่วงเวลานี้?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.deleteTutorAvailability(availabilityId);
                setAvailability(availability.filter(slot => slot.id !== availabilityId));
                toast.success('ลบตารางเวลาสำเร็จ!');
            } catch (error) {
                toast.error('ลบตารางเวลาไม่สำเร็จ');
            }
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.updateAppointmentStatus(id, status);
            setAppointments((apps) => apps.map((app) => (app.id === id ? { ...app, status: status } : app)));
            toast.info(`อัปเดตสถานะเป็น ${status}`);
        } catch (error) {
            toast.error("อัปเดตสถานะไม่สำเร็จ");
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.updateTutorProfile({ bio: profileData.bio, education: profileData.education, hourly_rate: profileData.hourly_rate });
            toast.success("อัปเดตโปรไฟล์สำเร็จ!");
        } catch (error) {
            toast.error("อัปเดตโปรไฟล์ไม่สำเร็จ");
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handlePictureUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            toast.warn("กรุณาเลือกไฟล์รูปภาพก่อน");
            return;
        }
        try {
            const response = await api.uploadProfilePictureForTutor(selectedFile);
            setProfileData({ ...profileData, profile_picture: response.data.filePath });
            toast.success("อัปโหลดรูปโปรไฟล์สำเร็จ!");
            setSelectedFile(null);
        } catch (error) {
            toast.error("อัปโหลดรูปไม่สำเร็จ");
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        try {
            const response = await api.addTutorSubject({ subjectName: newSubject });
            setProfileData((prevData) => ({ ...prevData, subjects: [...prevData.subjects, { id: response.data.subjectId, name: response.data.subjectName }] }));
            setNewSubject("");
            toast.success("เพิ่มวิชาสำเร็จ!");
        } catch (error) {
            toast.error(error.response?.data?.message || "เพิ่มวิชาไม่สำเร็จ");
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        try {
            await api.deleteTutorSubject(subjectId);
            setProfileData((prevData) => ({ ...prevData, subjects: prevData.subjects.filter((s) => s.id !== subjectId) }));
            toast.success("ลบวิชาสำเร็จ!");
        } catch (error) {
            toast.error("ลบวิชาไม่สำเร็จ");
        }
    };
    
    const handleAddLevel = async (e) => {
        e.preventDefault();
        if (!selectedLevel) {
            toast.warn('กรุณาเลือกระดับชั้น');
            return;
        }
        try {
            await api.addTutorLevel({ levelId: selectedLevel });
            const profileRes = await api.getTutorProfile();
            setProfileData(prev => ({ ...prev, levels: profileRes.data.levels }));
            setSelectedLevel('');
            toast.success("เพิ่มระดับชั้นสำเร็จ!");
        } catch (error) {
            toast.error(error.response?.data?.message || "เพิ่มระดับชั้นไม่สำเร็จ");
        }
    };

    const handleDeleteLevel = async (levelId) => {
        try {
            await api.deleteTutorLevel(levelId);
            setProfileData(prev => ({ ...prev, levels: prev.levels.filter(l => l.id !== levelId) }));
            toast.success("ลบระดับชั้นสำเร็จ!");
        } catch (error) {
            toast.error("ลบระดับชั้นไม่สำเร็จ");
        }
    };

    const imageUrl = profileData.profile_picture 
        ? (profileData.profile_picture.startsWith('http') ? profileData.profile_picture : `${API_BASE_URL}/${profileData.profile_picture}`) 
        : "https://via.placeholder.com/150";

    return (
        <main className="tutor-dashboard">
            <h2>จัดการโปรไฟล์ติวเตอร์</h2>

            <nav className="tab-container" role="tablist" aria-label="Dashboard tabs">
                <button 
                    role="tab"
                    className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('appointments')}
                    aria-selected={activeTab === 'appointments'}
                >
                    การนัดหมายและเวลาว่าง
                </button>
                <button 
                    role="tab"
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('profile')}
                    aria-selected={activeTab === 'profile'}
                >
                    ข้อมูลโปรไฟล์และวิชา
                </button>
            </nav>

            {loading ? (
                <DashboardSkeleton />
            ) : (
                <div className="tab-content">
                    {activeTab === 'appointments' && (
                        <>
                            <section className="dashboard-section" aria-labelledby="appointments-heading">
                                <h3 id="appointments-heading">รายการนัดหมาย</h3>
                                {appointments.length === 0 ? (
                                    <div className="empty-state">
                                        <h4>ยังไม่มีรายการนัดหมาย</h4>
                                        <p>เมื่อมีนักเรียนจองเวลาเรียนของคุณ รายการนัดหมายจะปรากฏที่นี่ คุณสามารถตอบรับหรือปฏิเสธคำขอได้</p>
                                    </div>
                                ) : (
                                    <div className="appointment-list">
                                        {appointments.map((app) => (
                                            <article key={app.id} className="appointment-item">
                                                <div className="appointment-info">
                                                    <div className="student-info-row">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                            <circle cx="12" cy="7" r="4"></circle>
                                                        </svg>
                                                        <Link to={`/student/profile/${app.student_user_id}`} className="student-profile-link">
                                                            {app.student_first_name} {app.student_last_name}
                                                        </Link>
                                                    </div>
                                                    <div className="appointment-detail">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                        </svg>
                                                        {new Date(app.appointment_time).toLocaleString('th-TH', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                    <div className="appointment-detail">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                        </svg>
                                                        ระยะเวลา: {app.duration} นาที
                                                    </div>
                                                    <div className="status-container">
                                                        <span className={`status-badge status-${app.status}`}>
                                                            {statusTranslation[app.status] || app.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="appointment-actions">
                                                    {app.status === "pending" && (
                                                        <>
                                                            <button onClick={() => handleUpdateStatus(app.id, "approved")} className="btn-approve">ตอบรับ</button>
                                                            <button onClick={() => handleUpdateStatus(app.id, "rejected")} className="btn-reject">ปฏิเสธ</button>
                                                        </>
                                                    )}
                                                    {app.status === "approved" && (
                                                        <button onClick={() => handleUpdateStatus(app.id, "completed")} className="btn-complete">เสร็จสิ้น</button>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                            
                            <section className="dashboard-section" aria-labelledby="availability-heading">
                                <h3 id="availability-heading">จัดการเวลาว่าง (Availability)</h3>
                                
                                <form onSubmit={handleRecurringSubmit} className="availability-form recurring-form">
                                    <h4>สร้างตารางเวลาประจำสัปดาห์</h4>
                                    <div className="form-group-inline">
                                        <label htmlFor="recurring_day">วันในสัปดาห์</label>
                                        <select id="recurring_day" value={recurringSlot.day_of_week} onChange={(e) => setRecurringSlot({...recurringSlot, day_of_week: e.target.value})}>
                                            {recurringDaysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group-inline">
                                        <label htmlFor="recurring_start">เวลาเริ่มต้น</label>
                                        <input type="time" id="recurring_start" value={recurringSlot.start_time} onChange={(e) => setRecurringSlot({...recurringSlot, start_time: e.target.value})} required />
                                    </div>
                                    <div className="form-group-inline">
                                        <label htmlFor="recurring_end">เวลาสิ้นสุด</label>
                                        <input type="time" id="recurring_end" value={recurringSlot.end_time} onChange={(e) => setRecurringSlot({...recurringSlot, end_time: e.target.value})} required />
                                    </div>
                                    <div className="date-range-group">
                                        <div className="form-group-inline">
                                            <label htmlFor="recurring_start_date">ตั้งแต่วันที่</label>
                                            <input type="date" id="recurring_start_date" value={recurringSlot.start_date} onChange={(e) => setRecurringSlot({...recurringSlot, start_date: e.target.value})} required />
                                        </div>
                                        <div className="form-group-inline">
                                            <label htmlFor="recurring_end_date">ถึงวันที่</label>
                                            <input type="date" id="recurring_end_date" value={recurringSlot.end_date} onChange={(e) => setRecurringSlot({...recurringSlot, end_date: e.target.value})} required />
                                        </div>
                                    </div>
                                    
                                    <button type="submit" className="btn btn-secondary">เพิ่มตารางประจำ</button>
                                </form>
                                
                                <form onSubmit={handleAddAvailability} className="availability-form">
                                    <h4>เพิ่มตารางเวลาเฉพาะวัน</h4>
                                    <div className="form-group-inline">
                                        <label htmlFor="specific_date">วันที่</label>
                                        <input type="date" id="specific_date" value={newSlot.available_date} onChange={(e) => setNewSlot({...newSlot, available_date: e.target.value})} required />
                                    </div>
                                    <div className="form-group-inline">
                                        <label htmlFor="specific_start">เวลาเริ่มต้น</label>
                                        <input type="time" id="specific_start" value={newSlot.start_time} onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})} required />
                                    </div>
                                    <div className="form-group-inline">
                                        <label htmlFor="specific_end">เวลาสิ้นสุด</label>
                                        <input type="time" id="specific_end" value={newSlot.end_time} onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})} required />
                                    </div>
                                    <button type="submit" className="btn btn-secondary">เพิ่มเวลา</button>
                                </form>
                                
                                <ul className="availability-list">
                                    {availability.length > 0 ? availability.map(slot => (
                                        <li key={slot.id}>
                                            <span>
                                                <strong>{new Date(slot.available_date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}:</strong> 
                                                {' '}{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                            </span>
                                            <button onClick={() => handleDeleteAvailability(slot.id)} className="btn-delete-slot" aria-label={`ลบเวลา ${slot.start_time.substring(0, 5)} ถึง ${slot.end_time.substring(0, 5)}`}>
                                                ลบ
                                            </button>
                                        </li>
                                    )) : (
                                        <li style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                                            <p style={{ color: 'var(--color-muted)' }}>ยังไม่มีการกำหนดเวลาว่าง</p>
                                        </li>
                                    )}
                                </ul>
                            </section>
                        </>
                    )}
                    {activeTab === 'profile' && (
                        <>
                            <section className="dashboard-section profile-picture-section" aria-labelledby="profile-picture-heading">
                                <h3 id="profile-picture-heading">รูปโปรไฟล์</h3>
                                <img src={imageUrl} alt="Profile" className="profile-avatar" />
                                <form onSubmit={handlePictureUpload} className="upload-form">
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" aria-label="อัปโหลดรูปภาพใหม่" />
                                    </div>
                                    <button type="submit" className="btn btn-secondary" disabled={!selectedFile} style={{ width: '100%' }}>อัปโหลดรูปภาพ</button>
                                </form>
                            </section>
                            
                            <section className="dashboard-section" aria-labelledby="personal-info-heading">
                                <h3 id="personal-info-heading">ข้อมูลส่วนตัวและเรทราคา</h3>
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="bio">แนะนำตัวเอง (Bio)</label>
                                        <textarea id="bio" name="bio" value={profileData.bio} onChange={handleProfileChange} placeholder="เขียนแนะนำตัว ประสบการณ์ หรือสไตล์การสอนของคุณ..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="education">ประวัติการศึกษา</label>
                                        <input type="text" id="education" name="education" value={profileData.education} onChange={handleProfileChange} placeholder="เช่น ปริญญาตรี คณะวิศวกรรมศาสตร์ มหาวิทยาลัย..." />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="hourly_rate">ราคาต่อชั่วโมง (บาท)</label>
                                        <input type="number" id="hourly_rate" name="hourly_rate" value={profileData.hourly_rate} onChange={handleProfileChange} min="0" placeholder="0" />
                                    </div>
                                    <button type="submit" className="btn">บันทึกข้อมูลส่วนตัว</button>
                                </form>
                            </section>
                            
                            <div className="management-container">
                                <section className="dashboard-section" aria-labelledby="levels-heading">
                                    <h3 id="levels-heading">ระดับชั้นที่สอน</h3>
                                    <div className="chips-container">
                                        {profileData.levels.map((level) => (
                                            <div key={level.id} className="chip">
                                                <span>{level.name}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDeleteLevel(level.id)} 
                                                    className="chip-delete-btn" 
                                                    aria-label={`ลบระดับชั้น ${level.name}`}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        {profileData.levels.length === 0 && <p className="empty-state" style={{ padding: '20px', width: '100%' }}>ยังไม่มีการเพิ่มระดับชั้น</p>}
                                    </div>
                                    <form onSubmit={handleAddLevel} className="availability-form" style={{ padding: 0, border: 'none', background: 'none' }}>
                                        <div className="form-group-inline" style={{ width: '100%' }}>
                                            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} aria-label="เลือกระดับชั้น">
                                                <option value="">-- เลือกระดับชั้น --</option>
                                                {allLevels.map(level => (
                                                    <option key={level.id} value={level.id}>{level.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>เพิ่มระดับชั้น</button>
                                    </form>
                                </section>
                                
                                <section className="dashboard-section" aria-labelledby="subjects-heading">
                                    <h3 id="subjects-heading">วิชาที่สอน</h3>
                                    <div className="chips-container">
                                        {profileData.subjects.map((subject) => (
                                            <div key={subject.id} className="chip">
                                                <span>{subject.name}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDeleteSubject(subject.id)} 
                                                    className="chip-delete-btn" 
                                                    aria-label={`ลบวิชา ${subject.name}`}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        {profileData.subjects.length === 0 && <p className="empty-state" style={{ padding: '20px', width: '100%' }}>ยังไม่มีการเพิ่มวิชา</p>}
                                    </div>
                                    <form onSubmit={handleAddSubject} className="availability-form" style={{ padding: 0, border: 'none', background: 'none' }}>
                                        <div className="form-group-inline" style={{ width: '100%' }}>
                                            <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="เช่น ฟิสิกส์ ม.ปลาย" aria-label="ชื่อวิชาที่สอน" />
                                        </div>
                                        <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>เพิ่มวิชา</button>
                                    </form>
                                </section>
                            </div>
                        </>
                    )}
                </div>
            )}
        </main>
    );
};

export default TutorDashboard;