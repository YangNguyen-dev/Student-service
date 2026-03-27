import { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { adminService } from '../../services/adminService';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  InputAdornment, Avatar, Tooltip, Select, MenuItem, FormControl, InputLabel, TablePagination,
  useTheme,
} from '@mui/material';
import { SearchRounded, PersonRounded, RefreshRounded, LinkRounded } from '@mui/icons-material';

const formatDate = (d) => {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [assignDialog, setAssignDialog] = useState({ open: false, teacher: null });
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, s] = await Promise.all([adminService.getAllTeachers(), adminService.getAllSubjects()]);
      setTeachers(t);
      setSubjects(s);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async () => {
    if (!assignDialog.teacher || !selectedSubjectId) return;
    setActionLoading(true);
    try {
      await adminService.assignTeacherToSubject(assignDialog.teacher.id, selectedSubjectId);
      setAssignDialog({ open: false, teacher: null });
      setSelectedSubjectId('');
      fetchData();
    } catch (err) {
      setError('Gán môn học thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = teachers.filter(
    (t) =>
      (t.fullName || t.username)?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.teacherCode?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #10B981, #34D399)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
            <PersonRounded sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Quản lý Giáo viên</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{teachers.length} giáo viên • Phân công môn dạy</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ color: 'text.secondary' }} /></InputAdornment> }}
            sx={{ width: 240 }}
          />
          <Tooltip title="Làm mới"><IconButton onClick={fetchData} sx={{ color: 'text.secondary' }}><RefreshRounded /></IconButton></Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box>
        ) : (
          <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Mã GV</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Họ và Tên</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Ngày sinh</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Môn dạy</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                ) : (
                  paged.map((t) => (
                    <TableRow key={t.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                      <TableCell sx={{ color: 'text.secondary' }}>{t.teacherCode || '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14, backgroundColor: '#4CAF5022', color: '#4CAF50' }}>
                            {(t.fullName || t.username)?.charAt(0)?.toUpperCase() || 'T'}
                          </Avatar>
                          <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{t.fullName || t.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{formatDate(t.dateOfBirth)}</TableCell>
                      <TableCell>
                        {t.subject?.subjectName ? (
                          <Chip label={t.subject.subjectName} size="small" sx={{ backgroundColor: '#6C63FF18', color: '#6C63FF', border: '1px solid #6C63FF33' }} />
                        ) : (
                          <Chip label="Chưa phân công" size="small" sx={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'text.secondary' }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Gán môn dạy">
                          <IconButton size="small" onClick={() => { setAssignDialog({ open: true, teacher: t }); setSelectedSubjectId(''); }}
                            sx={{ color: 'text.secondary', '&:hover': { color: '#6C63FF', backgroundColor: 'rgba(108,99,255,0.08)' } }}>
                            <LinkRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={filtered.length} page={page}
            onPageChange={(e, p) => { setPage(p); document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' }); }} rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[25]} labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            sx={{ color: 'text.secondary', borderTop: '1px solid rgba(0,0,0,0.06)' }}
          />
          </>
        )}
      </Card>

      {/* Assign Subject Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, teacher: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'text.primary' }}>Gán môn dạy cho giáo viên</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>
            Giáo viên: <strong style={{ color: 'text.primary' }}>{assignDialog.teacher?.fullName || assignDialog.teacher?.username}</strong>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Chọn môn</InputLabel>
            <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} label="Chọn môn">
              {subjects.map((s) => (
                <MenuItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, teacher: null })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!selectedSubjectId || actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Gán môn'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

