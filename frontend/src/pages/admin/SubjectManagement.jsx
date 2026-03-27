import { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { adminService } from '../../services/adminService';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  InputAdornment, Avatar, Tooltip, TablePagination,
  useTheme,
} from '@mui/material';
import { SearchRounded, BookRounded, RefreshRounded, AddRounded, EditRounded, DeleteRounded } from '@mui/icons-material';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState({ open: false, subject: null, mode: 'create' });
  const [formData, setFormData] = useState({ subjectName: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try { setSubjects(await adminService.getAllSubjects()); }
    catch { setError('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!formData.subjectName.trim()) return;
    setActionLoading(true);
    try {
      if (formDialog.mode === 'create') await adminService.createSubject(formData);
      else await adminService.updateSubject(formDialog.subject.subjectId, formData);
      setFormDialog({ open: false, subject: null, mode: 'create' }); setFormData({ subjectName: '' }); fetchData();
    } catch { setError('Lưu thất bại'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.subject) return;
    setActionLoading(true);
    try { await adminService.deleteSubject(deleteDialog.subject.subjectId); setDeleteDialog({ open: false, subject: null }); fetchData(); }
    catch { setError('Xóa thất bại'); }
    finally { setActionLoading(false); }
  };

  const filtered = subjects.filter((s) => s.subjectName?.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #2196F3, #42A5F5)', boxShadow: '0 4px 20px rgba(33,150,243,0.3)' }}>
            <BookRounded sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Quản lý Môn học</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{subjects.length} môn học • Thêm, sửa, xóa</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ width: 200 }} />
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setFormDialog({ open: true, subject: null, mode: 'create' }); setFormData({ subjectName: '' }); }}>Thêm môn</Button>
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
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Tên môn học</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Thao tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow> :
                paged.map((s) => (
                  <TableRow key={s.subjectId} hover>
                    <TableCell sx={{ color: 'text.secondary' }}>{s.subjectId}</TableCell>
                    <TableCell><Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{s.subjectName}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setFormDialog({ open: true, subject: s, mode: 'edit' }); setFormData({ subjectName: s.subjectName }); }} sx={{ color: 'text.secondary', mr: 0.5 }}><EditRounded fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, subject: s })} sx={{ color: 'text.secondary' }}><DeleteRounded fontSize="small" /></IconButton></Tooltip>
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
      <Dialog open={formDialog.open} onClose={() => setFormDialog({ open: false, subject: null, mode: 'create' })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'text.primary' }}>{formDialog.mode === 'create' ? 'Thêm môn mới' : 'Sửa môn'}</DialogTitle>
        <DialogContent><TextField fullWidth label="Tên môn" value={formData.subjectName} onChange={(e) => setFormData({ subjectName: e.target.value })} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialog({ open: false, subject: null, mode: 'create' })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.subjectName.trim() || actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Lưu'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, subject: null })}>
        <DialogTitle sx={{ color: 'text.primary' }}>Xác nhận xóa</DialogTitle>
        <DialogContent><Typography sx={{ color: 'text.secondary' }}>Xóa môn <strong style={{ color: 'text.primary' }}>{deleteDialog.subject?.subjectName}</strong>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, subject: null })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Xóa'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

