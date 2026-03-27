import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip, useTheme,
  CircularProgress, Skeleton, Tooltip, LinearProgress, Divider,
} from '@mui/material';
import {
  PeopleRounded, SchoolRounded, PersonRounded, ClassRounded, BookRounded,
  GradeRounded, ScheduleRounded, HomeRounded, ArrowForwardRounded,
  TrendingUpRounded, AutoAwesomeRounded, AccessTimeRounded, CalendarMonthRounded,
  EmailRounded, CakeRounded, BadgeRounded, WcRounded, EmojiEventsRounded,
  StarRounded, MenuBookRounded,
} from '@mui/icons-material';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import { adminService } from '../services/adminService';

/* ───── helpers ───── */
const SUBJECT_COLORS = [
  '#6C63FF', '#FF6584', '#10B981', '#F59E0B',
  '#06B6D4', '#8B5CF6', '#EC4899', '#EF4444',
  '#14B8A6', '#F97316', '#3B82F6',
];
const getSubjectColor = (name) => {
  if (!name) return '#6B7280';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
};

const getGradeColor = (s) => {
  if (s >= 8) return '#10B981';
  if (s >= 6.5) return '#6C63FF';
  if (s >= 5) return '#F59E0B';
  return '#EF4444';
};
const getGradeLabel = (s) => {
  if (s >= 8) return 'Giỏi';
  if (s >= 6.5) return 'Khá';
  if (s >= 5) return 'Trung Bình';
  return 'Yếu';
};

const DAYS_MAP = {
  1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
};
const DAY_LABELS = {
  MONDAY: 'Thứ 2', TUESDAY: 'Thứ 3', WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5', FRIDAY: 'Thứ 6', SATURDAY: 'Thứ 7',
};
const PERIOD_TIMES = {
  1: '7:00 – 7:45', 2: '7:55 – 8:40', 3: '9:00 – 9:45',
  4: '9:55 – 10:40', 5: '10:50 – 11:35',
};
const getCurrentDay = () => DAYS_MAP[new Date().getDay()] || null;

const formatDate = (d) => {
  if (!d) return '—';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
};

/* ───── Circular Progress with Label ───── */
function CircularGrade({ value, size = 70, thickness = 4, color }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/* Background ring */}
      <CircularProgress
        variant="determinate" value={100} size={size} thickness={thickness}
        sx={{ color: `${color}20`, position: 'absolute' }}
      />
      {/* Foreground ring */}
      <CircularProgress
        variant="determinate" value={Math.min(value * 10, 100)} size={size} thickness={thickness}
        sx={{ color, transition: 'all 1s ease-out' }}
      />
      <Box sx={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: size * 0.22, color }}>
          {value.toFixed(1)}
        </Typography>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════
   STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════ */
function StudentDashboard({ user, isDark, navigate }) {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, g, s] = await Promise.all([
          studentService.getProfile(),
          studentService.getGrades(),
          studentService.getSchedule(),
        ]);
        setProfile(p); setGrades(g); setSchedule(s);
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const today = getCurrentDay();
  const todaySchedule = schedule
    .filter(s => s.dayOfWeek === today)
    .sort((a, b) => a.period - b.period);

  const totalAvg = grades.length > 0
    ? grades.reduce((s, g) => s + (g.averageScore || 0), 0) / grades.length : 0;
  const excellentCount = grades.filter(g => g.averageScore >= 8).length;

  const avatarUrl = profile?.avatarUrl
    ? `http://localhost:8080${profile.avatarUrl}`
    : user?.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : null;

  if (loading) return <DashboardSkeleton />;

  return (
    <Grid container spacing={2.5} sx={{ animation: 'fade-in-up 0.5s ease-out' }}>

      {/* ── LEFT: Profile Card ── */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{
          borderRadius: 4, overflow: 'hidden', height: '100%',
          background: isDark
            ? 'linear-gradient(180deg, #1E2235 0%, #1A1D2E 100%)'
            : 'linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%)',
        }}>
          {/* Gradient header strip */}
          <Box sx={{
            height: 80,
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 50%, #A78BFA 100%)',
            position: 'relative',
          }} />
          <CardContent sx={{ textAlign: 'center', mt: -5, px: 2.5, pb: 3 }}>
            <Avatar
              src={avatarUrl}
              sx={{
                width: 80, height: 80, mx: 'auto', mb: 1.5,
                border: isDark ? '4px solid #1A1D2E' : '4px solid #fff',
                boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
                fontSize: '2rem', bgcolor: '#6C63FF',
              }}
            >
              {(profile?.fullName || user?.fullName || '?')[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.3, fontSize: '1rem' }}>
              {profile?.fullName || user?.fullName}
            </Typography>
            <Chip label={profile?.classroomName || 'Chưa phân lớp'} size="small"
              sx={{ bgcolor: '#6C63FF18', color: '#6C63FF', fontWeight: 700, mb: 2 }} />

            <Divider sx={{ my: 1.5 }} />

            {/* Info rows */}
            {[
              { icon: <BadgeRounded />, label: 'Mã HS', value: profile?.studentCode },
              { icon: <EmailRounded />, label: 'Email', value: profile?.email },
              { icon: <CakeRounded />, label: 'Sinh nhật', value: formatDate(profile?.dateOfBirth) },
              { icon: <WcRounded />, label: 'Giới tính', value: profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : '—' },
            ].map((row, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.2, py: 1,
                borderBottom: i < 3 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6C63FF12', color: '#6C63FF' }}>
                  {row.icon}
                </Avatar>
                <Box sx={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'text.primary', fontWeight: 600, fontSize: '0.8rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {row.value || '—'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* ── CENTER: Grades ── */}
      <Grid size={{ xs: 12, md: 6 }}>
        {/* Overall stats bar */}
        <Card sx={{ borderRadius: 4, mb: 2.5, overflow: 'hidden', position: 'relative' }}>
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, #6C63FF, #EC4899, #F59E0B, #10B981)',
          }} />
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularGrade value={totalAvg} size={56} thickness={5} color={getGradeColor(totalAvg)} />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>
                  ĐIỂM TRUNG BÌNH
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                  {totalAvg.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981' }}>{excellentCount}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>MÔN GIỎI</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#8B5CF6' }}>{grades.filter(g => g.averageScore >= 6.5 && g.averageScore < 8).length}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>MÔN KHÁ</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#6C63FF' }}>{grades.length}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>TỔNG MÔN</Typography>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ minWidth: 140 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>
                  XẾP LOẠI
                </Typography>
                <Chip
                  label={getGradeLabel(totalAvg)}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.6rem', fontWeight: 800,
                    bgcolor: `${getGradeColor(totalAvg)}18`,
                    color: getGradeColor(totalAvg),
                    border: `1px solid ${getGradeColor(totalAvg)}30`,
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(totalAvg * 10, 100)}
                sx={{
                  height: 6, borderRadius: 3,
                  backgroundColor: `${getGradeColor(totalAvg)}15`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getGradeColor(totalAvg),
                    borderRadius: 3,
                  },
                }}
              />
              {grades.length > 0 && (() => {
                const highest = grades.reduce((max, g) => (g.averageScore || 0) > (max.averageScore || 0) ? g : max, grades[0]);
                return (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.58rem', mt: 0.5, display: 'block' }}>
                    🏆 Cao nhất: <strong style={{ color: getGradeColor(highest.averageScore) }}>{highest.averageScore?.toFixed(1)}</strong> ({highest.subjectName})
                  </Typography>
                );
              })()}
            </Box>
          </CardContent>
        </Card>

        {/* Subject grade cards */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          📊 Bảng điểm theo môn
        </Typography>
        <Grid container spacing={2}>
          {grades.map((g, i) => {
            const color = getGradeColor(g.averageScore);
            const subColor = getSubjectColor(g.subjectName);
            return (
              <Grid size={{ xs: 6, sm: 4 }} key={i}>
                <Card sx={{
                  borderRadius: 3, textAlign: 'center', py: 2, px: 1.5,
                  transition: 'all 0.3s ease',
                  animation: `fade-in-up 0.4s ease-out ${0.1 + i * 0.05}s both`,
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${subColor}20` },
                }}
                  onClick={() => navigate('/student/grades')}
                >
                  <CircularGrade value={g.averageScore || 0} size={64} thickness={4.5} color={color} />
                  <Typography sx={{
                    mt: 1.2, fontWeight: 700, fontSize: '0.82rem', color: 'text.primary',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {g.subjectName}
                  </Typography>
                  <Chip label={getGradeLabel(g.averageScore)} size="small" sx={{
                    mt: 0.5, height: 20, fontSize: '0.6rem', fontWeight: 700,
                    bgcolor: `${color}15`, color,
                  }} />
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Grid>

      {/* ── RIGHT: Today's Schedule + Quick Links ── */}
      <Grid size={{ xs: 12, md: 3 }}>
        {/* Today's Timetable */}
        <Card sx={{ borderRadius: 4, mb: 2.5 }}>
          <CardContent sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarMonthRounded sx={{ color: '#6C63FF', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                Lịch học hôm nay
              </Typography>
            </Box>
            {today === null ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: '2rem' }}>🎉</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Hôm nay là Chủ nhật!
                </Typography>
              </Box>
            ) : todaySchedule.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: '2rem' }}>📭</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Không có tiết học
                </Typography>
              </Box>
            ) : (
              todaySchedule.map((s, i) => {
                const isCeremony = s.scheduleType === 'CEREMONY';
                const isHomeroom = s.scheduleType === 'HOMEROOM';
                const isSpecial = isCeremony || isHomeroom;
                const subjectLabel = isCeremony ? '🚩 Chào cờ' : isHomeroom ? '🏠 Sinh hoạt' : s.subject;
                const dotColor = isCeremony ? '#EF4444' : isHomeroom ? '#F59E0B' : getSubjectColor(s.subject);
                return (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2,
                    borderBottom: i < todaySchedule.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    animation: `fade-in-up 0.3s ease-out ${0.1 + i * 0.08}s both`,
                  }}>
                    <Box sx={{
                      minWidth: 36, height: 36, borderRadius: 2, bgcolor: `${dotColor}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: dotColor, fontWeight: 800, fontSize: '0.75rem',
                    }}>
                      T{s.period}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{
                        fontWeight: 700, fontSize: '0.8rem', color: isSpecial ? dotColor : 'text.primary',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {subjectLabel}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                        {PERIOD_TIMES[s.period]}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          ⚡ Truy cập nhanh
        </Typography>
        {[
          { icon: <PersonRounded />, label: 'Hồ sơ cá nhân', path: '/student/profile', accent: '#6C63FF' },
          { icon: <GradeRounded />, label: 'Bảng điểm', path: '/student/grades', accent: '#FF6584' },
          { icon: <ScheduleRounded />, label: 'Thời khóa biểu', path: '/student/schedule', accent: '#06B6D4' },
        ].map((item, i) => (
          <Card key={i} onClick={() => navigate(item.path)} sx={{
            mb: 1.5, borderRadius: 3, cursor: 'pointer',
            transition: 'all 0.3s ease',
            animation: `fade-in-up 0.3s ease-out ${0.3 + i * 0.1}s both`,
            '&:hover': { transform: 'translateX(4px)', boxShadow: `0 4px 15px ${item.accent}18` },
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: `${item.accent}15`, color: item.accent }}>
                {item.icon}
              </Avatar>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary', flex: 1 }}>
                {item.label}
              </Typography>
              <ArrowForwardRounded sx={{ color: 'text.secondary', fontSize: 16 }} />
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════════════
   TEACHER DASHBOARD
   ═══════════════════════════════════════════════════════ */
function TeacherDashboard({ user, isDark, navigate }) {
  const [profile, setProfile] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, s] = await Promise.all([
          teacherService.getProfile(),
          teacherService.getMyClassrooms(),
          teacherService.getMySchedule(),
        ]);
        setProfile(p);
        setClassrooms(c.map(cls => ({ ...cls, isHomeroom: cls.homeroomTeacherId === p.id })));
        setSchedule(s);
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const today = getCurrentDay();
  const todaySchedule = schedule
    .filter(s => s.dayOfWeek === today)
    .sort((a, b) => a.period - b.period);

  const homeroomClass = classrooms.find(c => c.isHomeroom);
  const teachingClasses = classrooms.filter(c => !c.isHomeroom);

  const avatarUrl = profile?.avatarUrl
    ? `http://localhost:8080${profile.avatarUrl}`
    : user?.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : null;

  if (loading) return <DashboardSkeleton />;

  return (
    <Grid container spacing={2.5} sx={{ animation: 'fade-in-up 0.5s ease-out' }}>

      {/* ── LEFT: Profile Card ── */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{
          borderRadius: 4, overflow: 'hidden', height: '100%',
          background: isDark
            ? 'linear-gradient(180deg, #1E2235 0%, #1A1D2E 100%)'
            : 'linear-gradient(180deg, #F0FFF4 0%, #FFFFFF 100%)',
        }}>
          <Box sx={{
            height: 80,
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
          }} />
          <CardContent sx={{ textAlign: 'center', mt: -5, px: 2.5, pb: 3 }}>
            <Avatar
              src={avatarUrl}
              sx={{
                width: 80, height: 80, mx: 'auto', mb: 1.5,
                border: isDark ? '4px solid #1A1D2E' : '4px solid #fff',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                fontSize: '2rem', bgcolor: '#10B981',
              }}
            >
              {(profile?.fullName || user?.fullName || '?')[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.3, fontSize: '1rem' }}>
              {profile?.fullName || user?.fullName}
            </Typography>
            <Chip label="Giáo viên" size="small"
              sx={{ bgcolor: '#10B98118', color: '#10B981', fontWeight: 700, mb: 1 }} />
            {profile?.subjectName && (
              <Chip label={`Bộ môn: ${profile.subjectName}`} size="small"
                sx={{ bgcolor: '#6C63FF18', color: '#6C63FF', fontWeight: 600, ml: 0.5 }} />
            )}

            <Divider sx={{ my: 1.5 }} />

            {[
              { icon: <BadgeRounded />, label: 'Mã GV', value: profile?.teacherCode },
              { icon: <EmailRounded />, label: 'Email', value: profile?.email },
              { icon: <HomeRounded />, label: 'Lớp chủ nhiệm', value: homeroomClass?.classroomName || '—' },
              { icon: <ClassRounded />, label: 'Lớp dạy', value: `${classrooms.length} lớp` },
            ].map((row, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.2, py: 1,
                borderBottom: i < 3 ? '1px solid' : 'none', borderColor: 'divider',
              }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#10B98112', color: '#10B981' }}>
                  {row.icon}
                </Avatar>
                <Box sx={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'text.primary', fontWeight: 600, fontSize: '0.8rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {row.value || '—'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* ── CENTER: Stats + Class cards ── */}
      <Grid size={{ xs: 12, md: 6 }}>
        {/* Stats bar */}
        {/* Stats bar */}
        <Card sx={{ borderRadius: 4, mb: 2.5, overflow: 'hidden', position: 'relative' }}>
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, #10B981, #34D399, #6EE7B7)',
          }} />
          <CardContent sx={{ display: 'flex', gap: 3, py: 2.5, px: 3, alignItems: 'center' }}>
            {[
              { value: classrooms.length, label: 'TỔNG LỚP', color: '#10B981' },
              { value: todaySchedule.length, label: 'TIẾT HÔM NAY', color: '#6C63FF' },
              { value: schedule.length, label: 'TỔNG TIẾT / TUẦN', color: '#F59E0B' },
              { value: homeroomClass ? 1 : 0, label: 'LỚP CHỦ NHIỆM', color: '#FF6584' },
            ].map((st, i) => (
              <Box key={i} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: st.color }}>{st.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                  {st.label}
                </Typography>
              </Box>
            ))}
            <Divider orientation="vertical" flexItem />
            <Box sx={{ minWidth: 130 }}>
              {profile?.subject && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                  <MenuBookRounded sx={{ fontSize: 16, color: '#8B5CF6' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>
                    MÔN DẠY
                  </Typography>
                  <Chip label={profile.subject.subjectName || profile.subject.name} size="small" sx={{
                    height: 20, fontSize: '0.6rem', fontWeight: 700,
                    bgcolor: '#8B5CF618', color: '#8B5CF6',
                  }} />
                </Box>
              )}
              {homeroomClass && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <HomeRounded sx={{ fontSize: 16, color: '#FF6584' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>
                    CHỦ NHIỆM
                  </Typography>
                  <Chip label={homeroomClass.classroomName} size="small" sx={{
                    height: 20, fontSize: '0.6rem', fontWeight: 700,
                    bgcolor: '#FF658418', color: '#FF6584',
                  }} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Class list */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          🏫 Danh sách lớp
        </Typography>
        <Grid container spacing={2}>
          {classrooms.map((c, i) => (
            <Grid size={{ xs: 6, sm: 4 }} key={i}>
              <Card sx={{
                borderRadius: 3, textAlign: 'center', py: 2.5, px: 1.5,
                transition: 'all 0.3s ease', cursor: 'pointer',
                animation: `fade-in-up 0.4s ease-out ${0.1 + i * 0.05}s both`,
                border: c.isHomeroom ? '2px solid #FF658440' : undefined,
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
              }}
                onClick={() => navigate(c.isHomeroom ? '/teacher/homeroom' : '/teacher/teaching')}
              >
                <Avatar sx={{
                  width: 48, height: 48, mx: 'auto', mb: 1,
                  bgcolor: c.isHomeroom ? '#FF658415' : '#10B98115',
                  color: c.isHomeroom ? '#FF6584' : '#10B981',
                }}>
                  {c.isHomeroom ? <HomeRounded /> : <ClassRounded />}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                  {c.classroomName}
                </Typography>
                <Chip
                  label={c.isHomeroom ? 'Chủ nhiệm' : 'Giảng dạy'}
                  size="small"
                  sx={{
                    mt: 0.5, height: 20, fontSize: '0.6rem', fontWeight: 700,
                    bgcolor: c.isHomeroom ? '#FF658415' : '#10B98115',
                    color: c.isHomeroom ? '#FF6584' : '#10B981',
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* ── RIGHT: Today Schedule + Quick Links ── */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ borderRadius: 4, mb: 2.5 }}>
          <CardContent sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarMonthRounded sx={{ color: '#10B981', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                Lịch dạy hôm nay
              </Typography>
            </Box>
            {today === null ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: '2rem' }}>🎉</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Chủ nhật — Nghỉ ngơi!</Typography>
              </Box>
            ) : todaySchedule.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: '2rem' }}>📭</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Không có tiết dạy</Typography>
              </Box>
            ) : (
              todaySchedule.map((s, i) => {
                const isCeremony = s.scheduleType === 'CEREMONY';
                const isHomeroom = s.scheduleType === 'HOMEROOM';
                const subjectLabel = isCeremony ? '🚩 Chào cờ' : isHomeroom ? '🏠 Sinh hoạt' : s.subject;
                const dotColor = isCeremony ? '#EF4444' : isHomeroom ? '#F59E0B' : '#10B981';
                return (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2,
                    borderBottom: i < todaySchedule.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    animation: `fade-in-up 0.3s ease-out ${0.1 + i * 0.08}s both`,
                  }}>
                    <Box sx={{
                      minWidth: 36, height: 36, borderRadius: 2, bgcolor: `${dotColor}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: dotColor, fontWeight: 800, fontSize: '0.75rem',
                    }}>
                      T{s.period}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
                        {subjectLabel}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                        {s.classroomName} • {PERIOD_TIMES[s.period]}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          ⚡ Truy cập nhanh
        </Typography>
        {[
          { icon: <PersonRounded />, label: 'Hồ sơ cá nhân', path: '/teacher/profile', accent: '#10B981' },
          { icon: <HomeRounded />, label: 'Lớp chủ nhiệm', path: '/teacher/homeroom', accent: '#FF6584' },
          { icon: <ClassRounded />, label: 'Lớp giảng dạy', path: '/teacher/teaching', accent: '#06B6D4' },
          { icon: <ScheduleRounded />, label: 'Lịch dạy', path: '/teacher/schedule', accent: '#F59E0B' },
          { icon: <TrendingUpRounded />, label: 'Thống kê', path: '/teacher/statistics', accent: '#8B5CF6' },
        ].map((item, i) => (
          <Card key={i} onClick={() => navigate(item.path)} sx={{
            mb: 1.5, borderRadius: 3, cursor: 'pointer', transition: 'all 0.3s ease',
            animation: `fade-in-up 0.3s ease-out ${0.3 + i * 0.08}s both`,
            '&:hover': { transform: 'translateX(4px)', boxShadow: `0 4px 15px ${item.accent}18` },
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: `${item.accent}15`, color: item.accent }}>
                {item.icon}
              </Avatar>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary', flex: 1 }}>
                {item.label}
              </Typography>
              <ArrowForwardRounded sx={{ color: 'text.secondary', fontSize: 16 }} />
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════ */
function AdminDashboard({ user, isDark, navigate }) {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classrooms: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [students, teachers, classrooms, subjects] = await Promise.all([
          adminService.getAllStudents(),
          adminService.getAllTeachers(),
          adminService.getAllClassrooms(),
          adminService.getAllSubjects(),
        ]);
        setStats({
          students: students.length, teachers: teachers.length,
          classrooms: classrooms.length, subjects: subjects.length,
        });
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const avatarUrl = user?.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : null;

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { icon: <SchoolRounded />, value: stats.students, label: 'Học sinh', color: '#6C63FF', bg: 'linear-gradient(135deg, #6C63FF, #8B5CF6)' },
    { icon: <PersonRounded />, value: stats.teachers, label: 'Giáo viên', color: '#10B981', bg: 'linear-gradient(135deg, #10B981, #34D399)' },
    { icon: <ClassRounded />, value: stats.classrooms, label: 'Lớp học', color: '#F59E0B', bg: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
    { icon: <BookRounded />, value: stats.subjects, label: 'Môn học', color: '#EC4899', bg: 'linear-gradient(135deg, #EC4899, #F472B6)' },
  ];

  return (
    <Box sx={{ animation: 'fade-in-up 0.5s ease-out' }}>
      {/* Welcome Banner */}
      <Card sx={{
        mb: 3, border: 'none', borderRadius: 4, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #FF6584 0%, #FF8FA3 50%, #FFB3C1 100%)',
        boxShadow: '0 6px 30px rgba(255,101,132,0.25)',
      }}>
        {[0, 1, 2].map(i => (
          <Box key={i} sx={{
            position: 'absolute', borderRadius: '50%',
            width: 50 + i * 35, height: 50 + i * 35,
            background: 'rgba(255,255,255,0.08)',
            right: `${10 + i * 14}%`, top: `${10 + i * 18}%`,
            animation: `float-gentle ${4 + i * 2}s ease-in-out infinite ${i * 0.6}s`,
          }} />
        ))}
        <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={avatarUrl} sx={{
              width: 56, height: 56, border: '3px solid rgba(255,255,255,0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)', bgcolor: '#FF6584', fontSize: '1.5rem',
            }}>
              {(user?.fullName || 'A')[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Xin chào, Quản trị viên 👋
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
                Chào mừng <strong>{user?.fullName || user?.username}</strong> quay trở lại
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((st, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i}>
            <Card sx={{
              borderRadius: 3, overflow: 'hidden', position: 'relative',
              animation: `fade-in-up 0.4s ease-out ${i * 0.1}s both`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${st.color}20` },
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      {st.label}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: st.color, lineHeight: 1.2 }}>
                      {st.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 50, height: 50, background: st.bg, boxShadow: `0 4px 15px ${st.color}30` }}>
                    {st.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Access */}
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
        ⚡ Truy cập nhanh
      </Typography>
      <Grid container spacing={2}>
        {[
          { icon: <PeopleRounded />, label: 'Quản lý Users', desc: 'Xem và quản lý tài khoản', path: '/admin/users', accent: '#FF6584' },
          { icon: <SchoolRounded />, label: 'Quản lý Học sinh', desc: 'Phân lớp và theo dõi', path: '/admin/students', accent: '#6C63FF' },
          { icon: <PersonRounded />, label: 'Quản lý Giáo viên', desc: 'Phân công môn dạy', path: '/admin/teachers', accent: '#06B6D4' },
          { icon: <ClassRounded />, label: 'Quản lý Lớp học', desc: 'Tạo và sắp xếp lớp', path: '/admin/classrooms', accent: '#10B981' },
          { icon: <BookRounded />, label: 'Quản lý Môn học', desc: 'Thêm và chỉnh sửa môn', path: '/admin/subjects', accent: '#F59E0B' },
          { icon: <ScheduleRounded />, label: 'Thời khóa biểu', desc: 'Quản lý lịch giảng dạy', path: '/admin/schedules', accent: '#8B5CF6' },
          { icon: <TrendingUpRounded />, label: 'Thống kê', desc: 'Xem biểu đồ và báo cáo', path: '/admin/statistics', accent: '#EC4899' },
        ].map((f, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Card onClick={() => navigate(f.path)} sx={{
              cursor: 'pointer', borderRadius: 3, transition: 'all 0.35s ease',
              animation: `fade-in-up 0.4s ease-out ${0.3 + i * 0.07}s both`,
              overflow: 'hidden', position: 'relative',
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0,
                width: '100%', height: 3,
                background: `linear-gradient(90deg, ${f.accent}, ${f.accent}44)`,
                opacity: 0, transition: 'opacity 0.3s ease',
              },
              '&:hover': {
                transform: 'translateY(-5px)', boxShadow: `0 10px 30px ${f.accent}15`,
                '&::before': { opacity: 1 },
              },
            }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  width: 44, height: 44, bgcolor: `${f.accent}14`, color: f.accent,
                  border: `1.5px solid ${f.accent}20`,
                }}>
                  {f.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{f.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{f.desc}</Typography>
                </Box>
                <ArrowForwardRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/* ───── Skeleton Loading ───── */
function DashboardSkeleton() {
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={90} sx={{ borderRadius: 4, mb: 2 }} />
        <Grid container spacing={2}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Grid size={{ xs: 6, sm: 4 }} key={i}>
              <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Skeleton variant="rounded" height={250} sx={{ borderRadius: 4, mb: 2 }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3, mb: 1.5 }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3, mb: 1.5 }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3 }} />
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const isDark = mode === 'dark';

  if (user?.role === 'STUDENT') return <StudentDashboard user={user} isDark={isDark} navigate={navigate} />;
  if (user?.role === 'TEACHER') return <TeacherDashboard user={user} isDark={isDark} navigate={navigate} />;
  return <AdminDashboard user={user} isDark={isDark} navigate={navigate} />;
}
