import api from './api';

/**
 * Service xử lý xác thực (gọi API backend).
 */
export const authService = {
  /** Đăng nhập, trả về { token, refreshToken, username, role, ... } */
  async login(username, password) {
    const response = await api.post('/login', { username, password });
    return response.data;
  },

  /** Đăng ký tài khoản mới */
  async register(username, password, email, role, fullName) {
    const response = await api.post('/register', { username, password, email, role, fullName });
    return response.data;
  },
};
