import api from './api';

/**
 * Service giáo viên — gọi các API /teacher/*.
 * Quản lý: hồ sơ, lớp dạy, lịch dạy, nhập điểm, lớp chủ nhiệm.
 */
export const teacherService = {
  /** Lấy hồ sơ cá nhân */
  async getProfile() {
    const res = await api.get('/teacher/profile');
    return res.data;
  },

  /** Cập nhật hồ sơ cá nhân */
  async updateProfile(data) {
    const res = await api.put('/teacher/profile', data);
    return res.data;
  },

  /** Lấy môn được phân công dạy */
  async getMySubject() {
    const res = await api.get('/teacher/subject');
    return res.data;
  },

  /** Lấy danh sách lớp dạy + chủ nhiệm */
  async getMyClassrooms() {
    const res = await api.get('/teacher/classrooms');
    return res.data;
  },

  /** Lấy danh sách HS trong lớp */
  async getStudentsByClass(classId) {
    const res = await api.get(`/teacher/class/${classId}/students`);
    return res.data;
  },

  /** Lấy điểm đã nhập cho lớp */
  async getGradesByClass(classId) {
    const res = await api.get(`/teacher/class/${classId}/grades`);
    return res.data;
  },

  /** Lấy lịch dạy */
  async getMySchedule() {
    const res = await api.get('/teacher/schedule');
    return res.data;
  },

  /** Nhập/cập nhật điểm hàng loạt cho lớp */
  async inputGrades(classId, grades) {
    const res = await api.post(`/teacher/grades?classId=${classId}`, grades);
    return res.data;
  },

  /** Lấy tất cả điểm HS trong lớp chủ nhiệm */
  async getHomeroomGrades() {
    const res = await api.get('/teacher/homeroom/grades');
    return res.data;
  },

  /** Đổi mật khẩu */
  async changePassword(data) {
    const res = await api.put('/change-password', data);
    return res.data;
  },
};
