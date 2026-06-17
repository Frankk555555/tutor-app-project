import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import './AdminDashboard.css';
import { toast } from 'react-toastify';

const statusLabels = {
    pending: 'รอดำเนินการ',
    approved: 'ตอบรับแล้ว',
    completed: 'เสร็จสิ้น',
    rejected: 'ปฏิเสธ',
};

const roleLabels = {
    student: 'นักเรียน',
    tutor: 'ติวเตอร์',
    admin: 'ผู้ดูแล',
};

const formatAppointmentTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('th-TH');
};

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const [appointmentFilter, setAppointmentFilter] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRes = await api.adminGetAllUsers();
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Failed to fetch users', error);
                toast.error('ไม่สามารถโหลดรายชื่อผู้ใช้ได้');
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            setAppointmentsLoading(true);
            try {
                const appointmentsRes = await api.adminGetAllAppointments({ status: appointmentFilter });
                setAppointments(appointmentsRes.data);
            } catch (error) {
                console.error('Failed to fetch appointments', error);
                toast.error('ไม่สามารถโหลดรายการนัดหมายได้');
            } finally {
                setAppointmentsLoading(false);
            }
        };
        fetchAppointments();
    }, [appointmentFilter]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return;

        setDeletingUserId(userId);
        try {
            await api.adminDeleteUser(userId);
            const usersRes = await api.adminGetAllUsers();
            setUsers(usersRes.data);
            toast.success('ลบผู้ใช้แล้ว');
        } catch (error) {
            toast.error('ลบผู้ใช้ไม่สำเร็จ');
        } finally {
            setDeletingUserId(null);
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        if (isSaving) return;
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!editingUser || isSaving) return;

        setIsSaving(true);
        try {
            await api.adminUpdateUser(editingUser.id, {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                email: editingUser.email,
                role: editingUser.role,
            });
            toast.success('แก้ไขข้อมูลแล้ว');
            setIsEditModalOpen(false);
            setEditingUser(null);
            const usersRes = await api.adminGetAllUsers();
            setUsers(usersRes.data);
        } catch (error) {
            toast.error('อัปเดตข้อมูลไม่สำเร็จ');
        } finally {
            setIsSaving(false);
        }
    };

    const appointmentCountLabel = appointmentsLoading
        ? 'กำลังโหลด…'
        : `${appointments.length} รายการ`;

    const userCountLabel = usersLoading
        ? 'กำลังโหลด…'
        : `${users.length} คน`;

    return (
        <div className="admin-dashboard">
            <header className="admin-page-header">
                <h2>แดชบอร์ดผู้ดูแลระบบ</h2>
                <p>ตรวจสอบการนัดหมายและจัดการบัญชีผู้ใช้ในแพลตฟอร์ม</p>
            </header>

            <section className="admin-section" aria-labelledby="appointments-heading">
                <div className="section-header">
                    <div className="section-title-block">
                        <h3 id="appointments-heading">การนัดหมาย</h3>
                        <span
                            className={`section-count${appointmentsLoading ? ' is-loading' : ''}`}
                            aria-live="polite"
                        >
                            {appointmentCountLabel}
                        </span>
                    </div>
                    <div className="filter-container">
                        <label htmlFor="status-filter">สถานะ</label>
                        <select
                            id="status-filter"
                            value={appointmentFilter}
                            onChange={(e) => setAppointmentFilter(e.target.value)}
                            disabled={appointmentsLoading}
                            aria-busy={appointmentsLoading}
                        >
                            <option value="">ทั้งหมด</option>
                            <option value="pending">รอดำเนินการ</option>
                            <option value="approved">ตอบรับแล้ว</option>
                            <option value="completed">เสร็จสิ้น</option>
                            <option value="rejected">ปฏิเสธ</option>
                        </select>
                    </div>
                </div>

                {appointmentsLoading ? (
                    <div className="section-loading" aria-busy="true" aria-label="กำลังโหลดรายการนัดหมาย">
                        <Spinner />
                    </div>
                ) : appointments.length === 0 ? (
                    <p className="section-empty">
                        {appointmentFilter
                            ? 'ไม่พบรายการนัดหมายในสถานะที่เลือก'
                            : 'ยังไม่มีรายการนัดหมายในระบบ'}
                    </p>
                ) : (
                    <div className="table-scroll">
                        <table className="admin-table">
                            <caption className="visually-hidden">รายการนัดหมายทั้งหมด</caption>
                            <thead>
                                <tr>
                                    <th scope="col" className="col-id">ID</th>
                                    <th scope="col">นักเรียน</th>
                                    <th scope="col">ติวเตอร์</th>
                                    <th scope="col">เวลา</th>
                                    <th scope="col">ระยะเวลา</th>
                                    <th scope="col">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((app) => (
                                    <tr key={app.id}>
                                        <td className="col-id">{app.id}</td>
                                        <td>
                                            {app.student_first_name} {app.student_last_name}
                                        </td>
                                        <td>
                                            {app.tutor_first_name} {app.tutor_last_name}
                                        </td>
                                        <td>{formatAppointmentTime(app.appointment_time)}</td>
                                        <td>{app.duration ? `${app.duration} นาที` : '—'}</td>
                                        <td>
                                            <div className="status-cell">
                                                <span className={`status-badge status-${app.status}`}>
                                                    {statusLabels[app.status] || app.status}
                                                </span>
                                                {app.student_message && (
                                                    <span
                                                        className="message-tooltip"
                                                        title={app.student_message}
                                                        aria-label={`ข้อความจากนักเรียน: ${app.student_message}`}
                                                        tabIndex={0}
                                                    >
                                                        i
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="admin-section" aria-labelledby="users-heading">
                <div className="section-header">
                    <div className="section-title-block">
                        <h3 id="users-heading">ผู้ใช้งาน</h3>
                        <span
                            className={`section-count${usersLoading ? ' is-loading' : ''}`}
                            aria-live="polite"
                        >
                            {userCountLabel}
                        </span>
                    </div>
                </div>

                {usersLoading ? (
                    <div className="section-loading" aria-busy="true" aria-label="กำลังโหลดรายชื่อผู้ใช้">
                        <Spinner />
                    </div>
                ) : users.length === 0 ? (
                    <p className="section-empty">ยังไม่มีผู้ใช้ในระบบ</p>
                ) : (
                    <div className="table-scroll">
                        <table className="admin-table">
                            <caption className="visually-hidden">รายชื่อผู้ใช้ทั้งหมด</caption>
                            <thead>
                                <tr>
                                    <th scope="col" className="col-id">ID</th>
                                    <th scope="col">อีเมล</th>
                                    <th scope="col">ชื่อ</th>
                                    <th scope="col">ประเภท</th>
                                    <th scope="col" className="col-actions">การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const isDeleting = deletingUserId === user.id;
                                    const isAdmin = user.role === 'admin';

                                    return (
                                        <tr key={user.id}>
                                            <td className="col-id">{user.id}</td>
                                            <td className="col-email" title={user.email}>
                                                {user.email}
                                            </td>
                                            <td>
                                                {user.first_name} {user.last_name}
                                            </td>
                                            <td>
                                                <span className={`role-badge role-${user.role}`}>
                                                    {roleLabels[user.role] || user.role}
                                                </span>
                                            </td>
                                            <td className="col-actions">
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(user)}
                                                        className="btn-edit"
                                                        disabled={isDeleting}
                                                    >
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="btn-delete"
                                                        disabled={isDeleting || isAdmin}
                                                        aria-label={
                                                            isAdmin
                                                                ? 'ไม่สามารถลบบัญชีผู้ดูแลระบบ'
                                                                : `ลบผู้ใช้ ${user.email}`
                                                        }
                                                    >
                                                        {isDeleting ? 'กำลังลบ…' : 'ลบ'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
                {editingUser && (
                    <form onSubmit={handleSaveUser} aria-busy={isSaving}>
                        <h3 className="modal-form-title" id="edit-user-title">
                            แก้ไขข้อมูลผู้ใช้ ID: {editingUser.id}
                        </h3>
                        <div className="form-group">
                            <label htmlFor="edit-first-name">ชื่อจริง</label>
                            <input
                                id="edit-first-name"
                                type="text"
                                value={editingUser.first_name}
                                onChange={(e) =>
                                    setEditingUser({ ...editingUser, first_name: e.target.value })
                                }
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-last-name">นามสกุล</label>
                            <input
                                id="edit-last-name"
                                type="text"
                                value={editingUser.last_name}
                                onChange={(e) =>
                                    setEditingUser({ ...editingUser, last_name: e.target.value })
                                }
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-email">อีเมล</label>
                            <input
                                id="edit-email"
                                type="email"
                                value={editingUser.email}
                                onChange={(e) =>
                                    setEditingUser({ ...editingUser, email: e.target.value })
                                }
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-role">ประเภท</label>
                            <select
                                id="edit-role"
                                value={editingUser.role}
                                onChange={(e) =>
                                    setEditingUser({ ...editingUser, role: e.target.value })
                                }
                                disabled={isSaving || editingUser.role === 'admin'}
                            >
                                <option value="student">นักเรียน</option>
                                <option value="tutor">ติวเตอร์</option>
                                {editingUser.role === 'admin' && (
                                    <option value="admin">ผู้ดูแล</option>
                                )}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleCloseEditModal}
                                disabled={isSaving}
                            >
                                ยกเลิก
                            </button>
                            <button type="submit" className="btn" disabled={isSaving}>
                                {isSaving ? 'กำลังบันทึก…' : 'บันทึก'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
