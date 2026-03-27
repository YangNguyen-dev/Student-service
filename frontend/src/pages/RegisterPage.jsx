import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
  InputAdornment, IconButton, CircularProgress, MenuItem, Tooltip,
} from '@mui/material';
import {
  Visibility, VisibilityOff, SchoolRounded, PersonOutline, LockOutlined,
  EmailOutlined, BadgeOutlined, LightModeRounded, DarkModeRounded, AutoAwesomeRounded,
} from '@mui/icons-material';

const ROLES = [
  { value: 'STUDENT', label: 'Học sinh' },
  { value: 'TEACHER', label: 'Giáo viên' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  const [form, setForm] = useState({
    username: '', fullName: '', email: '', password: '', confirmPassword: '', role: 'STUDENT',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => { setForm((prev) => ({ ...prev, [field]: e.target.value })); setError(''); };

  const validate = () => {
    if (!form.username.trim()) return 'Vui lòng nhập tên đăng nhập';
    if (form.username.trim().length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
    if (!form.fullName.trim()) return 'Vui lòng nhập họ và tên';
    if (!form.email.trim()) return 'Vui lòng nhập email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không hợp lệ';
    if (!form.password) return 'Vui lòng nhập mật khẩu';
    if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await register(form.username, form.password, form.email, form.role, form.fullName);
      setSuccess('Đăng ký thành công! Đang chuyển...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally { setLoading(false); }
  };

  const inputColor = isDark ? '#E8EAED' : '#1A1A2E';
  const labelColor = isDark ? '#9AA0B4' : '#6B7280';
  const iconColor = isDark ? '#8B83FF' : '#6C63FF';

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0F1117 0%, #1A1D2E 30%, #141720 60%, #0F1117 100%)'
        : 'linear-gradient(135deg, #E8EAFF 0%, #FCE4EC 30%, #E0F7FA 60%, #EDE7F6 100%)',
      backgroundSize: '400% 400%', animation: 'gradient-shift 15s ease infinite',
      position: 'relative', overflow: 'hidden', px: 2, py: 4,
    }}>
      {/* Animated orbs */}
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, rgba(255,101,132,0.15) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(255,101,132,0.12) 0%, transparent 60%)',
        top: -100, left: -100, filter: 'blur(60px)', animation: 'float-gentle 9s ease-in-out infinite' }} />
      <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 60%)',
        bottom: -80, right: -80, filter: 'blur(60px)', animation: 'float-gentle 11s ease-in-out infinite reverse' }} />

      {/* Sparkle particles */}
      {[...Array(4)].map((_, i) => (
        <Box key={i} sx={{
          position: 'absolute', zIndex: 0, borderRadius: '50%',
          width: 4 + i * 2, height: 4 + i * 2,
          top: `${15 + i * 20}%`, left: `${10 + i * 25}%`,
          background: isDark ? `rgba(139,131,255,${0.15 + i * 0.05})` : `rgba(108,99,255,${0.1 + i * 0.03})`,
          animation: `float-gentle ${3 + i * 1.5}s ease-in-out infinite ${i * 0.6}s`, filter: 'blur(1px)',
        }} />
      ))}

      {/* Theme toggle */}
      <Tooltip title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}>
        <IconButton onClick={toggleTheme} sx={{
          position: 'absolute', top: 20, right: 20, zIndex: 10,
          color: isDark ? '#FFC107' : '#6C63FF',
          backgroundColor: isDark ? 'rgba(255,193,7,0.1)' : 'rgba(108,99,255,0.08)',
          backdropFilter: 'blur(10px)',
          border: isDark ? '1px solid rgba(255,193,7,0.2)' : '1px solid rgba(108,99,255,0.15)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'rotate(30deg) scale(1.1)' },
        }}>
          {isDark ? <LightModeRounded /> : <DarkModeRounded />}
        </IconButton>
      </Tooltip>

      {/* Card with animated gradient border */}
      <Box sx={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 480,
        animation: 'scale-in 0.6s ease-out',
        '&::before': {
          content: '""', position: 'absolute', inset: -2,
          borderRadius: 18, background: 'linear-gradient(135deg, #FF6584, #6C63FF, #06B6D4, #FF6584)',
          backgroundSize: '300% 300%', animation: 'gradient-shift 4s ease infinite',
          opacity: isDark ? 0.5 : 0.25, filter: 'blur(6px)', zIndex: -1,
        },
      }}>
        <Card sx={{
          borderRadius: 4,
          background: isDark ? 'rgba(26,29,46,0.92)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          border: isDark ? '1px solid rgba(139,131,255,0.12)' : '1px solid rgba(108,99,255,0.08)',
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 20px 60px rgba(108,99,255,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
          overflow: 'hidden', position: 'relative',
          '&::after': {
            content: '""', position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: `linear-gradient(to right, transparent 0%, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)'} 50%, transparent 100%)`,
            transform: 'rotate(30deg)', animation: 'card-shine-move 6s ease-in-out infinite', pointerEvents: 'none',
          },
        }}>
          <CardContent sx={{ p: { xs: 3.5, sm: 4.5 }, position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                width: 68, height: 68, borderRadius: 3.5, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, #FF6584, #6C63FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 28px rgba(255, 101, 132, 0.35)',
                animation: 'float-gentle 4s ease-in-out infinite',
                position: 'relative',
                '&::after': {
                  content: '""', position: 'absolute', inset: -6, borderRadius: 'inherit',
                  background: 'linear-gradient(135deg, rgba(255,101,132,0.25), rgba(108,99,255,0.25))',
                  filter: 'blur(16px)', zIndex: -1, animation: 'glow-pulse 3s ease-in-out infinite',
                },
              }}>
                <SchoolRounded sx={{ fontSize: 36, color: '#fff' }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 900, letterSpacing: '-0.02em',
                background: isDark ? 'linear-gradient(135deg, #E8EAED, #FF8FA3)' : 'linear-gradient(135deg, #1A1A2E, #FF6584)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Đăng Ký
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                <AutoAwesomeRounded sx={{ fontSize: 14, color: isDark ? '#FF8FA3' : '#FF6584' }} />
                <Typography variant="body2" sx={{ color: labelColor, fontWeight: 500, letterSpacing: '0.05em' }}>
                  Tạo tài khoản mới
                </Typography>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, animation: 'fade-in-up 0.3s ease-out' }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, animation: 'fade-in-up 0.3s ease-out' }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                  borderRadius: 2.5, transition: 'all 0.3s ease',
                  '& input, & .MuiSelect-select': { color: inputColor },
                  '& input:-webkit-autofill': {
                    WebkitTextFillColor: inputColor,
                    WebkitBoxShadow: isDark ? '0 0 0 100px #1A1D2E inset' : '0 0 0 100px rgba(255,255,255,0.9) inset',
                  },
                  '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.85)' },
                  '&.Mui-focused': { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)', boxShadow: `0 0 0 3px ${isDark ? 'rgba(139,131,255,0.15)' : 'rgba(108,99,255,0.1)'}` },
                },
                '& .MuiInputLabel-root': { color: labelColor },
                '& .MuiInputLabel-root.Mui-focused': { color: iconColor },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)' },
              }}>

              <TextField id="register-username" fullWidth label="Tên đăng nhập" value={form.username} onChange={handleChange('username')} sx={{ mb: 2 }} autoFocus
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: iconColor }} /></InputAdornment> }} />
              <TextField id="register-fullname" fullWidth label="Họ và tên" value={form.fullName} onChange={handleChange('fullName')} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: iconColor }} /></InputAdornment> }} />
              <TextField id="register-email" fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: iconColor }} /></InputAdornment> }} />
              <TextField id="register-password" fullWidth label="Mật khẩu" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} sx={{ mb: 2 }}
                helperText="Mật khẩu phải có ít nhất 6 ký tự"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: iconColor }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: labelColor }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                }} />
              <TextField id="register-confirm-password" fullWidth label="Xác nhận mật khẩu" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange('confirmPassword')} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: iconColor }} /></InputAdornment> }} />
              <TextField id="register-role" fullWidth select label="Vai trò" value={form.role} onChange={handleChange('role')} sx={{ mb: 3 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: iconColor }} /></InputAdornment> }}>
                {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>

              <Button id="register-submit" type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{
                  py: 1.5, fontSize: '1rem', fontWeight: 700, mb: 2.5, borderRadius: 3,
                  background: 'linear-gradient(135deg, #FF6584 0%, #6C63FF 50%, #FF6584 100%)',
                  backgroundSize: '200% 200%', animation: 'gradient-shift 3s ease infinite',
                  boxShadow: '0 4px 22px rgba(255, 101, 132, 0.35)',
                  transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                  '&::before': {
                    content: '""', position: 'absolute', inset: 0,
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
                    transform: 'translateX(-100%)', transition: 'transform 0.5s ease',
                  },
                  '&:hover': {
                    boxShadow: '0 6px 30px rgba(255, 101, 132, 0.45)', transform: 'translateY(-2px)',
                    '&::before': { transform: 'translateX(100%)' },
                  },
                }}>
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Đăng Ký'}
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', color: labelColor }}>
                Đã có tài khoản?{' '}
                <Link component={RouterLink} to="/login"
                  sx={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none', '&:hover': { color: '#5A52E0', textDecoration: 'underline' } }}>
                  Đăng nhập
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
