import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Avatar, Grid, Chip, Tooltip,
  useTheme,
} from '@mui/material';
import {
  ScheduleRounded, AccessTimeRounded, TodayRounded, ClassRounded,
  EventNoteRounded,
} from '@mui/icons-material';

const DAYS = [
  { value: 'MONDAY', label: 'Thứ 2' },
  { value: 'TUESDAY', label: 'Thứ 3' },
  { value: 'WEDNESDAY', label: 'Thứ 4' },
  { value: 'THURSDAY', label: 'Thứ 5' },
  { value: 'FRIDAY', label: 'Thứ 6' },
  { value: 'SATURDAY', label: 'Thứ 7' },
];
const PERIODS = [1, 2, 3, 4, 5];
const PERIOD_TIMES = { 1: '7:00 - 7:45', 2: '7:55 - 8:40', 3: '9:00 - 9:45', 4: '9:55 - 10:40', 5: '10:50 - 11:35' };

const CLASS_COLORS = ['#6C63FF', '#FF6584', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899'];
const getClassColor = (name) => {
  if (!name) return '#6B7280';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CLASS_COLORS[Math.abs(h) % CLASS_COLORS.length];
};

const getCurrentDayValue = () => {
  const map = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
  return map[new Date().getDay()] || null;
};

export default function TeacherSchedule() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const todayValue = getCurrentDayValue();

  useEffect(() => {
    (async () => {
      try { setSchedule(await teacherService.getMySchedule()); }
      catch { setError('Không thể tải lịch dạy'); }
      finally { setLoading(false); }
    })();
  }, []);

  const grid = {};
  PERIODS.forEach(p => { grid[p] = {}; DAYS.forEach(d => { grid[p][d.value] = null; }); });
  schedule.forEach(s => { if (s.period && grid[s.period]) grid[s.period][s.dayOfWeek] = s; });

  const todaySchedule = schedule.filter(s => s.dayOfWeek === todayValue);
  const totalClasses = new Set(schedule.map(s => s.classroomName).filter(Boolean)).size;

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#10B981' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải lịch dạy...</Typography>
    </Box>
  );

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #10B981, #06B6D4)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
          <ScheduleRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Lịch dạy</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Thời khóa biểu giảng dạy hàng tuần</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Hôm nay', value: todaySchedule.length, unit: 'tiết', icon: <TodayRounded sx={{ fontSize: 20 }} />, color: '#10B981', delay: '0s' },
          { label: 'Tổng lớp dạy', value: totalClasses, unit: 'lớp', icon: <ClassRounded sx={{ fontSize: 20 }} />, color: '#6C63FF', delay: '0.1s' },
          { label: 'Tổng tiết/tuần', value: schedule.length, unit: 'tiết', icon: <AccessTimeRounded sx={{ fontSize: 20 }} />, color: '#F59E0B', delay: '0.2s' },
        ].map(c => (
          <Card key={c.label} sx={{ flex: '1 1 160px', borderRadius: 3, animation: `slideUp 0.5s ease-out ${c.delay} both`, transition: 'all 0.3s', border: `1px solid`, borderColor: `${c.color}25`, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${c.color}20` } }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40, background: `${c.color}15`, color: c.color }}>{c.icon}</Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>{c.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{c.unit}</Typography></Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', animation: 'slideUp 0.6s ease-out 0.3s both' }}>
        <Box sx={{ p: 2.5, pb: 1.5, background: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 100%)' : 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.03) 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNoteRounded sx={{ color: '#10B981', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Lịch giảng dạy chi tiết</Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 90, fontSize: '0.8rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AccessTimeRounded sx={{ fontSize: 14 }} /> Tiết</Box>
                </TableCell>
                {DAYS.map(d => {
                  const isToday = d.value === todayValue;
                  return (
                    <TableCell key={d.value} align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', minWidth: 110, color: isToday ? '#10B981' : 'text.secondary' }}>
                      <Box>{d.label}{isToday && <Chip label="Hôm nay" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#10B98115', color: '#10B981' }} />}</Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {PERIODS.map((p, rowIdx) => (
                <TableRow key={p} sx={{ animation: `slideUp 0.4s ease-out ${0.4 + rowIdx * 0.06}s both` }}>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>Tiết {p}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>{PERIOD_TIMES[p]}</Typography>
                    </Box>
                  </TableCell>
                  {DAYS.map(d => {
                    const s = grid[p]?.[d.value];
                    const isToday = d.value === todayValue;
                    const color = getClassColor(s?.classroomName);
                    return (
                      <TableCell key={d.value} sx={{ textAlign: 'center', p: 0.8, backgroundColor: isToday ? (isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.02)') : 'transparent' }}>
                        {s ? (
                          <Tooltip title={`${s.subject || (s.scheduleType === 'CEREMONY' ? 'Chào cờ' : 'Sinh hoạt')}${s.scheduleType === 'CEREMONY' ? ' • Toàn trường' : ` • Lớp ${s.classroomName}`}`} arrow>
                            <Box sx={{ p: 1, borderRadius: 2, background: isDark ? `${color}12` : `${color}08`, border: `1px solid ${color}20`, transition: 'all 0.25s', cursor: 'default', '&:hover': { background: isDark ? `${color}20` : `${color}14`, transform: 'scale(1.03)', boxShadow: `0 4px 12px ${color}18` } }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.subject || (s.scheduleType === 'CEREMONY' ? '🚩 Chào cờ' : '🏫 Sinh hoạt lớp')}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>{s.scheduleType === 'CEREMONY' ? 'Toàn trường' : (s.classroomName || '—')}</Typography>
                            </Box>
                          </Tooltip>
                        ) : <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
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
