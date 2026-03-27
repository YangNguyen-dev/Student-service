import api from './api';

/**
 * Service học sinh — gọi các API /students/*.
 * Quản lý: hồ sơ, điểm, lịch học, lớp.
 */
export const studentService = {
  /** Lấy hồ sơ cá nhân */
  async getProfile() {
    const res = await api.get('/students/profile');
    return res.data;
  },

  /** Cập nhật hồ sơ cá nhân */
  async updateProfile(data) {
    const res = await api.put('/students/profile', data);
    return res.data;
  },

  /** Lấy bảng điểm */
  async getGrades() {
    const res = await api.get('/students/grades');
    return res.data;
  },

  /** Lấy thời khóa biểu */
  async getSchedule() {
    const res = await api.get('/students/schedule');
    return res.data;
  },

  /** Lấy thông tin lớp học */
  async getClassroom() {
    const res = await api.get('/students/classroom');
    return res.data;
  },

  /** Đổi mật khẩu */
  async changePassword(data) {
    const res = await api.put('/change-password', data);
    return res.data;
  },
};
