import { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { adminService } from '../../services/adminService';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  InputAdornment, Avatar, Tooltip, TablePagination, Snackbar,
  useTheme,
} from '@mui/material';
import {
  DeleteRounded, SearchRounded, PeopleRounded, RefreshRounded,
  PersonRounded, LockResetRounded,
} from '@mui/icons-material';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Không thể tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteDialog.user.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== deleteDialog.user.userId));
      setDeleteDialog({ open: false, user: null });
    } catch (err) {
      setError('Xóa user thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.fullName || u.username)?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getRoleColor = (role) => {
    const colors = { ADMIN: '#FF6584', TEACHER: '#4CAF50', STUDENT: '#6C63FF' };
    return colors[role] || '#6B7280';
  };

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #FF6584, #FF8FA3)', boxShadow: '0 4px 20px rgba(255,101,132,0.3)' }}>
            <PeopleRounded sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Quản lý Users</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{users.length} người dùng • Quản lý tài khoản hệ thống</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small" placeholder="Tìm kiếm..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ color: 'text.secondary' }} /></InputAdornment> }}
            sx={{ width: 240 }}
          />
          <Tooltip title="Làm mới"><IconButton onClick={fetchUsers} sx={{ color: 'text.secondary' }}><RefreshRounded /></IconButton></Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box>
        ) : (
          <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Username</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Roles</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                ) : (
                  paged.map((u) => (
                    <TableRow key={u.userId} hover sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                      <TableCell sx={{ color: 'text.secondary' }}>{u.userId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14, backgroundColor: '#6C63FF22', color: '#6C63FF' }}>
                            {(u.fullName || u.username)?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{u.fullName || u.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                      <TableCell>
                        {u.roles?.map((r) => (
                          <Chip key={r} label={r} size="small" sx={{ mr: 0.5, fontSize: '0.7rem', backgroundColor: `${getRoleColor(r)}18`, color: getRoleColor(r), border: `1px solid ${getRoleColor(r)}33` }} />
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Reset mật khẩu về 123456">
                          <IconButton size="small" onClick={async () => {
                            try {
                              await adminService.resetPassword(u.userId);
                              setSnackbar(`Đã reset mật khẩu của ${u.fullName || u.username} về 123456`);
                            } catch { setError('Reset mật khẩu thất bại'); }
                          }} sx={{ color: 'text.secondary', '&:hover': { color: '#FF9800', backgroundColor: 'rgba(255,152,0,0.08)' } }}>
                            <LockResetRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" onClick={() => setDeleteDialog({ open: true, user: u })} sx={{ color: 'text.secondary', '&:hover': { color: '#FF5252', backgroundColor: 'rgba(255,82,82,0.08)' } }}>
                            <DeleteRounded fontSize="small" />
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle sx={{ color: 'text.primary' }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa user <strong style={{ color: 'text.primary' }}>{deleteDialog.user?.fullName || deleteDialog.user?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')}
        message={snackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}

