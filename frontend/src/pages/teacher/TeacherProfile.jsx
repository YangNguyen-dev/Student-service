import { useState, useEffect, useRef } from 'react';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Avatar, Badge,
  TextField, Button, Select, MenuItem, FormControl, InputLabel, Snackbar, IconButton,
  useTheme, InputAdornment, Collapse, Dialog, DialogContent,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { PersonRounded, EditRounded, SaveRounded, CancelRounded, CameraAltRounded, LockRounded, VisibilityRounded, VisibilityOffRounded, KeyRounded } from '@mui/icons-material';

export default function TeacherProfile() {
  const { user, updateAvatar } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', dateOfBirth: '', gender: '' });
  const fileInputRef = useRef(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getProfile();
      setProfile(data);
      setForm({
        fullName: data.fullName || '',
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
      });
    } catch (err) {
      setError('Không thể tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await teacherService.updateProfile({
        fullName: form.fullName || null,
        email: form.email || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
      });
      setProfile(data);
      setEditing(false);
      setSuccess('Cập nhật thành công!');
    } catch (err) {
      setError('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender: profile?.gender || '',
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File quá lớn (tối đa 5MB)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/avatar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateAvatar(res.data.avatarUrl);
      setProfile(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      setSuccess('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      setError('Không thể tải ảnh lên');
    }
  };

  const avatarSrc = profile?.avatarUrl ? `/api${profile.avatarUrl}` : (user?.avatarUrl ? `/api${user.avatarUrl}` : undefined);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress sx={{ color: '#4CAF50' }} /></Box>;

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } }, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Avatar sx={{ backgroundColor: '#4CAF5022', color: '#4CAF50', width: 48, height: 48 }}><PersonRounded /></Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>Thông tin cá nhân</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Xem và chỉnh sửa thông tin của bạn</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Avatar Section */}
      <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(255,255,255,0.8) 100%)', border: '1px solid rgba(76,175,80,0.15)', mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 32, height: 32,
                  backgroundColor: '#4CAF50',
                  border: '2px solid #E5E7EB',
                  '&:hover': { backgroundColor: '#43A047' },
                }}
              >
                <CameraAltRounded sx={{ fontSize: 16, color: 'text.primary' }} />
              </IconButton>
            }
          >
            <Avatar
              src={avatarSrc}
              sx={{
                width: 100, height: 100,
                background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #4CAF50, #81C784)',
                fontSize: 40, fontWeight: 700,
                boxShadow: '0 8px 32px rgba(76,175,80,0.3)',
                cursor: avatarSrc ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': avatarSrc ? { transform: 'scale(1.05)' } : {},
              }}
              onClick={() => avatarSrc && setPreviewOpen(true)}
            >
              {!avatarSrc && ((profile?.fullName || profile?.username)?.charAt(0)?.toUpperCase() || 'U')}
            </Avatar>
          </Badge>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mt: 2 }}>
            {profile?.fullName || profile?.username}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {profile?.teacherCode}
          </Typography>
          <Button
            size="small"
            startIcon={<CameraAltRounded />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mt: 1.5, color: '#4CAF50', textTransform: 'none', fontSize: '0.8rem', '&:hover': { backgroundColor: 'rgba(76,175,80,0.08)' } }}
          >
            Thay đổi ảnh đại diện
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(255,255,255,0.8) 100%)', border: '1px solid rgba(76,175,80,0.15)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Thông tin chi tiết
            </Typography>
            {!editing ? (
              <Button startIcon={<EditRounded />} onClick={() => setEditing(true)}
                sx={{ color: '#4CAF50', textTransform: 'none', '&:hover': { backgroundColor: 'rgba(76,175,80,0.08)' } }}>
                Chỉnh sửa
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<CancelRounded />} onClick={handleCancel} size="small"
                  sx={{ color: 'text.secondary', textTransform: 'none' }}>Hủy</Button>
                <Button startIcon={<SaveRounded />} onClick={handleSave} variant="contained" size="small"
                  disabled={saving} sx={{ textTransform: 'none', backgroundColor: '#4CAF50' }}>
                  {saving ? <CircularProgress size={18} /> : 'Lưu'}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>Mã giáo viên</Typography>
              <Typography sx={{ color: 'text.primary' }}>{profile?.teacherCode || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>Tên đăng nhập</Typography>
              <Typography sx={{ color: 'text.primary' }}>{profile?.username || '—'}</Typography>
            </Box>

            {editing ? (
              <>
                <TextField label="Họ và tên" size="small" fullWidth value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                <TextField label="Email" size="small" fullWidth value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <TextField label="Ngày sinh" type="date" size="small" fullWidth value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }} />
                <FormControl size="small" fullWidth>
                  <InputLabel>Giới tính</InputLabel>
                  <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} label="Giới tính">
                    <MenuItem value="MALE">Nam</MenuItem>
                    <MenuItem value="FEMALE">Nữ</MenuItem>
                    <MenuItem value="OTHER">Khác</MenuItem>
                  </Select>
                </FormControl>
              </>
            ) : (
              <>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>Email</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{profile?.email || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>Ngày sinh</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{formatDate(profile?.dateOfBirth)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>Giới tính</Typography>
                  <Typography sx={{ color: 'text.primary' }}>
                    {profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : profile?.gender === 'OTHER' ? 'Khác' : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>Môn dạy</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{profile?.subject?.subjectName || 'Chưa phân công'}</Typography>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card sx={{ borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(30,30,50,0.7)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowPasswordSection(!showPasswordSection)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LockRounded sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700}>Đổi mật khẩu</Typography>
            </Box>
            <KeyRounded sx={{ color: 'text.secondary', transform: showPasswordSection ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
          </Box>
          <Collapse in={showPasswordSection}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2.5 }}>
              <TextField label="Mật khẩu hiện tại" size="small" fullWidth
                type={showCurrent ? 'text' : 'password'}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}</IconButton></InputAdornment> } }} />
              <TextField label="Mật khẩu mới" size="small" fullWidth
                type={showNew ? 'text' : 'password'}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                helperText="Mật khẩu phải có ít nhất 6 ký tự"
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowNew(!showNew)}>{showNew ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}</IconButton></InputAdornment> } }} />
              <TextField label="Xác nhận mật khẩu mới" size="small" fullWidth
                type={showConfirm ? 'text' : 'password'}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                error={pwForm.confirmPassword !== '' && pwForm.newPassword !== pwForm.confirmPassword}
                helperText={pwForm.confirmPassword !== '' && pwForm.newPassword !== pwForm.confirmPassword ? 'Mật khẩu không khớp' : ''}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}</IconButton></InputAdornment> } }} />
              <Button
                variant="contained"
                disabled={!pwForm.currentPassword || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirmPassword || pwForm.newPassword.length < 6 || pwSaving}
                onClick={async () => {
                  setPwSaving(true);
                  setError('');
                  try {
                    await teacherService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
                    setSuccess('Đổi mật khẩu thành công!');
                    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowPasswordSection(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (err) {
                    const msg = err.response?.data?.message || 'Mật khẩu hiện tại không đúng';
                    setError(msg);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } finally { setPwSaving(false); }
                }}
                sx={{ alignSelf: 'flex-start', borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 4 }}
              >
                {pwSaving ? <CircularProgress size={20} /> : 'Đổi mật khẩu'}
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Avatar Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          },
        }}
        onClick={() => setPreviewOpen(false)}
      >
        <IconButton
          onClick={() => setPreviewOpen(false)}
          sx={{
            position: 'absolute', top: 16, right: 16, zIndex: 1,
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.15)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            width: 44, height: 44,
          }}
        >
          <CloseRounded />
        </IconButton>
        <Box
          component="img"
          src={avatarSrc}
          alt="Avatar"
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: '95vw',
            height: '95vh',
            objectFit: 'contain',
            borderRadius: 2,
          }}
        />
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}
        message={success} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}


