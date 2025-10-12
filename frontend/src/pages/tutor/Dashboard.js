import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from 'date-fns'; // **[แก้ไข]** เพิ่ม import ที่ขาดหายไป
import "./TutorDashboard.css";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:5000";
const recurringDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TutorDashboard = () => {
    const [profileData, setProfileData] = useState({
        bio: "",
        education: "",
        hourly_rate: "",
        profile_picture: "",
        subjects: [],
    });

    const [appointments, setAppointments] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [newSlot, setNewSlot] = useState({ available_date: '', start_time: '', end_time: '' });
    const [newSubject, setNewSubject] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recurringSlot, setRecurringSlot] = useState({
        day_of_week: 'Monday',
        start_time: '',
        end_time: '',
        start_date: '',
        end_date: ''
    });

    // **[แก้ไข]** ย้ายฟังก์ชันทั้งหมดออกมาไว้นอก useEffect
    const handleRecurringSubmit = async (e) => {
        e.preventDefault();
        const { day_of_week, start_time, end_time, start_date, end_date } = recurringSlot;

        if (!start_time || !end_time || !start_date || !end_date) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        const dayIndex = recurringDaysOfWeek.indexOf(day_of_week);
        const slotsToAdd = [];
        let currentDate = new Date(start_date);
        const lastDate = new Date(end_date);

        while (currentDate <= lastDate) {
            if (currentDate.getDay() === dayIndex) {
                slotsToAdd.push({
                    available_date: format(currentDate, 'yyyy-MM-dd'),
                    start_time,
                    end_time,
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (slotsToAdd.length === 0) {
            toast.error('ไม่พบวันที่ตรงกับเงื่อนไขในช่วงที่เลือก');
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

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [profileRes, appointmentsRes, availabilityRes] = await Promise.all([
                    api.getTutorProfile(),
                    api.getTutorAppointments(),
                    api.getTutorAvailability()
                ]);

                setProfileData({
                    bio: profileRes.data.profile.bio || "",
                    education: profileRes.data.profile.education || "",
                    hourly_rate: profileRes.data.profile.hourly_rate || "",
                    profile_picture: profileRes.data.profile.profile_picture || "",
                    subjects: profileRes.data.subjects || [],
                });

                setAppointments(appointmentsRes.data);
                setAvailability(availabilityRes.data);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
                toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const handleAddAvailability = async (e) => {
        e.preventDefault();
        try {
            const response = await api.addTutorAvailability(newSlot);
            const updatedAvailability = [...availability, response.data.newSlot].sort((a, b) => new Date(a.available_date) - new Date(b.available_date));
            setAvailability(updatedAvailability);
            setNewSlot({ available_date: '', start_time: '', end_time: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'เพิ่มตารางเวลาไม่สำเร็จ');
        }
    };

    const handleDeleteAvailability = async (availabilityId) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบช่วงเวลานี้?')) {
            try {
                await api.deleteTutorAvailability(availabilityId);
                setAvailability(availability.filter(slot => slot.id !== availabilityId));
            } catch (error) {
                toast.error('ลบตารางเวลาไม่สำเร็จ');
            }
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.updateAppointmentStatus(id, status);
            setAppointments((apps) =>
                apps.map((app) => (app.id === id ? { ...app, status: status } : app))
            );
        } catch (error) {
            toast.error("อัปเดตสถานะไม่สำเร็จ");
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        toast.done("");
        try {
            await api.updateTutorProfile({
                bio: profileData.bio,
                education: profileData.education,
                hourly_rate: profileData.hourly_rate,
            });
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
            toast.error("กรุณาเลือกไฟล์รูปภาพก่อน");
            return;
        }
        toast.done("");
        try {
            const response = await api.uploadProfilePictureForTutor(selectedFile);
            setProfileData({
                ...profileData,
                profile_picture: response.data.filePath,
            });
            toast.success("อัปโหลดรูปโปรไฟล์สำเร็จ!");
            setSelectedFile(null);
        } catch (error) {
            toast.error("อัปโหลดรูปไม่สำเร็จ");
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        toast.done("");
        try {
            const response = await api.addTutorSubject({ subjectName: newSubject });
            setProfileData((prevData) => ({
                ...prevData,
                subjects: [
                    ...prevData.subjects,
                    { id: response.data.subjectId, name: response.data.subjectName },
                ],
            }));
            setNewSubject("");
            toast.success("เพิ่มวิชาสำเร็จ!");
        } catch (error) {
            toast.error(error.response?.data?.message || "เพิ่มวิชาไม่สำเร็จ");
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        toast.done("");
        try {
            await api.deleteTutorSubject(subjectId);
            setProfileData((prevData) => ({
                ...prevData,
                subjects: prevData.subjects.filter((s) => s.id !== subjectId),
            }));
            toast.success("ลบวิชาสำเร็จ!");
        } catch (error) {
            toast.error("ลบวิชาไม่สำเร็จ");
        }
    };


    if (loading) return <Spinner></Spinner>;

    const imageUrl = profileData.profile_picture
        ? `${API_BASE_URL}/${profileData.profile_picture}`
        : "https://via.placeholder.com/150";

    return (
        <div className="tutor-dashboard">
            <h2>จัดการโปรไฟล์ติวเตอร์</h2>
            <div className="dashboard-section">
                <h3>รายการนัดหมาย</h3>
                {appointments.length === 0 ? (
                    <p>ยังไม่มีรายการนัดหมาย</p>
                ) : (
                    <ul className="appointment-list">
                        {appointments.map((app) => (
                            <li key={app.id} className={`appointment-item status-${app.status}`}>
                                <div>
                                    <strong>นักเรียน:</strong> {app.student_first_name} {app.student_last_name} <br />
                                    <strong>เวลา:</strong> {new Date(app.appointment_time).toLocaleString('th-TH')} <br />
                                    <strong>สถานะ:</strong> <span className={`status-text status-${app.status}`}>{app.status}</span>
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
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="dashboard-section">
                <h3>จัดการตารางเวลาว่าง</h3>
                
                <form onSubmit={handleRecurringSubmit} className="availability-form recurring-form">
                    <h4>สร้างตารางเวลาแบบประจำ</h4>
                    <select value={recurringSlot.day_of_week} onChange={(e) => setRecurringSlot({...recurringSlot, day_of_week: e.target.value})}>
                        {recurringDaysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                    <input type="time" value={recurringSlot.start_time} onChange={(e) => setRecurringSlot({...recurringSlot, start_time: e.target.value})} required />
                    <span>-</span>
                    <input type="time" value={recurringSlot.end_time} onChange={(e) => setRecurringSlot({...recurringSlot, end_time: e.target.value})} required />
                    <label>ตั้งแต่วันที่:</label>
                    <input type="date" value={recurringSlot.start_date} onChange={(e) => setRecurringSlot({...recurringSlot, start_date: e.target.value})} required />
                    <label>ถึงวันที่:</label>
                    <input type="date" value={recurringSlot.end_date} onChange={(e) => setRecurringSlot({...recurringSlot, end_date: e.target.value})} required />
                    <button type="submit" className="btn btn-secondary">เพิ่มตารางประจำ</button>
                </form>

                <hr className="divider" />
                
                <form onSubmit={handleAddAvailability} className="availability-form">
                    <h4>เพิ่มตารางเวลาทีละวัน</h4>
                    <input 
                        type="date" 
                        value={newSlot.available_date} 
                        onChange={(e) => setNewSlot({...newSlot, available_date: e.target.value})} 
                        required 
                    />
                    <input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})} required />
                    <span>-</span>
                    <input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})} required />
                    <button type="submit" className="btn">เพิ่มเวลา</button>
                </form>

                <ul className="availability-list">
                    {availability.length > 0 ? availability.map(slot => (
                        <li key={slot.id}>
                            <span>
                                <strong>
                                    {new Date(slot.available_date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}:
                                </strong> 
                                {' '}{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </span>
                            <button onClick={() => handleDeleteAvailability(slot.id)} className="btn-delete-slot">ลบ</button>
                        </li>
                    )) : <p>ยังไม่มีการกำหนดเวลาว่าง</p>}
                </ul>
            </div>
            
            <div className="dashboard-section profile-picture-section">
                <h3>รูปโปรไฟล์</h3>
                <img src={imageUrl} alt="Profile" className="profile-avatar" />
                <form onSubmit={handlePictureUpload}>
                    <div className="form-group">
                        <label>เลือกรูปภาพใหม่</label>
                        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </div>
                    <button type="submit" className="btn" disabled={!selectedFile}>อัปโหลดรูปภาพ</button>
                </form>
            </div>

            <form onSubmit={handleProfileSubmit} className="dashboard-section">
                <h3>ข้อมูลส่วนตัวและราคา</h3>
                <div className="form-group">
                    <label>แนะนำตัวเอง (Bio)</label>
                    <textarea name="bio" value={profileData.bio} onChange={handleProfileChange}></textarea>
                </div>
                <div className="form-group">
                    <label>ประวัติการศึกษา</label>
                    <input type="text" name="education" value={profileData.education} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                    <label>ราคาต่อชั่วโมง (บาท)</label>
                    <input type="number" name="hourly_rate" value={profileData.hourly_rate} onChange={handleProfileChange} />
                </div>
                <button type="submit" className="btn">บันทึกข้อมูลส่วนตัว</button>
            </form>

            <div className="dashboard-section">
                <h3>วิชาที่สอน</h3>
                <ul className="subject-list">
                    {profileData.subjects.map((subject) => (
                        <li key={subject.id}>
                            {subject.name}
                            <button onClick={() => handleDeleteSubject(subject.id)} className="delete-btn">ลบ</button>
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleAddSubject} className="add-subject-form">
                    <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="เช่น ฟิสิกส์ ม.ปลาย" />
                    <button type="submit" className="btn">เพิ่มวิชา</button>
                </form>
            </div>
        </div>
    );
};

export default TutorDashboard;