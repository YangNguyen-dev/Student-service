import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider - Quản lý trạng thái xác thực toàn ứng dụng.
 * Cung cấp: user, token, login, logout, register, updateAvatar.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục trạng thái đăng nhập từ localStorage khi khởi tạo
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Đăng nhập: gọi API → lưu token + refreshToken + user vào localStorage
  const login = useCallback(async (username, password) => {
    const result = await authService.login(username, password);
    const { token: jwt, refreshToken: refresh, fullName, username: name, role, avatarUrl } = result.data;
    const userData = { username: name, fullName: fullName || name, role, avatarUrl };

    localStorage.setItem('token', jwt);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return userData;
  }, []);

  // Đăng ký tài khoản mới
  const register = useCallback(async (username, password, email, role, fullName) => {
    return await authService.register(username, password, email, role, fullName);
  }, []);

  // Đăng xuất: xóa tất cả dữ liệu xác thực
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Cập nhật avatar (sau khi upload thành công)
  const updateAvatar = useCallback((avatarUrl) => {
    setUser(prev => {
      const updated = { ...prev, avatarUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook sử dụng AuthContext.
 * Phải được gọi bên trong AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
