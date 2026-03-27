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

const formatDate = (d) => {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

export default function TeacherTeaching() {
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
    try {
      const [sts, grs] = await Promise.all([
        teacherService.getStudentsByClass(cls.classId),
        teacherService.getGradesByClass(cls.classId),
      ]);
      const gradeMap = {};
      grs.forEach((g) => { gradeMap[g.studentId] = g; });
      setGrades(sts.map((s) => {
        const g = gradeMap[s.studentId];
        const oral = g?.oralScore ?? null;
        const quiz = g?.quiz15Score ?? null;
        const mid = g?.midtermScore ?? null;
        const fin = g?.finalScore ?? null;
        const scores = [oral, quiz, mid, fin];
        const hasAny = scores.some((v) => v != null);
        const avg = hasAny ? scores.reduce((a, b) => a + (b ?? 0), 0) / 4 : null;
        return {
          studentId: s.studentId,
          studentCode: s.studentCode,
          studentName: s.fullName || s.username,
          oralScore: oral, quiz15Score: quiz, midtermScore: mid, finalScore: fin,
          averageScore: avg,
        };
      }));
    } catch { setError('Không thể tải bảng điểm'); }
    finally { setDetailLoading(false); }
  };

  const openGradeInput = async () => {
    // Fetch existing grades to pre-fill
    let existingGrades = [];
    try {
      existingGrades = await teacherService.getGradesByClass(selectedClass.classId);
    } catch { /* ignore */ }
    const gradeMap = {};
    existingGrades.forEach((g) => { gradeMap[g.studentId] = g; });

    const list = students.length > 0 ? students : await teacherService.getStudentsByClass(selectedClass.classId);
    if (students.length === 0) setStudents(list);

    setGradeInputs(list.map((s) => {
      const existing = gradeMap[s.studentId];
      return {
        studentId: s.studentId, fullName: s.fullName || s.username, studentCode: s.studentCode,
        oralScore: existing?.oralScore ?? '', quiz15Score: existing?.quiz15Score ?? '',
        midtermScore: existing?.midtermScore ?? '', finalScore: existing?.finalScore ?? '',
      };
    }));
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
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Lớp dạy học</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{classrooms.length} lớp • Quản lý điểm và danh sách</Typography>
            </Box>
          </Box>
          <Grid container spacing={2}>
            {classrooms.map((c, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.classId}>
                <Card sx={{
                  borderRadius: 3, overflow: 'hidden', position: 'relative',
                  animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': { content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: `linear-gradient(90deg, #06B6D4, #6C63FF)`, opacity: 0, transition: 'opacity 0.3s' },
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 35px rgba(108,99,255,0.15)', '&::before': { opacity: 1 } },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Avatar sx={{ width: 42, height: 42, background: '#06B6D415', color: '#06B6D4' }}><ClassRounded /></Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>{c.classroomName}</Typography>
                        {c.homeroomTeacher && <Typography variant="caption" sx={{ color: 'text.secondary' }}>GVCN: {c.homeroomTeacher}</Typography>}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<VisibilityRounded />} onClick={() => viewStudents(c)} sx={{ color: '#6C63FF', fontWeight: 600 }}>Danh sách</Button>
                      <Button size="small" startIcon={<GradeRounded />} onClick={() => viewGrades(c)} sx={{ color: '#10B981', fontWeight: 600 }}>Điểm</Button>
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
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>Học sinh lớp {selectedClass?.classroomName}</Typography>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<GradeRounded />} onClick={() => viewGrades(selectedClass)} sx={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>Xem điểm</Button>
          </Box>
          <Card>
            {detailLoading ? <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box> : (
              <TableContainer><Table>
                <TableHead><TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>STT</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Mã HS</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Họ và Tên</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Giới tính</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Ngày sinh</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Email</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {students.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có học sinh</TableCell></TableRow> :
                    students.map((s, idx) => (
                      <TableRow key={s.studentId} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{s.studentCode || '—'}</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{s.fullName || s.username}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{s.gender === 'MALE' ? 'Nam' : s.gender === 'FEMALE' ? 'Nữ' : '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{formatDate(s.dateOfBirth)}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{s.email || '—'}</TableCell>
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
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<GradeRounded />} onClick={openGradeInput}>Nhập / Sửa điểm</Button>
          </Box>
          <Card>
            {detailLoading ? <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box> : (
              <TableContainer><Table>
                <TableHead><TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>STT</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Mã HS</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Họ và Tên</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Thường Xuyên 1</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Thường Xuyên 2</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Giữa Kỳ</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Cuối Kỳ</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Trung Bình</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {grades.length === 0 ? <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có học sinh</TableCell></TableRow> :
                    grades.map((g, i) => (
                      <TableRow key={g.studentId} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>{i + 1}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.studentCode || '—'}</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{g.studentName}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.oralScore ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.quiz15Score ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.midtermScore ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{g.finalScore ?? '—'}</TableCell>
                        <TableCell sx={{ color: g.averageScore >= 5 ? '#4CAF50' : g.averageScore != null ? '#FF5252' : '#6B7280', fontWeight: 700 }}>{g.averageScore != null ? g.averageScore.toFixed(2) : '—'}</TableCell>
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
              <TableCell sx={{ color: 'text.secondary' }}>STT</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Mã HS</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Họ và Tên</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Thường Xuyên 1</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Thường Xuyên 2</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Giữa Kỳ</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>Cuối Kỳ</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {gradeInputs.map((g, i) => (
                <TableRow key={g.studentId}>
                  <TableCell sx={{ color: 'text.secondary' }}>{i + 1}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{g.studentCode || '—'}</TableCell>
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

