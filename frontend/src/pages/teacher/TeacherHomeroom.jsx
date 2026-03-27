import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Avatar, Chip, Grid, Collapse,
  IconButton, Tooltip, useTheme,
} from '@mui/material';
import {
  HomeRounded, SchoolRounded, KeyboardArrowDownRounded, KeyboardArrowUpRounded,
  GradeRounded, EmojiEventsRounded,
} from '@mui/icons-material';

const formatDate = (d) => {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

const formatScore = (s) => (s != null ? s.toFixed(1) : '—');

const getScoreColor = (avg) => {
  if (avg == null) return 'text.secondary';
  if (avg >= 8) return '#10B981';
  if (avg >= 6.5) return '#6C63FF';
  if (avg >= 5) return '#F59E0B';
  return '#FF6584';
};

const getRank = (avg) => {
  if (avg == null) return null;
  if (avg >= 8) return 'Giỏi';
  if (avg >= 6.5) return 'Khá';
  if (avg >= 5) return 'Trung Bình';
  return 'Yếu';
};

export default function TeacherHomeroom() {
  const [homeroomClass, setHomeroomClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noHomeroom, setNoHomeroom] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [profile, classrooms] = await Promise.all([
          teacherService.getProfile(),
          teacherService.getMyClassrooms(),
        ]);
        const teacherName = profile.fullName || profile.username;
        const found = classrooms.find((c) => c.homeroomTeacher === teacherName);
        if (found) {
          setHomeroomClass(found);
          const [sts, grs] = await Promise.all([
            teacherService.getStudentsByClass(found.classId),
            teacherService.getHomeroomGrades(),
          ]);
          setStudents(sts);
          setGrades(grs);
        } else {
          setNoHomeroom(true);
        }
      } catch {
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group grades by studentId
  const gradesByStudent = {};
  grades.forEach((g) => {
    if (!gradesByStudent[g.studentId]) gradesByStudent[g.studentId] = [];
    gradesByStudent[g.studentId].push(g);
  });

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#FF6584' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải dữ liệu lớp chủ nhiệm...</Typography>
    </Box>
  );

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #FF6584, #FF8FA3)', boxShadow: '0 4px 20px rgba(255,101,132,0.3)' }}>
          <HomeRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Lớp chủ nhiệm</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {homeroomClass ? homeroomClass.classroomName : 'Không có'}
          </Typography>
        </Box>
      </Box>

      {noHomeroom ? (
        <Card sx={{ textAlign: 'center', py: 8, px: 4 }}>
          <CardContent>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, backgroundColor: '#FF658422', color: '#FF6584' }}>
              <HomeRounded sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Bạn đang không chủ nhiệm lớp nào
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Hiện tại bạn chưa được phân công làm giáo viên chủ nhiệm.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Class info card */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Lớp', value: homeroomClass?.classroomName, icon: <HomeRounded sx={{ fontSize: 20 }} />, color: '#FF6584', delay: '0s' },
              { label: 'Sĩ số', value: `${homeroomClass?.studentCount ?? students.length}/${homeroomClass?.maxStudents || '—'}`, icon: <SchoolRounded sx={{ fontSize: 20 }} />, color: '#6C63FF', delay: '0.1s' },
              { label: 'Vai trò', value: 'GVCN', icon: <EmojiEventsRounded sx={{ fontSize: 20 }} />, color: '#10B981', delay: '0.2s', isChip: true },
            ].map(c => (
              <Card key={c.label} sx={{ flex: '1 1 160px', borderRadius: 3, animation: `slideUp 0.5s ease-out ${c.delay} both`, transition: 'all 0.3s', border: '1px solid', borderColor: `${c.color}25`, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${c.color}20` } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 40, height: 40, background: `${c.color}15`, color: c.color }}>{c.icon}</Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>{c.label}</Typography>
                    {c.isChip ? (
                      <Chip label={c.value} size="small" sx={{ mt: 0.25, fontWeight: 700, height: 24, fontSize: '0.75rem', backgroundColor: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }} />
                    ) : (
                      <Typography variant="h5" sx={{ fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value}</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Student list with expandable grades */}
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolRounded sx={{ color: '#6C63FF' }} /> Danh sách học sinh ({students.length})
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Bấm vào học sinh để xem bảng điểm chi tiết
          </Typography>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, width: 40 }}></TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>STT</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Mã HS</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Họ và Tên</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Ngày sinh</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Giới tính</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">Xếp loại</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>Lớp chưa có học sinh</TableCell></TableRow>
                  ) : (
                    students.map((s, idx) => {
                      const studentGrades = gradesByStudent[s.studentId] || [];
                      const validAvgs = studentGrades.filter(g => g.averageScore != null).map(g => g.averageScore);
                      const overallAvg = validAvgs.length > 0 ? validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length : null;
                      const isExpanded = expandedId === s.studentId;
                      const rank = getRank(overallAvg);

                      return (
                        <>
                          <TableRow
                            key={s.studentId}
                            hover
                            onClick={() => toggleExpand(s.studentId)}
                            sx={{
                              cursor: 'pointer',
                              animation: `slideUp 0.4s ease-out ${0.3 + idx * 0.04}s both`,
                              transition: 'all 0.25s ease',
                              backgroundColor: isExpanded ? 'action.selected' : 'transparent',
                              '&:hover': { backgroundColor: 'action.hover' },
                            }}
                          >
                            <TableCell sx={{ px: 1 }}>
                              <IconButton size="small" sx={{ color: 'text.secondary', transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                <KeyboardArrowDownRounded />
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{s.studentCode || '—'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: 14, backgroundColor: '#6C63FF22', color: '#6C63FF' }}>
                                  {(s.fullName || s.username)?.charAt(0)?.toUpperCase() || 'S'}
                                </Avatar>
                                <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{s.fullName || s.username}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{formatDate(s.dateOfBirth)}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{s.gender === 'MALE' ? 'Nam' : s.gender === 'FEMALE' ? 'Nữ' : '—'}</TableCell>
                            <TableCell align="center">
                              {overallAvg != null ? (
                                <Chip
                                  label={`${overallAvg.toFixed(1)} — ${rank}`}
                                  size="small"
                                  icon={overallAvg >= 8 ? <EmojiEventsRounded sx={{ fontSize: 14, color: `${getScoreColor(overallAvg)} !important` }} /> : undefined}
                                  sx={{
                                    fontWeight: 700, fontSize: '0.75rem',
                                    backgroundColor: `${getScoreColor(overallAvg)}14`,
                                    color: getScoreColor(overallAvg),
                                    border: `1px solid ${getScoreColor(overallAvg)}30`,
                                  }}
                                />
                              ) : (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>—</Typography>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Expandable grades section */}
                          <TableRow key={`${s.studentId}-grades`}>
                            <TableCell colSpan={7} sx={{ p: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{
                                  px: 3, py: 2, mx: 2, mb: 2, mt: 0.5,
                                  borderRadius: 2,
                                  backgroundColor: 'action.hover',
                                }}>
                                  {studentGrades.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                      <GradeRounded sx={{ fontSize: 36, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chưa có dữ liệu điểm cho học sinh này</Typography>
                                    </Box>
                                  ) : (
                                    <>
                                      <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <GradeRounded sx={{ fontSize: 18, color: '#6C63FF' }} />
                                        Bảng điểm — {s.fullName || s.username}
                                      </Typography>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>Môn học</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>Thường Xuyên 1</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>Thường Xuyên 2</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>Giữa Kỳ</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>Cuối Kỳ</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>Trung Bình</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {studentGrades.map((g) => (
                                            <TableRow key={g.gradeId} hover>
                                              <TableCell sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}>{g.subjectName}</TableCell>
                                              <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{formatScore(g.oralScore)}</TableCell>
                                              <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{formatScore(g.quiz15Score)}</TableCell>
                                              <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{formatScore(g.midtermScore)}</TableCell>
                                              <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{formatScore(g.finalScore)}</TableCell>
                                              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.85rem', color: getScoreColor(g.averageScore) }}>
                                                {formatScore(g.averageScore)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
}
