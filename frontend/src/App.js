import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import StudentDashboard from './pages/student/Dashboard';
import TutorDashboard from './pages/tutor/Dashboard';
import TutorProfilePage from './pages/TutorProfilePage';
import AdminDashboard from './pages/admin/Dashboard';
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentProfilePage from './pages/student/StudentProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tutor/:id" element={<TutorProfilePage />} />

          {/* dashboard routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile/:id" element={<StudentProfilePage />} />
          <Route path="/tutor/dashboard" element={<TutorDashboard />} />      
          <Route path="/admin/dashboard" element={<AdminDashboard />} />    
        </Routes>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;