import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (!user) return null;

    // 1. ตรวจสอบก่อนเลยว่าเป็น 'admin' หรือไม่?
    if (user.role === "admin") {
      return "/admin/dashboard";
    }
    // 2. ถ้าไม่ใช่ admin ค่อยตรวจสอบว่าเป็น 'tutor' หรือไม่?
    if (user.role === "tutor") {
      return "/tutor/dashboard";
    }
    // 3. ถ้าไม่ใช่ทั้งสองอย่าง ก็เป็น 'student'
    return "/student/dashboard";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        ค้นหาติวเตอร์
      </Link>
      <ul className="nav-links">
        <li>
          <Link to="/">หน้าแรก</Link>
        </li>
        <li>
          <Link to="/search">ค้นหาติวเตอร์</Link>
        </li>
        {user ? (
          <>
            <>
              <li>
                <Link to={getDashboardLink()}>จัดการโปรไฟล์</Link>
              </li>
              <NotificationBell />
              <li>
                <button onClick={handleLogout}>ออกจากระบบ</button>
              </li>
              
            </>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">เข้าสู่ระบบ</Link>
            </li>
            <li>
              <Link to="/register">สมัครสมาชิก</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
