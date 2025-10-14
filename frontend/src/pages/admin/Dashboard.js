import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './AdminDashboard.css';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [appointmentFilter, setAppointmentFilter] = useState(''); 

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRes = await api.adminGetAllUsers();
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const appointmentsRes = await api.adminGetAllAppointments({ status: appointmentFilter });
                setAppointments(appointmentsRes.data);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [appointmentFilter]);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) {
            await api.adminDeleteUser(userId);
            const usersRes = await api.adminGetAllUsers();
            setUsers(usersRes.data);
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        
        try {
            await api.adminUpdateUser(editingUser.id, {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                email: editingUser.email,
                role: editingUser.role,
            });
            toast.success('แก้ไขข้อมูลแล้ว');
            handleCloseEditModal();
            const usersRes = await api.adminGetAllUsers();
            setUsers(usersRes.data);
        } catch (error) {
            toast.error('อัปเดตข้อมูลไม่สำเร็จ');
        }
    };

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            
            <div className="admin-section">
                <h3>ตรวจสอบการนัดหมายทั้งหมด ({appointments.length} รายการ)</h3>
                
                <div className="filter-container">
                    <label htmlFor="status-filter">สถานะ: </label>
                    <select 
                        id="status-filter"
                        value={appointmentFilter}
                        onChange={(e) => setAppointmentFilter(e.target.value)}
                    >
                        <option value="">ทั้งหมด</option>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="approved">ตอบรับแล้ว</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="rejected">ปฏิเสธ</option>
                    </select>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>นักเรียน</th>
                            <th>ติวเตอร์</th>
                            <th>เวลา</th>
                            <th>ระยะเวลา</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(app => (
                            <tr key={app.id}>
                                <td>{app.id}</td>
                                <td>{app.student_first_name} {app.student_last_name}</td>
                                <td>{app.tutor_first_name} {app.tutor_last_name}</td>
                                <td>{new Date(app.appointment_time).toLocaleString('th-TH')}</td>
                                <td>{app.duration} นาที</td> {/* <-- [เพิ่ม] แสดงข้อมูล */}
                                <td>
                                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                    {/* [เพิ่ม] ไอคอนสำหรับดูข้อความ */}
                                    {app.student_message && (
                                        <span className="message-tooltip" title={app.student_message}> ⓘ</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-section">
                <h3>จัดการผู้ใช้ ({users.length} คน)</h3>
                <table>
                   <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>ชื่อ</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>{user.first_name} {user.last_name}</td>
                                <td>{user.role}</td>
                                <td className="action-buttons">
                                    <button onClick={() => handleOpenEditModal(user)} className="btn-edit">แก้ไข</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="btn-delete">ลบ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
                {editingUser && (
                    <form onSubmit={handleSaveUser}>
                        <h3>แก้ไขข้อมูลผู้ใช้ ID: {editingUser.id}</h3>
                        <div className="form-group">
                            <label>ชื่อจริง</label>
                            <input 
                                type="text" 
                                value={editingUser.first_name}
                                onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>นามสกุล</label>
                            <input 
                                type="text" 
                                value={editingUser.last_name}
                                onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select 
                                value={editingUser.role}
                                // --- [แก้ไข] เปลี่ยนจาก e.gantt.value เป็น e.target.value ---
                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            >
                                <option value="student">student</option>
                                <option value="tutor">tutor</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={handleCloseEditModal}>ยกเลิก</button>
                            <button type="submit" className="btn">บันทึก</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;