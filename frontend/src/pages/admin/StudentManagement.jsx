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
import {
  SearchRounded, SchoolRounded, RefreshRounded, LinkRounded, LinkOffRounded,
} from '@mui/icons-material';

const formatDate = (d) => {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [assignDialog, setAssignDialog] = useState({ open: false, student: null });
  const [selectedClassId, setSelectedClassId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, c] = await Promise.all([adminService.getAllStudents(), adminService.getAllClassrooms()]);
      setStudents(s);
      setClassrooms(c);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async () => {
    if (!assignDialog.student || !selectedClassId) return;
    setActionLoading(true);
    try {
      await adminService.assignStudentToClass(assignDialog.student.studentId, selectedClassId);
      setAssignDialog({ open: false, student: null });
      setSelectedClassId('');
      fetchData();
    } catch (err) {
      setError('Gán lớp thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromClass = async (studentId) => {
    setActionLoading(true);
    try {
      await adminService.removeStudentFromClass(studentId);
      fetchData();
    } catch (err) {
      setError('Xóa khỏi lớp thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      (s.fullName || s.username)?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.studentCode?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #6C63FF, #9D97FF)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}>
            <SchoolRounded sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Quản lý Học sinh</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{students.length} học sinh • Quản lý và phân lớp</Typography>
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
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Mã HS</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Họ và Tên</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Ngày sinh</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Lớp</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                ) : (
                  paged.map((s) => (
                    <TableRow key={s.studentId} hover sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
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
                      <TableCell>
                        {s.classroomName ? (
                          <Chip label={s.classroomName} size="small" sx={{ backgroundColor: '#4CAF5018', color: '#4CAF50', border: '1px solid #4CAF5033' }} />
                        ) : (
                          <Chip label="Chưa có lớp" size="small" sx={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'text.secondary' }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Gán lớp">
                          <IconButton size="small" onClick={() => { setAssignDialog({ open: true, student: s }); setSelectedClassId(''); }}
                            sx={{ color: 'text.secondary', mr: 0.5, '&:hover': { color: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.08)' } }}>
                            <LinkRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {s.classroomName && (
                          <Tooltip title="Xóa khỏi lớp">
                            <IconButton size="small" onClick={() => handleRemoveFromClass(s.studentId)}
                              sx={{ color: 'text.secondary', '&:hover': { color: '#FF5252', backgroundColor: 'rgba(255,82,82,0.08)' } }}>
                              <LinkOffRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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

      {/* Assign Class Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, student: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'text.primary' }}>Gán học sinh vào lớp</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>
            Học sinh: <strong style={{ color: 'text.primary' }}>{assignDialog.student?.fullName || assignDialog.student?.username}</strong>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Chọn lớp</InputLabel>
            <Select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} label="Chọn lớp">
              {classrooms.map((c) => (
                <MenuItem key={c.classId} value={c.classId}>{c.classroomName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, student: null })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!selectedClassId || actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Gán lớp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

