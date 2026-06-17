import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.login({ email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      if (response.data.role === "admin" || response.data.role === "tutor") {
        navigate("/");
      } else {
        navigate("/");
      }
      window.location.reload(); // เพื่อให้ Navbar อัปเดต
    } catch (err) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setTimeout(() => setError(""), 2000); // ลบข้อความผิดพลาดหลัง 2 วินาที
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="auth-header">
          <h2>เข้าสู่ระบบ</h2>
          <p className="auth-subtitle">ลงชื่อเข้าใช้เพื่อค้นหาติวเตอร์ที่ใช่สำหรับคุณ</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="form-alert">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="auth-submit-btn">
              เข้าสู่ระบบ
            </button>
          </div>
          <div className="auth-footer">
            ยังไม่มีบัญชีใช่ไหม? 
            <Link to="/register" className="auth-link">สมัครสมาชิก</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
