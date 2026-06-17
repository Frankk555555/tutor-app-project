import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StudentEditProfile = () => {
    const [profile, setProfile] = useState({ first_name: '', last_name: '', profile_picture: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.getStudentProfile();
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("ไม่สามารถโหลดข้อมูลได้");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.done('');
        try {
            await api.updateStudentProfile({
                firstName: profile.first_name,
                lastName: profile.last_name
            });
            toast.success('อัปเดตข้อมูลสำเร็จ!');
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handlePictureUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        toast.done('');
        try {
            const response = await api.uploadProfilePictureForStudent(selectedFile);
            setProfile({ ...profile, profile_picture: response.data.filePath });
            toast.success('อัปโหลดรูปภาพสำเร็จ!');
            setSelectedFile(null);
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        }
    };

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;

    const imageUrl = profile.profile_picture
        ? `${API_BASE_URL}/${profile.profile_picture}`
        : 'https://via.placeholder.com/150';

    return (
        <>
            <div className="dashboard-section profile-picture-section">
                <h3>รูปโปรไฟล์</h3>
                <img src={imageUrl} alt="Profile" className="profile-avatar" />
                <form onSubmit={handlePictureUpload}>
                    <div className="form-group">
                        <label>เลือกรูปภาพใหม่</label>
                        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </div>
                    <button type="submit" className="btn" disabled={!selectedFile}>อัปโหลดรูป</button>
                </form>
            </div>

            <form onSubmit={handleSubmit} className="dashboard-section">
                <h3>ข้อมูลส่วนตัว</h3>
                <div className="form-group">
                    <label htmlFor="first_name">ชื่อจริง</label>
                    <input type="text" id="first_name" name="first_name" value={profile.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">นามสกุล</label>
                    <input type="text" id="last_name" name="last_name" value={profile.last_name} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-save">บันทึกข้อมูล</button>
            </form>
        </>
    );
};

export default StudentEditProfile;