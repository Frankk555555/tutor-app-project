import axios from "axios";

// สร้าง instance ของ axios พร้อมกำหนดค่าเริ่มต้น
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// Interceptor สำหรับแนบ Token ในทุกๆ Request
apiClient.interceptors.request.use(
  (config) => {
    // 1. ดึง token ที่เก็บไว้ใน localStorage
    const token = localStorage.getItem("token");

    // 2. ถ้ามี token, ให้แนบเข้าไปใน Header ของ Request
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. ส่ง Request ที่มี token แล้วออกไป
    return config;
  },
  (error) => {
    // หากเกิดข้อผิดพลาด ให้ส่ง error ออกไป
    return Promise.reject(error);
  }
);

// --- Object ที่รวมฟังก์ชัน API ทั้งหมด ---
const apiService = {
  // Auth
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },
  register(userData) {
    return apiClient.post("/auth/register", userData);
  },

  // Tutors (Public)
  getTutors(filters) {
    // axios จะแปลง object นี้เป็น query string ให้เอง
    return apiClient.get("/tutors", { params: filters });
  },
  getTutorById(tutorId) {
    return apiClient.get(`/tutors/${tutorId}`);
  },

  // Tutors (Private - ต้องใช้ Token)
  getTutorProfile() {
    return apiClient.get("/tutors/my-profile");
  },
  updateTutorProfile(profileData) {
    return apiClient.put("/tutors/my-profile", profileData);
  },
  addTutorSubject(subjectData) {
    return apiClient.post("/tutors/my-subjects", subjectData);
  },
  deleteTutorSubject(subjectId) {
    return apiClient.delete(`/tutors/my-subjects/${subjectId}`);
  },
  uploadProfilePictureForTutor(file) {
    const formData = new FormData();
    formData.append("profileImage", file);
    return apiClient.put("/tutors/my-profile/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Students (Private - ต้องใช้ Token)
  getStudentProfile() {
    return apiClient.get("/students/my-profile");
  },
  updateStudentProfile(profileData) {
    return apiClient.put("/students/my-profile", profileData);
  },
  uploadProfilePictureForStudent(file) {
    const formData = new FormData();
    formData.append("profileImage", file);
    return apiClient.put("/students/my-profile/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  // Appointments
  createAppointment(appointmentData) {
    return apiClient.post("/appointments", appointmentData);
  },
  getStudentAppointments() {
    return apiClient.get("/appointments/student");
  },
  getTutorAppointments() {
    return apiClient.get("/appointments/tutor");
  },
  updateAppointmentStatus(appointmentId, status) {
    return apiClient.patch(`/appointments/${appointmentId}`, { status });
  },
  // Reviews
  createReview(reviewData) {
    // ส่งข้อมูลรีวิว (appointmentId, rating, comment) ไปยัง Backend
    return apiClient.post("/reviews", reviewData);
  },

  // Subjects
  getAllSubjects() {
    return apiClient.get("/subjects");
  },

  // Admin
  adminGetAllUsers() {
    return apiClient.get("/admin/users");
  },
  adminDeleteUser(userId) {
    return apiClient.delete(`/admin/users/${userId}`);
  },
  adminCreateSubject(subjectData) {
    return apiClient.post("/admin/subjects", subjectData);
  },
  adminDeleteSubject(subjectId) {
    return apiClient.delete(`/admin/subjects/${subjectId}`);
  },
  adminUpdateUser(userId, userData) {
    return apiClient.put(`/admin/users/${userId}`, userData);
  },
  adminGetAllAppointments(filters) {
    // axios จะแปลง { status: 'pending' } เป็น ?status=pending ให้เอง
    return apiClient.get("/admin/appointments", { params: filters });
  },
  getTutorAvailability() {
    return apiClient.get("/tutors/my-availability");
  },
  addTutorAvailability(availabilityData) {
    return apiClient.post("/tutors/my-availability", availabilityData);
  },
  deleteTutorAvailability(availabilityId) {
    return apiClient.delete(`/tutors/my-availability/${availabilityId}`);
  },
  
  // Notifications
  getMyNotifications() {
    return apiClient.get('/notifications');
  },
  markAllNotificationsAsRead() {
    return apiClient.patch('/notifications/read-all');
  },

  getAllLevels() {
    return apiClient.get('/levels');
  },

  addTutorLevel(levelData) {
    return apiClient.post('/tutors/my-levels', levelData);
  },
  deleteTutorLevel(levelId) {
    return apiClient.delete(`/tutors/my-levels/${levelId}`);
  },
  searchSubjects(query) {
    return apiClient.get(`/subjects/search?q=${query}`);
  },
  getStudentProfileById(studentId) {
    return apiClient.get(`/students/profile/${studentId}`);
  },
  getFeaturedTutors() {
    return apiClient.get('/tutors/featured');
  },

};



export default apiService;
