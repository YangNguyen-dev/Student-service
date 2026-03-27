import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import MainLayout from './components/MainLayout';

// === Trang công khai (lazy load) ===
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// === Trang chung ===
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// === Trang Admin ===
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const StudentManagement = lazy(() => import('./pages/admin/StudentManagement'));
const TeacherManagement = lazy(() => import('./pages/admin/TeacherManagement'));
const ClassroomManagement = lazy(() => import('./pages/admin/ClassroomManagement'));
const SubjectManagement = lazy(() => import('./pages/admin/SubjectManagement'));
const ScheduleManagement = lazy(() => import('./pages/admin/ScheduleManagement'));
const AdminStatistics = lazy(() => import('./pages/admin/AdminStatistics'));

// === Trang Học sinh ===
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentGrades = lazy(() => import('./pages/student/StudentGrades'));
const StudentSchedule = lazy(() => import('./pages/student/StudentSchedule'));

// === Trang Giáo viên ===
const TeacherProfile = lazy(() => import('./pages/teacher/TeacherProfile'));
const TeacherHomeroom = lazy(() => import('./pages/teacher/TeacherHomeroom'));
const TeacherTeaching = lazy(() => import('./pages/teacher/TeacherTeaching'));
const TeacherSchedule = lazy(() => import('./pages/teacher/TeacherSchedule'));
const TeacherStatistics = lazy(() => import('./pages/teacher/TeacherStatistics'));

/** Hiệu ứng loading khi lazy load trang */
const LoadingFallback = (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress sx={{ color: '#6C63FF' }} />
  </Box>
);

/** Route yêu cầu đăng nhập — chuyển về /login nếu chưa xác thực */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return LoadingFallback;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Route công khai — chuyển về /dashboard nếu đã đăng nhập */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

/**
 * Component gốc — Định nghĩa tất cả routing cho ứng dụng.
 * - Trang công khai: /login, /register
 * - Trang bảo vệ: nằm trong MainLayout, yêu cầu đăng nhập
 * - Fallback: chuyển về /login
 */
export default function App() {
  return (
    <Suspense fallback={LoadingFallback}>
      <Routes>
        {/* Trang công khai */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Trang bảo vệ — bọc trong MainLayout (sidebar + header) */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin */}
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/teachers" element={<TeacherManagement />} />
          <Route path="/admin/classrooms" element={<ClassroomManagement />} />
          <Route path="/admin/subjects" element={<SubjectManagement />} />
          <Route path="/admin/schedules" element={<ScheduleManagement />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />

          {/* Học sinh */}
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/grades" element={<StudentGrades />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />

          {/* Giáo viên */}
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          <Route path="/teacher/homeroom" element={<TeacherHomeroom />} />
          <Route path="/teacher/teaching" element={<TeacherTeaching />} />
          <Route path="/teacher/schedule" element={<TeacherSchedule />} />
          <Route path="/teacher/statistics" element={<TeacherStatistics />} />
        </Route>

        {/* Mặc định: chuyển về trang đăng nhập */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
