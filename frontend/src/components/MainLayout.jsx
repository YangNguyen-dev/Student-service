import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, Tooltip,
  useMediaQuery, useTheme, Button, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  MenuRounded, DashboardRounded, PeopleRounded, SchoolRounded, PersonRounded,
  ClassRounded, BookRounded, GradeRounded, ScheduleRounded, LogoutRounded,
  AdminPanelSettingsRounded, HomeRounded, LightModeRounded, DarkModeRounded,
  TrendingUpRounded, CloseRounded,
} from '@mui/icons-material';
import { ROLES } from '../constants';

const HEADER_HEIGHT = 64;

const ROLE_CONFIG = {
  [ROLES.ADMIN]: { label: 'Admin', color: '#FF6584', icon: <AdminPanelSettingsRounded />, gradient: 'linear-gradient(135deg, #FF6584, #FF8FA3)' },
  [ROLES.TEACHER]: { label: 'Giáo viên', color: '#10B981', icon: <PersonRounded />, gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
  [ROLES.STUDENT]: { label: 'Học sinh', color: '#6C63FF', icon: <SchoolRounded />, gradient: 'linear-gradient(135deg, #6C63FF, #9D97FF)' },
};

const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { label: 'Tổng quan', icon: <DashboardRounded />, path: '/dashboard' },
    { label: 'Người dùng', icon: <PeopleRounded />, path: '/admin/users' },
    { label: 'Học sinh', icon: <SchoolRounded />, path: '/admin/students' },
    { label: 'Giáo viên', icon: <PersonRounded />, path: '/admin/teachers' },
    { label: 'Lớp học', icon: <ClassRounded />, path: '/admin/classrooms' },
    { label: 'Môn học', icon: <BookRounded />, path: '/admin/subjects' },
    { label: 'Thời khóa biểu', icon: <ScheduleRounded />, path: '/admin/schedules' },
    { label: 'Thống kê', icon: <TrendingUpRounded />, path: '/admin/statistics' },
  ],
  [ROLES.TEACHER]: [
    { label: 'Tổng quan', icon: <DashboardRounded />, path: '/dashboard' },
    { label: 'Hồ sơ cá nhân', icon: <PersonRounded />, path: '/teacher/profile' },
    { label: 'Lớp chủ nhiệm', icon: <HomeRounded />, path: '/teacher/homeroom' },
    { label: 'Lớp dạy học', icon: <ClassRounded />, path: '/teacher/teaching' },
    { label: 'Lịch dạy', icon: <ScheduleRounded />, path: '/teacher/schedule' },
    { label: 'Thống kê', icon: <TrendingUpRounded />, path: '/teacher/statistics' },
  ],
  [ROLES.STUDENT]: [
    { label: 'Tổng quan', icon: <DashboardRounded />, path: '/dashboard' },
    { label: 'Hồ sơ cá nhân', icon: <PersonRounded />, path: '/student/profile' },
    { label: 'Bảng điểm', icon: <GradeRounded />, path: '/student/grades' },
    { label: 'Thời khóa biểu', icon: <ScheduleRounded />, path: '/student/schedule' },
  ],
};

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollRef = useRef(null);
  const isDark = mode === 'dark';

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.STUDENT;
  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.STUDENT;
  const avatarSrc = user?.avatarUrl ? `/api${user.avatarUrl}` : undefined;

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const headerBg = isDark ? 'rgba(15,17,23,0.95)' : 'rgba(255,255,255,0.92)';
  const textPrimary = isDark ? '#E8EAED' : '#1A1A2E';
  const textSecondary = isDark ? '#9AA0B4' : '#6B7280';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const mainBg = isDark ? '#0F1117' : '#F0F2F5';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: mainBg, transition: 'background-color 0.3s ease' }}>

      {/* ═══ TOP HEADER / NAVBAR ═══ */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: headerBg,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${dividerColor}`,
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ height: HEADER_HEIGHT, px: { xs: 1.5, md: 3 }, gap: 1 }}>

          {/* Logo */}
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mr: 1,
              '&:hover .logo-box': { transform: 'scale(1.08)' },
            }}
          >
            <Box className="logo-box" sx={{
              width: 36, height: 36, borderRadius: 2, flexShrink: 0,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(108,99,255,0.3)',
              transition: 'transform 0.3s ease',
            }}>
              <SchoolRounded sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            {!isMobile && (
              <Typography variant="subtitle1" sx={{ color: textPrimary, fontWeight: 800, letterSpacing: '-0.01em' }}>
                QLHT
              </Typography>
            )}
          </Box>

          {/* Desktop Nav Items */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flex: 1 }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    size="small"
                    sx={{
                      color: isActive ? roleConfig.color : textSecondary,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 1.5, py: 0.8,
                      minWidth: 'auto',
                      position: 'relative',
                      backgroundColor: isActive ? `${roleConfig.color}10` : 'transparent',
                      transition: 'all 0.2s ease',
                      '&::after': isActive ? {
                        content: '""', position: 'absolute', bottom: -1, left: '20%', right: '20%',
                        height: 2, borderRadius: 1,
                        background: roleConfig.color,
                      } : {},
                      '&:hover': {
                        backgroundColor: isActive ? `${roleConfig.color}15` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        color: isActive ? roleConfig.color : textPrimary,
                      },
                      '& .MuiButton-startIcon': {
                        mr: 0.5,
                        '& .MuiSvgIcon-root': { fontSize: 18 },
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Spacer on mobile */}
          {isMobile && <Box sx={{ flex: 1 }} />}

          {/* Right side: theme toggle + user + logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}>
              <IconButton onClick={toggleTheme} size="small"
                sx={{
                  color: isDark ? '#FFC107' : '#6C63FF', width: 34, height: 34,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'rotate(30deg)' },
                }}>
                {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ borderColor: dividerColor, mx: 0.5, my: 1.5 }} />

            {/* User info */}
            <Box
              onClick={() => {
                const p = user?.role === ROLES.TEACHER ? '/teacher/profile' : user?.role === ROLES.STUDENT ? '/student/profile' : '/dashboard';
                navigate(p);
              }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                px: 1, py: 0.5, borderRadius: 2, transition: 'all 0.2s',
                '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
              }}
            >
              <Avatar src={avatarSrc}
                sx={{
                  width: 30, height: 30, background: avatarSrc ? 'transparent' : roleConfig.gradient,
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}>
                {!avatarSrc && ((user?.fullName || user?.username)?.charAt(0)?.toUpperCase() || 'U')}
              </Avatar>
              {!isMobile && (
                <Box>
                  <Typography variant="body2" sx={{ color: textPrimary, fontWeight: 600, lineHeight: 1.2, fontSize: '0.8rem' }}>
                    {user?.fullName || user?.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: roleConfig.color, fontWeight: 600, fontSize: '0.65rem' }}>
                    {roleConfig.label}
                  </Typography>
                </Box>
              )}
            </Box>

            <Tooltip title="Đăng xuất">
              <IconButton onClick={handleLogout} size="small"
                sx={{
                  color: textSecondary, width: 34, height: 34,
                  '&:hover': { color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.08)' },
                }}>
                <LogoutRounded fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Mobile hamburger */}
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} size="small"
                sx={{ color: textPrimary, ml: 0.5 }}>
                <MenuRounded />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ═══ MOBILE DRAWER ═══ */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 260, background: isDark ? '#1A1D2E' : '#fff',
            border: 'none',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textPrimary }}>Menu</Typography>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: textSecondary }}>
            <CloseRounded />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: dividerColor }} />
        <List sx={{ px: 1, py: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  sx={{
                    borderRadius: 2, py: 1,
                    backgroundColor: isActive ? `${roleConfig.color}12` : 'transparent',
                    '&:hover': { backgroundColor: isActive ? `${roleConfig.color}18` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive ? roleConfig.color : textSecondary }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? textPrimary : textSecondary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ borderColor: dividerColor }} />
        <Box sx={{ p: 1 }}>
          <ListItemButton onClick={handleLogout} sx={{
            borderRadius: 2,
            '&:hover': { backgroundColor: 'rgba(239,68,68,0.08)' },
          }}>
            <ListItemIcon sx={{ minWidth: 36, color: textSecondary }}>
              <LogoutRounded />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất"
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: textSecondary }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* ═══ MAIN CONTENT ═══ */}
      <Box
        ref={scrollRef}
        id="main-scroll-container"
        sx={{
          pt: `${HEADER_HEIGHT}px`,
          minHeight: '100vh',
          background: mainBg,
          transition: 'background 0.3s ease',
        }}
      >
        <Box id="main-content" component="main" sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
