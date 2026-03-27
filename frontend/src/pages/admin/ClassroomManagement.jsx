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
  SearchRounded, ClassRounded, RefreshRounded, AddRounded, EditRounded,
  DeleteRounded, PersonRounded,
} from '@mui/icons-material';

export default function ClassroomManagement() {
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState({ open: false, classroom: null, mode: 'create' });
  const [formData, setFormData] = useState({ classroomName: '', maxStudents: '' });
  const [homeroomDialog, setHomeroomDialog] = useState({ open: false, classroom: null });
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, classroom: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [c, t] = await Promise.all([adminService.getAllClassrooms(), adminService.getAllTeachers()]);
      setClassrooms(c); setTeachers(t);
    } catch { setError('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!formData.classroomName.trim()) return;
    setActionLoading(true);
    try {
      if (formDialog.mode === 'create') await adminService.createClassroom(formData);
      else await adminService.updateClassroom(formDialog.classroom.classId, formData);
      setFormDialog({ open: false, classroom: null, mode: 'create' }); setFormData({ classroomName: '', maxStudents: '' }); fetchData();
    } catch { setError('Lưu lớp thất bại'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.classroom) return;
    setActionLoading(true);
    try { await adminService.deleteClassroom(deleteDialog.classroom.classId); setDeleteDialog({ open: false, classroom: null }); fetchData(); }
    catch { setError('Xóa lớp thất bại'); }
    finally { setActionLoading(false); }
  };

  const handleSetHomeroom = async () => {
    if (!homeroomDialog.classroom || !selectedTeacherId) return;
    setActionLoading(true);
    try { await adminService.setHomeroomTeacher(homeroomDialog.classroom.classId, selectedTeacherId); setHomeroomDialog({ open: false, classroom: null }); setSelectedTeacherId(''); fetchData(); }
    catch { setError('Gán GVCN thất bại'); }
    finally { setActionLoading(false); }
  };

  const filtered = classrooms.filter((c) => c.classroomName?.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
            <ClassRounded sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Quản lý Lớp học</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{classrooms.length} lớp học • Quản lý và phân công</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ width: 200 }} />
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setFormDialog({ open: true, classroom: null, mode: 'create' }); setFormData({ classroomName: '', maxStudents: '' }); }}>Thêm lớp</Button>
          <Tooltip title="Làm mới"><IconButton onClick={fetchData} sx={{ color: 'text.secondary' }}><RefreshRounded /></IconButton></Tooltip>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box> : (
          <>
          <TableContainer><Table>
            <TableHead><TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Tên lớp</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>GVCN</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Sĩ số</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Thao tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow> :
                paged.map((c) => (
                  <TableRow key={c.classId} hover>
                    <TableCell sx={{ color: 'text.secondary' }}>{c.classId}</TableCell>
                    <TableCell><Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{c.classroomName}</Typography></TableCell>
                    <TableCell>{c.homeroomTeacher ? <Chip label={c.homeroomTeacher} size="small" sx={{ backgroundColor: '#4CAF5018', color: '#4CAF50' }} /> : <Chip label="Chưa có" size="small" sx={{ color: 'text.secondary' }} />}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{c.studentCount ?? 0}{c.maxStudents ? ` / ${c.maxStudents}` : ''}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Gán GVCN"><IconButton size="small" onClick={() => { setHomeroomDialog({ open: true, classroom: c }); setSelectedTeacherId(''); }} sx={{ color: 'text.secondary', mr: 0.5 }}><PersonRounded fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setFormDialog({ open: true, classroom: c, mode: 'edit' }); setFormData({ classroomName: c.classroomName, maxStudents: c.maxStudents ?? '' }); }} sx={{ color: 'text.secondary', mr: 0.5 }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, classroom: c })} sx={{ color: 'text.secondary' }}><DeleteRounded fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table></TableContainer>
          <TablePagination
            component="div" count={filtered.length} page={page}
            onPageChange={(e, p) => { setPage(p); document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' }); }} rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[25]} labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            sx={{ color: 'text.secondary', borderTop: '1px solid rgba(0,0,0,0.06)' }}
          />
          </>
        )}
      </Card>

      <Dialog open={formDialog.open} onClose={() => setFormDialog({ open: false, classroom: null, mode: 'create' })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'text.primary' }}>{formDialog.mode === 'create' ? 'Thêm lớp mới' : 'Sửa lớp'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tên lớp" value={formData.classroomName} onChange={(e) => setFormData({ ...formData, classroomName: e.target.value })} sx={{ mt: 1 }} />
          <TextField fullWidth label="Sĩ số tối đa" type="number" value={formData.maxStudents} onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value === '' ? '' : parseInt(e.target.value) })} sx={{ mt: 2 }} inputProps={{ min: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialog({ open: false, classroom: null, mode: 'create' })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.classroomName.trim() || actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Lưu'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={homeroomDialog.open} onClose={() => setHomeroomDialog({ open: false, classroom: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'text.primary' }}>Gán GVCN</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>Lớp: <strong style={{ color: 'text.primary' }}>{homeroomDialog.classroom?.classroomName}</strong></Typography>
          <FormControl fullWidth size="small"><InputLabel>Chọn GV</InputLabel>
            <Select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} label="Chọn GV">
              {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.fullName || t.username}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHomeroomDialog({ open: false, classroom: null })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleSetHomeroom} variant="contained" disabled={!selectedTeacherId || actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Gán'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, classroom: null })}>
        <DialogTitle sx={{ color: 'text.primary' }}>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography sx={{ color: 'text.secondary' }}>Xóa lớp <strong style={{ color: 'text.primary' }}>{deleteDialog.classroom?.classroomName}</strong>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, classroom: null })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Xóa'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

