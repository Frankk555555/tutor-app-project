import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

      if (response.data.role === "admin") {
        navigate("/");
      } else if (response.data.role === "tutor") {
        navigate("/");
      } else {
        navigate("/");
      }
      window.location.reload(); // เพื่อให้ Navbar อัปเดต
    } catch (err) {
      setError("อีเมล์หรือรหัสผ่านไม่ถูกต้อง");
      setTimeout(() => setError(""), 2000); // ลบข้อความผิดพลาดหลัง 3 วินาที
    }
  };

  return (
    <div className="form-container">
      <h2>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" className="btn">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
