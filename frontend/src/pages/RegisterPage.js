import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.register(formData);
      navigate('/login');
    } catch (err) {
      setError('ไม่สามารถสมัครสมาชิกได้ อาจมีอีเมลนี้ในระบบแล้ว');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="auth-header">
          <h2>สมัครสมาชิก</h2>
          <p className="auth-subtitle">สร้างบัญชีเพื่อเริ่มต้นการเรียนรู้และสอนกับเรา</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">ชื่อจริง</label>
              <input 
                id="firstName" 
                type="text" 
                name="firstName" 
                placeholder="ชื่อ" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-field">
              <label htmlFor="lastName">นามสกุล</label>
              <input 
                id="lastName" 
                type="text" 
                name="lastName" 
                placeholder="นามสกุล" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">อีเมล</label>
            <input 
              id="email" 
              type="email" 
              name="email" 
              placeholder="name@example.com" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">รหัสผ่าน</label>
            <input 
              id="password" 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">คุณคือ ?</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="student">นักเรียน</option>
              <option value="tutor">ติวเตอร์</option>
            </select>
          </div>

          {error && <div className="form-alert">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="auth-submit-btn">สมัครสมาชิก</button>
          </div>
          
          <div className="auth-footer">
            มีบัญชีอยู่แล้วใช่ไหม? 
            <Link to="/login" className="auth-link">เข้าสู่ระบบ</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;