import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    <div className="form-container">
      <h2>สมัครสมาชิก</h2>
      <form onSubmit={handleSubmit}>
        {/* ... (inputs for firstName, lastName, email, password) ... */}
        <div className="form-group">
            <label>ชื่อจริง</label>
            <input type="text" name="firstName" onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>นามสกุล</label>
            <input type="text" name="lastName" onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>อีเมล</label>
            <input type="email" name="email" onChange={handleChange} required />
        </div>
        <div className="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" name="password" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>คุณคือ?</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">นักเรียน</option>
            <option value="tutor">ติวเตอร์</option>
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className="btn">สมัครสมาชิก</button>
      </form>
    </div>
  );
};

export default RegisterPage;