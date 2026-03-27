import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Avatar, Grid, Chip, Tooltip,
  useTheme,
} from '@mui/material';
import {
  ScheduleRounded, ClassRounded, PersonRounded, AccessTimeRounded,
  TodayRounded, EventNoteRounded, SchoolRounded,
} from '@mui/icons-material';

const DAYS = [
  { value: 'MONDAY', label: 'Thứ 2', short: 'T2' },
  { value: 'TUESDAY', label: 'Thứ 3', short: 'T3' },
  { value: 'WEDNESDAY', label: 'Thứ 4', short: 'T4' },
  { value: 'THURSDAY', label: 'Thứ 5', short: 'T5' },
  { value: 'FRIDAY', label: 'Thứ 6', short: 'T6' },
  { value: 'SATURDAY', label: 'Thứ 7', short: 'T7' },
];
const PERIODS = [1, 2, 3, 4, 5];

const PERIOD_TIMES = {
  1: '7:00 - 7:45',
  2: '7:55 - 8:40',
  3: '9:00 - 9:45',
  4: '9:55 - 10:40',
  5: '10:50 - 11:35',
};

// Vibrant color palette for subjects
const SUBJECT_COLORS = [
  '#6C63FF', '#FF6584', '#10B981', '#F59E0B',
  '#06B6D4', '#8B5CF6', '#EC4899', '#EF4444',
  '#14B8A6', '#F97316', '#3B82F6',
];

const getSubjectColor = (subjectName) => {
  if (!subjectName) return '#6B7280';
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

const getCurrentDayValue = () => {
  const d = new Date().getDay(); // 0=Sun
  const map = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
  return map[d] || null;
};

export default function StudentSchedule() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [schedule, setSchedule] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const todayValue = getCurrentDayValue();

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([studentService.getSchedule(), studentService.getClassroom()]);
        setSchedule(s); setClassroom(c);
      } catch { setError('Không thể tải dữ liệu'); }
      finally { setLoading(false); }
    })();
  }, []);

  // Build grid
  const grid = {};
  PERIODS.forEach(p => { grid[p] = {}; DAYS.forEach(d => { grid[p][d.value] = null; }); });
  schedule.forEach(s => {
    if (s.period && grid[s.period]) grid[s.period][s.dayOfWeek] = s;
  });

  // Today stats
  const todaySchedule = schedule.filter(s => s.dayOfWeek === todayValue);
  const totalSubjects = new Set(schedule.map(s => s.subject).filter(Boolean)).size;

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#6C63FF' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải lịch học...</Typography>
    </Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{
      animation: 'fadeIn 0.5s ease-out',
      '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, #06B6D4, #6C63FF)',
          boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
          animation: 'slideUp 0.4s ease-out',
        }}>
          <ScheduleRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Thời khóa biểu
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Lịch học hàng tuần
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {/* Classroom Card */}
        {classroom && (
          <Card sx={{
            flex: '1 1 160px', borderRadius: 3,
            animation: 'slideUp 0.5s ease-out both',
            transition: 'all 0.3s ease',
            border: '1px solid', borderColor: '#FF658425',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(255,101,132,0.2)' },
          }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40, background: '#FF658415', color: '#FF6584' }}>
                <ClassRounded sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                  Lớp học
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                  {classroom.classroomName}
                </Typography>
                {classroom.homeroomTeacher && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.25 }}>
                    <PersonRounded sx={{ fontSize: 11, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      GVCN: {classroom.homeroomTeacher}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Today Card */}
        <Card sx={{
          flex: '1 1 160px', borderRadius: 3,
          animation: 'slideUp 0.5s ease-out 0.1s both',
          transition: 'all 0.3s ease',
          border: '1px solid', borderColor: '#10B98125',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(16,185,129,0.2)' },
        }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, background: '#10B98115', color: '#10B981' }}>
              <TodayRounded sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                Hôm nay
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981', lineHeight: 1.1 }}>
                {todaySchedule.length} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>tiết</Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Total Subjects */}
        <Card sx={{
          flex: '1 1 160px', borderRadius: 3,
          animation: 'slideUp 0.5s ease-out 0.2s both',
          transition: 'all 0.3s ease',
          border: '1px solid', borderColor: '#6C63FF25',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(108,99,255,0.2)' },
        }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, background: '#6C63FF15', color: '#6C63FF' }}>
              <SchoolRounded sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                Tổng môn
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#6C63FF', lineHeight: 1.1 }}>
                {totalSubjects} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>môn</Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Schedule Grid */}
      <Card sx={{
        borderRadius: 3, overflow: 'hidden',
        animation: 'slideUp 0.6s ease-out 0.3s both',
      }}>
        <Box sx={{
          p: 2.5, pb: 1.5,
          background: isDark
            ? 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(108,99,255,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(108,99,255,0.03) 100%)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNoteRounded sx={{ color: '#06B6D4', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Lịch học chi tiết
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 90, fontSize: '0.8rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeRounded sx={{ fontSize: 14 }} /> Tiết
                  </Box>
                </TableCell>
                {DAYS.map(d => {
                  const isToday = d.value === todayValue;
                  return (
                    <TableCell key={d.value} align="center" sx={{
                      fontWeight: 700, fontSize: '0.8rem', minWidth: 110,
                      color: isToday ? '#6C63FF' : 'text.secondary',
                      position: 'relative',
                    }}>
                      <Box>
                        {d.label}
                        {isToday && (
                          <Chip label="Hôm nay" size="small" sx={{
                            ml: 0.5, height: 16, fontSize: '0.6rem', fontWeight: 700,
                            backgroundColor: '#6C63FF15', color: '#6C63FF',
                          }} />
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {PERIODS.map((p, rowIdx) => (
                <TableRow key={p} sx={{ animation: `slideUp 0.4s ease-out ${0.4 + rowIdx * 0.06}s both` }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
                        Tiết {p}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                        {PERIOD_TIMES[p]}
                      </Typography>
                    </Box>
                  </TableCell>
                  {DAYS.map(d => {
                    const s = grid[p]?.[d.value];
                    const isToday = d.value === todayValue;
                    const color = getSubjectColor(s?.subject);
                    return (
                      <TableCell key={d.value} sx={{
                        textAlign: 'center', p: 0.8,
                        backgroundColor: isToday ? (isDark ? 'rgba(108,99,255,0.04)' : 'rgba(108,99,255,0.02)') : 'transparent',
                      }}>
                        {s ? (
                          <Tooltip title={`${s.subject || (s.scheduleType === 'CEREMONY' ? 'Chào cờ' : 'Sinh hoạt')} • GV: ${s.teacherName || '—'}`} arrow>
                            <Box sx={{
                              p: 1, borderRadius: 2,
                              background: isDark ? `${color}12` : `${color}08`,
                              border: `1px solid ${color}20`,
                              transition: 'all 0.25s ease',
                              cursor: 'default',
                              '&:hover': {
                                background: isDark ? `${color}20` : `${color}14`,
                                transform: 'scale(1.03)',
                                boxShadow: `0 4px 12px ${color}18`,
                              },
                            }}>
                              <Typography variant="body2" sx={{
                                fontWeight: 700, color, fontSize: '0.8rem',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {s.subject || (s.scheduleType === 'CEREMONY' ? '🚩 CC' : '🏫 SH')}
                              </Typography>
                              <Typography variant="caption" sx={{
                                color: 'text.secondary', display: 'block', fontSize: '0.65rem',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {s.teacherName || '—'}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
