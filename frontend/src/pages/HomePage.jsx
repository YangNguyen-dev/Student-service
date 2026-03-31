import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import {
  Box, Typography, Button, Container, IconButton, Tooltip,
} from '@mui/material';
import {
  SchoolRounded, DashboardRounded, GradeRounded, ScheduleRounded,
  PeopleRounded, SecurityRounded, SpeedRounded, DevicesRounded,
  LightModeRounded, DarkModeRounded, ArrowForwardRounded,
  AutoAwesomeRounded, TrendingUpRounded, LoginRounded,
  CheckCircleOutlineRounded, FormatQuoteRounded,
  PersonAddRounded, SettingsRounded, InsightsRounded,
  EmailRounded, PhoneRounded, LocationOnRounded,
  StarRounded, RocketLaunchRounded, KeyboardArrowDownRounded,
} from '@mui/icons-material';

/* ─────────────── hooks ─────────────── */

function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return count;
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useTypingEffect(phrases, speed = 80, pause = 2200) {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(current.substring(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIndex(c => c + 1);
        }
      } else {
        setText(current.substring(0, charIndex));
        if (charIndex === 0) {
          setDeleting(false);
          setPhraseIndex((phraseIndex + 1) % phrases.length);
        } else {
          setCharIndex(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, phraseIndex, phrases, speed, pause]);

  return text;
}

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handle = (e) => setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);
  return pos;
}

/* ─────────────── data ─────────────── */

const FEATURES = [
  { icon: <DashboardRounded />, title: 'Bảng điều khiển', desc: 'Tổng quan trực quan giúp nắm bắt thông tin nhanh chóng và hiệu quả.', gradient: 'linear-gradient(135deg, #6C63FF, #8B83FF)' },
  { icon: <GradeRounded />, title: 'Quản lý điểm', desc: 'Nhập, theo dõi, thống kê điểm số theo từng học kỳ và môn học.', gradient: 'linear-gradient(135deg, #FF6584, #FF8FA3)' },
  { icon: <ScheduleRounded />, title: 'Thời khóa biểu', desc: 'Xem lịch học, lịch dạy được cập nhật tự động và trực quan.', gradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)' },
  { icon: <PeopleRounded />, title: 'Quản lý lớp học', desc: 'Phân lớp, quản lý danh sách học sinh và giáo viên chủ nhiệm.', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
  { icon: <SecurityRounded />, title: 'Bảo mật cao', desc: 'Xác thực JWT, phân quyền rõ ràng cho Admin, Giáo viên, Học sinh.', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  { icon: <DevicesRounded />, title: 'Đa thiết bị', desc: 'Giao diện responsive hoạt động mượt mà trên mọi kích thước màn hình.', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Học sinh', icon: <SchoolRounded /> },
  { value: 50, suffix: '+', label: 'Giáo viên', icon: <PeopleRounded /> },
  { value: 20, suffix: '+', label: 'Lớp học', icon: <DashboardRounded /> },
  { value: 99, suffix: '%', label: 'Uptime', icon: <SpeedRounded /> },
];

const STEPS = [
  { icon: <PersonAddRounded />, title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản miễn phí chỉ trong vài giây.', color: '#6C63FF' },
  { icon: <SettingsRounded />, title: 'Cấu hình hệ thống', desc: 'Admin thiết lập lớp học, môn học và phân quyền.', color: '#FF6584' },
  { icon: <InsightsRounded />, title: 'Bắt đầu sử dụng', desc: 'Nhập điểm, xem thời khóa biểu và thống kê ngay.', color: '#10B981' },
];

const TESTIMONIALS = [
  { name: 'Nguyễn Văn An', role: 'Giáo viên Toán', text: 'Hệ thống giúp tôi quản lý điểm số nhanh hơn gấp 3 lần so với trước đây. Giao diện rất trực quan!', rating: 5 },
  { name: 'Trần Thị Bích', role: 'Phụ huynh', text: 'Tôi có thể theo dõi kết quả học tập của con mình một cách dễ dàng. Rất hữu ích!', rating: 5 },
  { name: 'Lê Minh Đức', role: 'Học sinh lớp 12A1', text: 'Xem thời khóa biểu và bảng điểm online rất tiện lợi. Giao diện đẹp và dễ dùng.', rating: 4 },
];

/* ─────────────── sub-components ─────────────── */

function AuroraBackground({ isDark, mousePos }) {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, dur: Math.random() * 8 + 12, delay: Math.random() * -20,
      opacity: Math.random() * 0.4 + 0.1,
    })), []);

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Grid overlay */}
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: isDark
          ? 'linear-gradient(rgba(139,131,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,131,255,0.03) 1px, transparent 1px)'
          : 'linear-gradient(rgba(108,99,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
      }} />

      {/* Morphing aurora blobs */}
      {[
        { w: 800, h: 800, top: '-25%', right: '-20%', c: isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.08)', dur: '20s', delay: '0s' },
        { w: 600, h: 600, bottom: '-20%', left: '-15%', c: isDark ? 'rgba(255,101,132,0.12)' : 'rgba(255,101,132,0.06)', dur: '25s', delay: '-5s' },
        { w: 500, h: 500, top: '30%', left: '30%', c: isDark ? 'rgba(6,182,212,0.10)' : 'rgba(6,182,212,0.05)', dur: '18s', delay: '-10s' },
        { w: 400, h: 400, top: '60%', right: '10%', c: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)', dur: '22s', delay: '-8s' },
      ].map((blob, i) => (
        <Box key={`blob-${i}`} sx={{
          position: 'absolute', width: blob.w, height: blob.h,
          top: blob.top, right: blob.right, bottom: blob.bottom, left: blob.left,
          background: `radial-gradient(circle, ${blob.c} 0%, transparent 60%)`,
          filter: 'blur(80px)',
          animation: `morph-blob ${blob.dur} ease-in-out infinite ${blob.delay}, aurora-color ${blob.dur} ease-in-out infinite ${blob.delay}`,
        }} />
      ))}

      {/* Mouse-tracking spotlight */}
      <Box sx={{
        position: 'fixed', width: 600, height: 600, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 60%)',
        filter: 'blur(40px)',
        transform: `translate(${mousePos.x * 100 - 50}vw, ${mousePos.y * 100 - 50}vh)`,
        transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: isDark ? `rgba(139,131,255,${p.opacity})` : `rgba(108,99,255,${p.opacity * 0.7})`,
          animation: `float-gentle ${p.dur}s ease-in-out infinite ${p.delay}s`,
          boxShadow: p.size > 2 ? `0 0 ${p.size * 3}px ${isDark ? 'rgba(139,131,255,0.3)' : 'rgba(108,99,255,0.2)'}` : 'none',
        }} />
      ))}
    </Box>
  );
}

function WaveDivider({ isDark, flip = false, color }) {
  return (
    <Box sx={{ position: 'relative', zIndex: 2, mt: flip ? 0 : -1, mb: flip ? -1 : 0, transform: flip ? 'rotate(180deg)' : 'none', lineHeight: 0 }}>
      <svg viewBox="0 0 1440 100" style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        <path d="M0,40 C360,80 720,0 1080,50 C1260,70 1380,30 1440,40 L1440,100 L0,100 Z" fill={color || (isDark ? '#0F1117' : '#F0F2FF')} fillOpacity="0.5" />
        <path d="M0,60 C240,20 600,90 960,40 C1200,10 1380,60 1440,50 L1440,100 L0,100 Z" fill={color || (isDark ? '#0F1117' : '#F0F2FF')} fillOpacity="0.3" />
      </svg>
    </Box>
  );
}

function FeatureCard({ feature, index, isDark, inView }) {
  return (
    <Box
      sx={{
        position: 'relative', p: { xs: 3, md: 4 }, borderRadius: 4,
        background: isDark ? 'rgba(26,29,46,0.60)' : 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(139,131,255,0.08)' : '1px solid rgba(108,99,255,0.06)',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.25)' : '0 8px 32px rgba(108,99,255,0.05)',
        transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
        animation: inView ? `fade-in-up 0.6s ease-out ${index * 0.1}s both` : 'none',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: isDark ? '0 20px 60px rgba(108,99,255,0.15)' : '0 20px 60px rgba(108,99,255,0.10)',
          border: isDark ? '1px solid rgba(139,131,255,0.20)' : '1px solid rgba(108,99,255,0.15)',
        },
        '&:hover .feature-icon-box': { transform: 'scale(1.1) rotate(-5deg)' },
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: feature.gradient, opacity: 0, transition: 'opacity 0.4s',
        },
        '&:hover::before': { opacity: 1 },
      }}
    >
      <Box className="feature-icon-box" sx={{
        width: 56, height: 56, borderRadius: 3, mb: 2.5,
        background: feature.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 24px ${feature.gradient.includes('#6C63FF') ? 'rgba(108,99,255,0.30)' : 'rgba(0,0,0,0.15)'}`,
        transition: 'transform 0.4s ease',
        '& .MuiSvgIcon-root': { fontSize: 28, color: '#fff' },
      }}>
        {feature.icon}
      </Box>
      <Typography variant="h6" sx={{
        fontWeight: 700, mb: 1, color: isDark ? '#E8EAED' : '#1A1A2E', fontSize: '1.05rem',
      }}>
        {feature.title}
      </Typography>
      <Typography variant="body2" sx={{ color: isDark ? '#9AA0B4' : '#6B7280', lineHeight: 1.7 }}>
        {feature.desc}
      </Typography>
    </Box>
  );
}

function StatItem({ stat, inView, isDark, index }) {
  const count = useCounter(stat.value, 2000, inView);
  return (
    <Box sx={{
      textAlign: 'center', flex: '1 1 140px',
      animation: inView ? `fade-in-up 0.6s ease-out ${index * 0.15}s both` : 'none',
      p: 3, borderRadius: 4,
      background: isDark ? 'rgba(26,29,46,0.45)' : 'rgba(255,255,255,0.60)',
      backdropFilter: 'blur(12px)',
      border: isDark ? '1px solid rgba(139,131,255,0.06)' : '1px solid rgba(108,99,255,0.04)',
      transition: 'all 0.3s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.2)' : '0 12px 40px rgba(108,99,255,0.08)' },
    }}>
      <Box sx={{ mb: 1, '& .MuiSvgIcon-root': { fontSize: 28, color: '#6C63FF' } }}>
        {stat.icon}
      </Box>
      <Typography sx={{
        fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {count}{stat.suffix}
      </Typography>
      <Typography variant="body2" sx={{
        mt: 0.8, fontWeight: 600, color: isDark ? '#9AA0B4' : '#6B7280',
        textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem',
      }}>
        {stat.label}
      </Typography>
    </Box>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */

export default function HomePage() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  const [statsRef, statsInView] = useInView(0.3);
  const [featRef, featInView] = useInView(0.15);
  const [stepsRef, stepsInView] = useInView(0.2);
  const [testRef, testInView] = useInView(0.2);
  const mousePos = useMousePosition();

  const typedText = useTypingEffect(['thông minh', 'hiệu quả', 'toàn diện', 'hiện đại'], 90, 2000);

  const bgMain = isDark
    ? 'linear-gradient(180deg, #0F1117 0%, #141720 40%, #1A1D2E 70%, #0F1117 100%)'
    : 'linear-gradient(180deg, #F0F2FF 0%, #FAFBFF 30%, #F5F0FF 60%, #EEF2FF 100%)';
  const textPrimary = isDark ? '#E8EAED' : '#1A1A2E';
  const textSecondary = isDark ? '#9AA0B4' : '#6B7280';

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: bgMain }}>
      <AuroraBackground isDark={isDark} mousePos={mousePos} />

      {/* ── NAV BAR ── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        backdropFilter: 'blur(20px)',
        background: isDark ? 'rgba(15,17,23,0.85)' : 'rgba(255,255,255,0.85)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        transition: 'background 0.3s ease',
      }}>
        <Container maxWidth="lg" sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64, px: { xs: 2, md: 3 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(108,99,255,0.35)',
              transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.08) rotate(-4deg)' },
            }}>
              <SchoolRounded sx={{ fontSize: 22, color: '#fff' }} />
            </Box>
            <Typography variant="h6" sx={{
              fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.3rem',
              background: isDark ? 'linear-gradient(135deg, #E8EAED, #8B83FF)' : 'linear-gradient(135deg, #1A1A2E, #6C63FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              QLHT
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}>
              <IconButton onClick={toggleTheme} size="small" sx={{
                color: isDark ? '#FFC107' : '#6C63FF', width: 38, height: 38,
                transition: 'all 0.3s', '&:hover': { transform: 'rotate(30deg)' },
              }}>
                {isDark ? <LightModeRounded /> : <DarkModeRounded />}
              </IconButton>
            </Tooltip>
            <Button variant="outlined" onClick={() => navigate('/register')} sx={{
              borderRadius: 3, textTransform: 'none', fontWeight: 600,
              borderColor: isDark ? 'rgba(139,131,255,0.3)' : 'rgba(108,99,255,0.25)',
              color: isDark ? '#8B83FF' : '#6C63FF', px: 2.5,
              transition: 'all 0.3s',
              '&:hover': { borderColor: '#6C63FF', backgroundColor: isDark ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.05)' },
            }}>
              Đăng ký
            </Button>
            <Button variant="contained" startIcon={<LoginRounded />} onClick={() => navigate('/login')} sx={{
              borderRadius: 3, textTransform: 'none', fontWeight: 700,
              background: 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)',
              boxShadow: '0 4px 20px rgba(108,99,255,0.35)', px: 2.5,
              transition: 'all 0.3s',
              '&:hover': { boxShadow: '0 6px 28px rgba(108,99,255,0.50)', transform: 'translateY(-1px)' },
            }}>
              Đăng nhập
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── HERO ── */}
      <Container maxWidth="lg" sx={{
        pt: { xs: 16, md: 22 }, pb: { xs: 10, md: 16 },
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.8, mb: 3,
          px: 2.5, py: 0.8, borderRadius: 10,
          background: isDark ? 'rgba(108,99,255,0.10)' : 'rgba(108,99,255,0.06)',
          border: isDark ? '1px solid rgba(139,131,255,0.15)' : '1px solid rgba(108,99,255,0.12)',
          animation: 'fade-in-up 0.5s ease-out',
        }}>
          <RocketLaunchRounded sx={{ fontSize: 16, color: '#6C63FF' }} />
          <Typography variant="caption" sx={{ color: '#6C63FF', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem' }}>
            HỆ THỐNG QUẢN LÝ HỌC TẬP THẾ HỆ MỚI
          </Typography>
        </Box>

        <Typography variant="h2" sx={{
          fontWeight: 900, lineHeight: 1.12, mb: 3,
          fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
          letterSpacing: '-0.03em', color: textPrimary,
          animation: 'fade-in-up 0.6s ease-out 0.1s both',
        }}>
          Quản lý học tập{' '}
          <Box component="span" sx={{
            position: 'relative', display: 'inline-block',
            background: 'linear-gradient(90deg, #6C63FF, #FF6584, #06B6D4, #6C63FF)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'text-shine 4s ease-in-out infinite',
            minWidth: { xs: 140, md: 220 },
          }}>
            {typedText}
            <Box component="span" sx={{
              display: 'inline-block', width: 3, height: '0.9em', ml: 0.3,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              animation: 'typewriter-blink 0.8s infinite', verticalAlign: 'text-bottom',
              borderRadius: 1,
            }} />
          </Box>
          <br />
          cho trường học hiện đại
        </Typography>

        <Typography variant="h6" sx={{
          color: textSecondary, fontWeight: 400, maxWidth: 680, mx: 'auto', mb: 5,
          lineHeight: 1.8, fontSize: { xs: '0.95rem', md: '1.12rem' },
          animation: 'fade-in-up 0.6s ease-out 0.2s both',
        }}>
          Nền tảng quản lý trường học toàn diện — từ điểm số, thời khóa biểu
          đến thống kê học tập — tất cả trong một giao diện trực quan, dễ dùng và bảo mật.
        </Typography>

        <Box sx={{
          display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fade-in-up 0.6s ease-out 0.3s both',
        }}>
          <Button variant="contained" size="large" startIcon={<ArrowForwardRounded />}
            onClick={() => navigate('/register')}
            sx={{
              borderRadius: 3, textTransform: 'none', fontWeight: 700,
              px: 4.5, py: 1.6, fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 50%, #6C63FF 100%)',
              backgroundSize: '200% 200%', animation: 'gradient-shift 3s ease infinite',
              boxShadow: '0 8px 32px rgba(108,99,255,0.40)',
              position: 'relative', overflow: 'hidden',
              '&::before': {
                content: '""', position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
                transform: 'translateX(-100%)', transition: 'transform 0.5s ease',
              },
              '&:hover': { boxShadow: '0 12px 44px rgba(108,99,255,0.55)', transform: 'translateY(-2px)', '&::before': { transform: 'translateX(100%)' } },
            }}
          >
            Bắt đầu miễn phí
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{
            borderRadius: 3, textTransform: 'none', fontWeight: 600,
            px: 4, py: 1.5, fontSize: '1rem',
            borderColor: isDark ? 'rgba(139,131,255,0.3)' : 'rgba(108,99,255,0.25)',
            color: isDark ? '#8B83FF' : '#6C63FF',
            backdropFilter: 'blur(10px)',
            background: isDark ? 'rgba(108,99,255,0.06)' : 'rgba(108,99,255,0.03)',
            '&:hover': { borderColor: '#6C63FF', backgroundColor: isDark ? 'rgba(108,99,255,0.12)' : 'rgba(108,99,255,0.08)', transform: 'translateY(-2px)' },
            transition: 'all 0.3s',
          }}>
            Đã có tài khoản? Đăng nhập
          </Button>
        </Box>

        {/* Scroll indicator */}
        <Box sx={{
          mt: { xs: 6, md: 8 }, animation: 'float-gentle 2s ease-in-out infinite',
          '& .MuiSvgIcon-root': { fontSize: 32, color: isDark ? 'rgba(139,131,255,0.4)' : 'rgba(108,99,255,0.3)' },
        }}>
          <KeyboardArrowDownRounded />
        </Box>

        {/* Hero Dashboard Mockup */}
        <Box sx={{
          mt: { xs: 4, md: 6 }, position: 'relative', maxWidth: 880, mx: 'auto',
          animation: 'fade-in-up 0.8s ease-out 0.5s both',
          perspective: 1200,
        }}>
          <Box sx={{
            width: '100%', aspectRatio: '16/9', borderRadius: 4,
            background: isDark ? 'rgba(26,29,46,0.55)' : 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(139,131,255,0.10)' : '1px solid rgba(108,99,255,0.06)',
            boxShadow: isDark
              ? '0 30px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 30px 100px rgba(108,99,255,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative',
            transform: 'rotateX(2deg)',
            transition: 'transform 0.5s ease',
            '&:hover': { transform: 'rotateX(0deg) scale(1.01)' },
          }}>
            {/* Grid dots */}
            <Box sx={{
              position: 'absolute', inset: 0,
              backgroundImage: isDark
                ? 'radial-gradient(circle, rgba(139,131,255,0.06) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(108,99,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />

            {/* Mockup dashboard content */}
            <Box sx={{ position: 'relative', zIndex: 1, width: '85%', height: '80%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Mock header bar */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#FF6584' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#FBBF24' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                <Box sx={{ flex: 1, height: 8, borderRadius: 10, ml: 2, background: isDark ? 'rgba(139,131,255,0.08)' : 'rgba(108,99,255,0.06)' }} />
              </Box>
              {/* Mock stat cards */}
              <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                {['#6C63FF', '#FF6584', '#10B981', '#06B6D4'].map((c, i) => (
                  <Box key={i} sx={{
                    flex: 1, borderRadius: 2,
                    background: isDark ? 'rgba(26,29,46,0.80)' : 'rgba(255,255,255,0.80)',
                    border: `1px solid ${c}22`, p: 1.5,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    animation: `fade-in-up 0.5s ease-out ${0.7 + i * 0.1}s both`,
                  }}>
                    <Box sx={{ width: 22, height: 22, borderRadius: 1.5, background: `${c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                    </Box>
                    <Box>
                      <Box sx={{ width: '60%', height: 6, borderRadius: 5, background: isDark ? 'rgba(139,131,255,0.10)' : 'rgba(108,99,255,0.08)', mb: 0.8 }} />
                      <Box sx={{ width: '40%', height: 10, borderRadius: 5, background: `${c}30` }} />
                    </Box>
                  </Box>
                ))}
              </Box>
              {/* Mock chart area */}
              <Box sx={{
                flex: 2, borderRadius: 2,
                background: isDark ? 'rgba(26,29,46,0.80)' : 'rgba(255,255,255,0.80)',
                border: isDark ? '1px solid rgba(139,131,255,0.06)' : '1px solid rgba(108,99,255,0.04)',
                p: 2, display: 'flex', alignItems: 'flex-end', gap: 0.8,
              }}>
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <Box key={i} sx={{
                    flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0',
                    background: `linear-gradient(180deg, #6C63FF ${100 - h}%, #FF658440)`,
                    opacity: 0.7, transition: 'all 0.3s',
                    animation: `fade-in-up 0.4s ease-out ${0.8 + i * 0.05}s both`,
                    '&:hover': { opacity: 1, transform: 'scaleY(1.05)' },
                  }} />
                ))}
              </Box>
            </Box>

            {/* Orbiting mini cards */}
            {[
              { icon: <TrendingUpRounded />, label: 'Thống kê', top: '10%', left: '-4%', delay: '0s' },
              { icon: <GradeRounded />, label: 'Điểm số', top: '12%', right: '-5%', delay: '1s' },
              { icon: <ScheduleRounded />, label: 'Lịch học', bottom: '8%', left: '-3%', delay: '2s' },
              { icon: <PeopleRounded />, label: 'Lớp học', bottom: '12%', right: '-4%', delay: '0.5s' },
            ].map((card, i) => (
              <Box key={i} sx={{
                position: 'absolute', top: card.top, left: card.left, right: card.right, bottom: card.bottom,
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 1, borderRadius: 2.5,
                background: isDark ? 'rgba(26,29,46,0.90)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(139,131,255,0.12)' : '1px solid rgba(108,99,255,0.10)',
                boxShadow: isDark ? '0 6px 24px rgba(0,0,0,0.30)' : '0 6px 24px rgba(108,99,255,0.10)',
                animation: `float-gentle 5s ease-in-out infinite ${card.delay}`,
                zIndex: 2,
              }}>
                <Box sx={{ '& .MuiSvgIcon-root': { fontSize: 20, color: '#6C63FF' } }}>{card.icon}</Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: textPrimary, fontSize: '0.75rem' }}>
                  {card.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      <WaveDivider isDark={isDark} />

      {/* ── STATS ── */}
      <Box ref={statsRef} sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
            {STATS.map((s, i) => (
              <StatItem key={i} stat={s} inView={statsInView} isDark={isDark} index={i} />
            ))}
          </Box>
        </Container>
      </Box>

      <WaveDivider isDark={isDark} flip />

      {/* ── FEATURES ── */}
      <Box ref={featRef} sx={{ position: 'relative', zIndex: 1, pb: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{
              color: '#6C63FF', fontWeight: 700, letterSpacing: '0.12em',
              animation: featInView ? 'fade-in-up 0.5s ease-out both' : 'none',
            }}>
              Tính năng nổi bật
            </Typography>
            <Typography variant="h4" sx={{
              fontWeight: 800, mt: 1, letterSpacing: '-0.02em', color: textPrimary,
              animation: featInView ? 'fade-in-up 0.5s ease-out 0.1s both' : 'none',
            }}>
              Mọi thứ bạn cần trong{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(90deg, #6C63FF, #FF6584, #06B6D4, #6C63FF)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'text-shine 4s ease-in-out infinite',
              }}>một nền tảng</Box>
            </Typography>
            <Typography sx={{
              color: textSecondary, mt: 2, maxWidth: 560, mx: 'auto', lineHeight: 1.7,
              animation: featInView ? 'fade-in-up 0.5s ease-out 0.2s both' : 'none',
            }}>
              Được thiết kế để đáp ứng mọi nhu cầu quản lý trường học, từ điểm số đến thời khóa biểu
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} isDark={isDark} inView={featInView} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── HOW IT WORKS ── */}
      <Box ref={stepsRef} sx={{
        position: 'relative', zIndex: 1, py: { xs: 8, md: 12 },
        background: isDark ? 'rgba(26,29,46,0.30)' : 'rgba(255,255,255,0.40)',
        backdropFilter: 'blur(10px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#10B981', fontWeight: 700, letterSpacing: '0.12em' }}>
              Quy trình
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, letterSpacing: '-0.02em', color: textPrimary }}>
              Bắt đầu chỉ trong{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(90deg, #10B981, #06B6D4, #10B981)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'text-shine 4s ease-in-out infinite',
              }}>3 bước đơn giản</Box>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'stretch' }}>
            {STEPS.map((step, i) => (
              <Box key={i} sx={{
                flex: 1, textAlign: 'center', position: 'relative',
                p: 4, borderRadius: 4,
                background: isDark ? 'rgba(26,29,46,0.55)' : 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(139,131,255,0.06)' : '1px solid rgba(108,99,255,0.04)',
                animation: stepsInView ? `fade-in-up 0.6s ease-out ${i * 0.15}s both` : 'none',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.25)' : '0 16px 48px rgba(108,99,255,0.08)' },
              }}>
                {/* Connecting line to next step */}
                {i < STEPS.length - 1 && (
                  <Box sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute', top: '50%', right: -32, width: 28, height: 2,
                    background: `linear-gradient(90deg, ${step.color}60, ${STEPS[i + 1].color}60)`,
                    zIndex: 3,
                  }} />
                )}
                {/* Step number */}
                <Typography sx={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 28, borderRadius: '50%', lineHeight: '28px',
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                  color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                  boxShadow: `0 4px 14px ${step.color}40`,
                }}>
                  {i + 1}
                </Typography>
                <Box sx={{
                  width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2.5, mt: 1,
                  background: `${step.color}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '& .MuiSvgIcon-root': { fontSize: 28, color: step.color },
                }}>
                  {step.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: textPrimary, fontSize: '1rem' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.7 }}>
                  {step.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── TESTIMONIALS ── */}
      <Box ref={testRef} sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#FF6584', fontWeight: 700, letterSpacing: '0.12em' }}>
              Đánh giá
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, letterSpacing: '-0.02em', color: textPrimary }}>
              Được tin tưởng bởi{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(90deg, #FF6584, #F59E0B, #FF6584)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'text-shine 4s ease-in-out infinite',
              }}>giáo viên & học sinh</Box>
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {TESTIMONIALS.map((t, i) => (
              <Box key={i} sx={{
                p: 4, borderRadius: 4,
                background: isDark ? 'rgba(26,29,46,0.55)' : 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(139,131,255,0.06)' : '1px solid rgba(108,99,255,0.04)',
                animation: testInView ? `fade-in-up 0.6s ease-out ${i * 0.12}s both` : 'none',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.20)' : '0 16px 48px rgba(108,99,255,0.08)' },
              }}>
                <FormatQuoteRounded sx={{ fontSize: 32, color: '#6C63FF', opacity: 0.3, mb: 1 }} />
                <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.3, mb: 2 }}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <StarRounded key={j} sx={{ fontSize: 18, color: j < t.rating ? '#FBBF24' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${['#6C63FF', '#FF6584', '#10B981'][i]}, ${['#8B83FF', '#FF8FA3', '#34D399'][i]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {t.name.charAt(0)}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: textPrimary }}>{t.name}</Typography>
                    <Typography variant="caption" sx={{ color: textSecondary }}>{t.role}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 10, md: 14 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Box sx={{
            p: { xs: 4, md: 6 }, borderRadius: 5,
            background: isDark ? 'rgba(26,29,46,0.65)' : 'rgba(255,255,255,0.70)',
            backdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(139,131,255,0.12)' : '1px solid rgba(108,99,255,0.08)',
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.35)' : '0 20px 60px rgba(108,99,255,0.08)',
            position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', inset: -2, borderRadius: 22,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584, #06B6D4, #10B981, #6C63FF)',
              backgroundSize: '300% 300%', animation: 'gradient-shift 4s ease infinite',
              opacity: isDark ? 0.35 : 0.20, filter: 'blur(8px)', zIndex: -1,
            },
          }}>
            <SpeedRounded sx={{ fontSize: 52, color: '#6C63FF', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: textPrimary, letterSpacing: '-0.01em' }}>
              Sẵn sàng bắt đầu?
            </Typography>
            <Typography variant="body1" sx={{ color: textSecondary, mb: 4, lineHeight: 1.7 }}>
              Đăng ký tài khoản ngay hôm nay để trải nghiệm hệ thống quản lý học tập hiện đại, nhanh chóng và dễ sử dụng.
            </Typography>
            <Button variant="contained" size="large" startIcon={<ArrowForwardRounded />}
              onClick={() => navigate('/register')}
              sx={{
                borderRadius: 3, textTransform: 'none', fontWeight: 700,
                px: 4, py: 1.5, fontSize: '1rem',
                background: 'linear-gradient(135deg, #6C63FF, #8B83FF)',
                boxShadow: '0 6px 28px rgba(108,99,255,0.35)',
                '&:hover': { boxShadow: '0 10px 38px rgba(108,99,255,0.50)', transform: 'translateY(-2px)' },
                transition: 'all 0.3s',
              }}
            >
              Tạo tài khoản miễn phí
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{
        position: 'relative', zIndex: 1, py: 6,
        background: isDark ? 'rgba(15,17,23,0.85)' : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(12px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' }, justifyContent: 'space-between',
            gap: 4, mb: 4,
          }}>
            {/* Logo & desc */}
            <Box sx={{ maxWidth: 300, textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: 2,
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SchoolRounded sx={{ fontSize: 16, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: textPrimary }}>QLHT</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.7 }}>
                Hệ thống Quản Lý Học Tập — giải pháp quản lý trường học toàn diện cho thời đại số.
              </Typography>
            </Box>

            {/* Links */}
            <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6C63FF', fontWeight: 700, letterSpacing: '0.08em', mb: 1.5, display: 'block' }}>
                  SẢN PHẨM
                </Typography>
                {['Tính năng', 'Bảo mật', 'Hỗ trợ'].map(l => (
                  <Typography key={l} variant="body2" sx={{ color: textSecondary, mb: 0.8, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#6C63FF' } }}>
                    {l}
                  </Typography>
                ))}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6C63FF', fontWeight: 700, letterSpacing: '0.08em', mb: 1.5, display: 'block' }}>
                  LIÊN HỆ
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                  <EmailRounded sx={{ fontSize: 14, color: textSecondary }} />
                  <Typography variant="body2" sx={{ color: textSecondary }}>duonghoangfc6@gmail.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                  <PhoneRounded sx={{ fontSize: 14, color: textSecondary }} />
                  <Typography variant="body2" sx={{ color: textSecondary }}>0392 313 869</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <LocationOnRounded sx={{ fontSize: 14, color: textSecondary }} />
                  <Typography variant="body2" sx={{ color: textSecondary }}>TP. Đà Nẵng</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Copyright */}
          <Box sx={{
            pt: 3, borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="caption" sx={{ color: textSecondary }}>
              © {new Date().getFullYear()} QLHT — Made by YangD. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
