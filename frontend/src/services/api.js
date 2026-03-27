import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Gắn JWT token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === XỬ LÝ TỰ ĐỘNG LÀM MỚI TOKEN ===
// Khi access token hết hạn (401), tự động dùng refresh token để lấy token mới
let isRefreshing = false;   // Đang refresh hay chưa
let failedQueue = [];       // Hàng đợi các request bị 401

// Xử lý hàng đợi sau khi refresh xong
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401 (Unauthorized) và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Không refresh nếu chính request refresh hoặc login bị lỗi
      if (originalRequest.url === '/refresh-token' || originalRequest.url === '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Nếu đang refresh → xếp vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refresh token → đăng xuất
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token (dùng axios trực tiếp, không qua interceptor)
        const response = await axios.post('/api/refresh-token', { refreshToken });
        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

        // Lưu token mới
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Cập nhật thông tin user nếu có
        const { username, fullName, role, avatarUrl } = response.data.data;
        if (username) {
          localStorage.setItem('user', JSON.stringify({
            username, fullName: fullName || username, role, avatarUrl,
          }));
        }

        // Giải quyết hàng đợi với token mới
        processQueue(null, newToken);

        // Thử lại request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh thất bại → đăng xuất
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
