import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, CircularProgress, Alert,
  useTheme,
} from '@mui/material';
import {
  PeopleRounded, SchoolRounded, PersonRounded, ClassRounded, BookRounded,
  TrendingUpRounded, ScheduleRounded,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminStatistics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ users: 0, students: 0, teachers: 0, classrooms: 0, subjects: 0 });
  const [classStudentData, setClassStudentData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [users, students, teachers, classrooms, subjects] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllStudents(),
          adminService.getAllTeachers(),
          adminService.getAllClassrooms(),
          adminService.getAllSubjects(),
        ]);
        setCounts({
          users: users.length, students: students.length, teachers: teachers.length,
          classrooms: classrooms.length, subjects: subjects.length,
        });

        // Bar chart: student count per class
        setClassStudentData(classrooms.map(c => ({
          name: c.classroomName,
          'Số HS': c.studentCount || 0,
          'Sức chứa': c.maxStudents || 0,
        })));

      } catch (e) { setError('Không thể tải dữ liệu thống kê'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#6C63FF' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải thống kê...</Typography>
    </Box>
  );

  const statCards = [
    { icon: <PeopleRounded />, label: 'Tài khoản', value: counts.users, color: '#FF6584' },
    { icon: <SchoolRounded />, label: 'Học sinh', value: counts.students, color: '#6C63FF' },
    { icon: <PersonRounded />, label: 'Giáo viên', value: counts.teachers, color: '#10B981' },
    { icon: <ClassRounded />, label: 'Lớp học', value: counts.classrooms, color: '#06B6D4' },
    { icon: <BookRounded />, label: 'Môn học', value: counts.subjects, color: '#F59E0B' },
  ];

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #FF6584, #EC4899)', boxShadow: '0 4px 20px rgba(255,101,132,0.3)' }}>
          <TrendingUpRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Thống kê tổng quan</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tổng hợp tình hình hệ thống</Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {statCards.map((s, i) => (
          <Card key={i} sx={{ flex: '1 1 140px', borderRadius: 3, animation: `slideUp 0.5s ease-out ${i * 0.08}s both`, transition: 'all 0.3s', border: '1px solid', borderColor: `${s.color}25`, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${s.color}20` } }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ backgroundColor: `${s.color}18`, color: s.color, width: 40, height: 40 }}>{s.icon}</Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Bar Chart - Số HS theo lớp */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScheduleRounded sx={{ color: '#6C63FF' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>Số học sinh theo lớp</Typography>
          </Box>
          {classStudentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={classStudentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: isDark ? '#1E293B' : '#fff', border: 'none', borderRadius: 8 }} />
                <Bar dataKey="Số HS" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sức chứa" fill={isDark ? '#475569' : '#CBD5E1'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Chưa có dữ liệu lớp học</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
