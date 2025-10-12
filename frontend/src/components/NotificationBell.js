import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.getMyNotifications();
                setNotifications(res.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        
        // ตั้งเวลาให้ดึงข้อมูลใหม่ทุก 1 นาที
        const interval = setInterval(fetchNotifications, 60000); 

        return () => clearInterval(interval); // ยกเลิกการดึงข้อมูลเมื่อออกจากหน้า
    }, []);

    const handleBellClick = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && notifications.length > 0) {
            // เมื่อเปิด dropdown ให้ส่ง request ไปบอกว่าอ่านแล้ว
            await api.markAllNotificationsAsRead();
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="notification-bell">
            <button onClick={handleBellClick} className="bell-button">
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    {notifications.length > 0 ? (
                        <ul>
                            {notifications.map(noti => (
                                <li key={noti.id}>
                                    <a href={noti.link}>{noti.message}</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>ไม่มีการแจ้งเตือนใหม่</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;