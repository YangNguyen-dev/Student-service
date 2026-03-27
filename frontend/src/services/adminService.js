import api from './api';

/**
 * Service quản trị viên — gọi các API /admin/*.
 * Quản lý: người dùng, học sinh, giáo viên, lớp, môn, lịch học.
 */
export const adminService = {
  // ===== Người dùng =====

  /** Lấy danh sách tất cả người dùng */
  async getAllUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  /** Lấy thông tin người dùng theo ID */
  async getUserById(userId) {
    const res = await api.get(`/admin/users/${userId}`);
    return res.data;
  },

  /** Xóa người dùng */
  async deleteUser(userId) {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  /** Đặt lại mật khẩu về "123456" */
  async resetPassword(userId) {
    const res = await api.put(`/admin/users/${userId}/reset-password`);
    return res.data;
  },

  // ===== Học sinh =====

  /** Lấy danh sách tất cả học sinh */
  async getAllStudents() {
    const res = await api.get('/admin/students');
    return res.data;
  },

  /** Lấy thông tin học sinh theo ID */
  async getStudentById(studentId) {
    const res = await api.get(`/admin/students/${studentId}`);
    return res.data;
  },

  /** Gán học sinh vào lớp */
  async assignStudentToClass(studentId, classId) {
    const res = await api.put(`/admin/students/${studentId}/class/${classId}`);
    return res.data;
  },

  /** Xóa học sinh khỏi lớp */
  async removeStudentFromClass(studentId) {
    const res = await api.delete(`/admin/students/${studentId}/class`);
    return res.data;
  },

  // ===== Giáo viên =====

  /** Lấy danh sách tất cả giáo viên */
  async getAllTeachers() {
    const res = await api.get('/admin/teachers');
    return res.data;
  },

  /** Lấy thông tin giáo viên theo ID */
  async getTeacherById(teacherId) {
    const res = await api.get(`/admin/teachers/${teacherId}`);
    return res.data;
  },

  /** Phân công giáo viên dạy môn */
  async assignTeacherToSubject(teacherId, subjectId) {
    const res = await api.put(`/admin/teachers/${teacherId}/subject/${subjectId}`);
    return res.data;
  },

  // ===== Lớp học =====

  /** Lấy danh sách tất cả lớp học */
  async getAllClassrooms() {
    const res = await api.get('/admin/classrooms');
    return res.data;
  },

  /** Lấy thông tin lớp theo ID */
  async getClassroomById(classId) {
    const res = await api.get(`/admin/classrooms/${classId}`);
    return res.data;
  },

  /** Tạo lớp học mới */
  async createClassroom(data) {
    const res = await api.post('/admin/classrooms', data);
    return res.data;
  },

  /** Cập nhật thông tin lớp */
  async updateClassroom(classId, data) {
    const res = await api.put(`/admin/classrooms/${classId}`, data);
    return res.data;
  },

  /** Xóa lớp học */
  async deleteClassroom(classId) {
    const res = await api.delete(`/admin/classrooms/${classId}`);
    return res.data;
  },

  /** Gán giáo viên chủ nhiệm cho lớp */
  async setHomeroomTeacher(classId, teacherId) {
    const res = await api.put(`/admin/classrooms/${classId}/homeroom/${teacherId}`);
    return res.data;
  },

  // ===== Môn học =====

  /** Lấy danh sách tất cả môn học */
  async getAllSubjects() {
    const res = await api.get('/admin/subjects');
    return res.data;
  },

  /** Lấy thông tin môn theo ID */
  async getSubjectById(subjectId) {
    const res = await api.get(`/admin/subjects/${subjectId}`);
    return res.data;
  },

  /** Tạo môn học mới */
  async createSubject(data) {
    const res = await api.post('/admin/subjects', data);
    return res.data;
  },

  /** Cập nhật thông tin môn */
  async updateSubject(subjectId, data) {
    const res = await api.put(`/admin/subjects/${subjectId}`, data);
    return res.data;
  },

  /** Xóa môn học */
  async deleteSubject(subjectId) {
    const res = await api.delete(`/admin/subjects/${subjectId}`);
    return res.data;
  },

  // ===== Lịch học =====

  /** Lấy tất cả lịch học */
  async getAllSchedules() {
    const res = await api.get('/admin/schedules');
    return res.data;
  },

  /** Lấy lịch theo lớp */
  async getSchedulesByClass(classId) {
    const res = await api.get(`/admin/schedules/class/${classId}`);
    return res.data;
  },

  /** Tạo tiết học mới */
  async createSchedule(data) {
    const res = await api.post('/admin/schedules', data);
    return res.data;
  },

  /** Cập nhật tiết học */
  async updateSchedule(scheduleId, data) {
    const res = await api.put(`/admin/schedules/${scheduleId}`, data);
    return res.data;
  },

  /** Xóa tiết học */
  async deleteSchedule(scheduleId) {
    const res = await api.delete(`/admin/schedules/${scheduleId}`);
    return res.data;
  },
};
