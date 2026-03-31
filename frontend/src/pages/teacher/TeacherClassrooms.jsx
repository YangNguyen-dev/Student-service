import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Avatar, Chip, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip,
  useTheme,
} from '@mui/material';
import {
  ClassRounded, VisibilityRounded, GradeRounded, ArrowBackRounded, SaveRounded,
} from '@mui/icons-material';

export default function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'students' | 'grades'
  const [gradeDialog, setGradeDialog] = useState({ open: false });
  const [gradeInputs, setGradeInputs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try { setClassrooms(await teacherService.getMyClassrooms()); }
      catch { setError('Không thể tải lớp học'); }
      finally { setLoading(false); }
    })();
  }, []);

  const viewStudents = async (cls) => {
    setSelectedClass(cls); setDetailLoading(true); setView('students');
    try { setStudents(await teacherService.getStudentsByClass(cls.classId)); }
    catch { setError('Không thể tải danh sách HS'); }
    finally { setDetailLoading(false); }
  };

  const viewGrades = async (cls) => {
    setSelectedClass(cls); setDetailLoading(true); setView('grades');
    try { setGrades(await teacherService.getGradesByClass(cls.classId)); }
    catch { setError('Không thể tải bảng điểm'); }
    finally { setDetailLoading(false); }
  };

  const openGradeInput = () => {
    setGradeInputs(students.map((s) => ({
      studentId: s.studentId, fullName: s.username,
      oralScore: '', quiz15Score: '', midtermScore: '', finalScore: '',
    })));
    setGradeDialog({ open: true });
  };

  const handleGradeChange = (idx, field, value) => {
    const v = value === '' ? '' : Math.min(10, Math.max(0, parseFloat(value) || 0));
    setGradeInputs((prev) => prev.map((g, i) => i === idx ? { ...g, [field]: v } : g));
  };

  const handleSaveGrades = async () => {
    setSaving(true); setError('');
    try {
      const payload = gradeInputs
        .filter((g) => g.oralScore !== '' || g.quiz15Score !== '' || g.midtermScore !== '' || g.finalScore !== '')
        .map((g) => ({
          studentId: g.studentId,
          oralScore: g.oralScore === '' ? null : g.oralScore,
          quiz15Score: g.quiz15Score === '' ? null : g.quiz15Score,
          midtermScore: g.midtermScore === '' ? null : g.midtermScore,
          finalScore: g.finalScore === '' ? null : g.finalScore,
        }));
      await teacherService.inputGrades(selectedClass.classId, payload);
      setGradeDialog({ open: false });
      setSuccess('Nhập điểm thành công!');
      setTimeout(() => setSuccess(''), 3000);
      viewGrades(selectedClass);
    } catch { setError('Nhập điểm thất bại'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#06B6D4' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải lớp học...</Typography>
    </Box>
  );

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {view === 'list' && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #06B6D4, #6C63FF)', boxShadow: '0 4px 20px rgba(6,182,212,0.3)' }}>
              <ClassRounded sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Lớp học của tôi</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{classrooms.length} lớp</Typography>
            </Box>
          </Box>
          <Grid container spacing={2}>
            {classrooms.map((c) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.classId}>
                <Card sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(108,99,255,0.15)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>{c.classroomName}</Typography>
                    {c.homeroomTeacher && <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>GVCN: {c.homeroomTeacher}</Typography>}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<VisibilityRounded />} onClick={() => viewStudents(c)} sx={{ color: '#6C63FF' }}>Danh sách</Button>
                      <Button size="small" startIcon={<GradeRounded />} onClick={() => viewGrades(c)} sx={{ color: '#4CAF50' }}>Điểm</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {view === 'students' && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <IconButton onClick={() => setView('list')} sx={{ color: 'text.secondary' }}><ArrowBackRounded /></IconButton>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>HS lớp {selectedClass?.classroomName}</Typography>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<GradeRounded />} onClick={openGradeInput}>Nhập điểm</Button>
          </Box>
          <Card>
            {detailLoading ? <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box> : (
              <TableContainer><Table>
                <TableHead><TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Họ tên</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Ngày sinh</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {students.length === 0 ? <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có HS</TableCell></TableRow> :
                    students.map((s) => (
                      <TableRow key={s.studentId} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>{s.studentId}</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{s.fullName || s.username}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{s.dateOfBirth || '—'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table></TableContainer>
            )}
          </Card>
        </>
      )}

      {view === 'grades' && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <IconButton onClick={() => setView('list')} sx={{ color: 'text.secondary' }}><ArrowBackRounded /></IconButton>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>Điểm lớp {selectedClass?.classroomName}</Typography>
          </Box>
          <Card>
            {detailLoading ? <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box> : (
              <TableContainer><Table>
                <TableHead><TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Học sinh</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Miệng</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>15 phút</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>1 tiết</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Thi</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Điểm trung bình</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {grades.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Chưa có điểm</TableCell></TableRow> :
                    grades.map((g, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{g.studentName}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.oralScore ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.quiz15Score ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.midtermScore ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.finalScore ?? '—'}</TableCell>
                        <TableCell sx={{ color: g.averageScore >= 5 ? '#4CAF50' : '#FF5252', fontWeight: 700 }}>{g.averageScore != null ? g.averageScore.toFixed(2) : '—'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table></TableContainer>
            )}
          </Card>
        </>
      )}

      {/* Grade Input Dialog */}
      <Dialog open={gradeDialog.open} onClose={() => setGradeDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: 'text.primary' }}>Nhập điểm - {selectedClass?.classroomName}</DialogTitle>
        <DialogContent>
          <TableContainer><Table size="small">
            <TableHead><TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>Họ tên</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Miệng</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>15 phút</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>1 tiết</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Thi</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {gradeInputs.map((g, i) => (
                <TableRow key={g.studentId}>
                  <TableCell sx={{ color: 'text.primary' }}>{g.fullName}</TableCell>
                  {['oralScore', 'quiz15Score', 'midtermScore', 'finalScore'].map((f) => (
                    <TableCell key={f}><TextField size="small" type="number" value={g[f]} onChange={(e) => handleGradeChange(i, f, e.target.value)}
                      inputProps={{ min: 0, max: 10, step: 0.1 }} sx={{ width: 80 }} /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table></TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog({ open: false })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleSaveGrades} variant="contained" startIcon={<SaveRounded />} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Lưu điểm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

