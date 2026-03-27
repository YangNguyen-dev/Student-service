import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Avatar, Chip, Grid,
  useTheme, LinearProgress, Tooltip,
} from '@mui/material';
import {
  GradeRounded, EmojiEventsRounded, TrendingUpRounded, SchoolRounded,
  StarRounded, WorkspacePremiumRounded,
} from '@mui/icons-material';

export default function StudentGrades() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { setGrades(await studentService.getGrades()); }
      catch { setError('Không thể tải bảng điểm'); }
      finally { setLoading(false); }
    })();
  }, []);

  const getGradeColor = (score) => {
    if (score >= 8) return '#10B981';
    if (score >= 6.5) return '#6C63FF';
    if (score >= 5) return '#F59E0B';
    return '#EF4444';
  };

  const getGradeLabel = (score) => {
    if (score >= 8) return 'Giỏi';
    if (score >= 6.5) return 'Khá';
    if (score >= 5) return 'Trung Bình';
    return 'Yếu';
  };

  const getGradeEmoji = (score) => {
    if (score >= 9) return '🏆';
    if (score >= 8) return '⭐';
    if (score >= 6.5) return '👍';
    if (score >= 5) return '📝';
    return '📚';
  };

  // Stats
  const totalAvg = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.averageScore || 0), 0) / grades.length)
    : 0;
  const excellentCount = grades.filter(g => g.averageScore >= 8).length;
  const goodCount = grades.filter(g => g.averageScore >= 6.5 && g.averageScore < 8).length;
  const highestGrade = grades.length > 0
    ? grades.reduce((max, g) => (g.averageScore || 0) > (max.averageScore || 0) ? g : max, grades[0])
    : null;

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#6C63FF' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary', animation: 'pulse 1.5s ease-in-out infinite' }}>
        Đang tải bảng điểm...
      </Typography>
    </Box>
  );

  const summaryCards = [
    {
      icon: <TrendingUpRounded />, label: 'Điểm TB', value: totalAvg.toFixed(1),
      accent: getGradeColor(totalAvg), sub: getGradeLabel(totalAvg),
    },
    {
      icon: <EmojiEventsRounded />, label: 'Môn Giỏi', value: `${excellentCount}`,
      accent: '#10B981', sub: `/ ${grades.length} môn`,
    },
    {
      icon: <StarRounded />, label: 'Môn Khá', value: `${goodCount}`,
      accent: '#6C63FF', sub: `/ ${grades.length} môn`,
    },
    {
      icon: <WorkspacePremiumRounded />, label: 'Cao nhất',
      value: highestGrade?.averageScore?.toFixed(1) || '—',
      accent: '#F59E0B', sub: highestGrade?.subjectName || '',
    },
  ];

  return (
    <Box sx={{
      animation: 'fadeIn 0.5s ease-out',
      '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      '@keyframes shimmer': { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
          boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
          animation: 'slideUp 0.4s ease-out',
        }}>
          <GradeRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Bảng điểm
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Kết quả học tập • {grades.length} môn học
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={i}>
            <Card sx={{
              borderRadius: 3, position: 'relative', overflow: 'hidden',
              animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""', position: 'absolute', left: 0, top: 0,
                width: 4, height: '100%', background: card.accent, borderRadius: '0 4px 4px 0',
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${card.accent}20`,
              },
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{
                  width: 36, height: 36, mb: 1,
                  background: `${card.accent}15`, color: card.accent,
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}>
                  {card.icon}
                </Avatar>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
                  {card.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="h5" sx={{ color: card.accent, fontWeight: 800 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    {card.sub}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grades Table */}
      <Card sx={{
        borderRadius: 3, overflow: 'hidden',
        animation: 'slideUp 0.6s ease-out 0.4s both',
      }}>
        <Box sx={{
          p: 2.5, pb: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,101,132,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(108,99,255,0.06) 0%, rgba(255,101,132,0.03) 100%)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SchoolRounded sx={{ color: '#6C63FF', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Chi tiết điểm theo môn
            </Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>Môn học</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>TX 1</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>TX 2</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>Giữa kỳ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>Cuối kỳ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>TB Môn</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>Xếp loại</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <GradeRounded sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography>Chưa có điểm nào</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : grades.map((g, i) => {
                const avg = g.averageScore;
                const color = getGradeColor(avg);
                return (
                  <TableRow
                    key={i}
                    hover
                    sx={{
                      animation: `slideUp 0.4s ease-out ${0.5 + i * 0.05}s both`,
                      '&:hover': {
                        backgroundColor: isDark ? `${color}08` : `${color}05`,
                      },
                    }}
                  >
                    <TableCell>
                        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>
                          {g.subjectName}
                        </Typography>
                    </TableCell>
                    {[g.oralScore, g.quiz15Score, g.midtermScore, g.finalScore].map((score, j) => (
                      <TableCell key={j} align="center">
                        <Typography sx={{
                          color: score != null ? getGradeColor(score) : 'text.disabled',
                          fontWeight: 600, fontSize: '0.9rem',
                        }}>
                          {score ?? '—'}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      {avg != null ? (
                        <Tooltip title={`${avg.toFixed(2)} điểm`} arrow>
                          <Chip
                            label={avg.toFixed(1)}
                            size="small"
                            sx={{
                              fontWeight: 800, fontSize: '0.85rem',
                              backgroundColor: `${color}18`,
                              color: color,
                              border: `1px solid ${color}30`,
                              minWidth: 52,
                            }}
                          />
                        </Tooltip>
                      ) : '—'}
                    </TableCell>
                    <TableCell align="center">
                      {avg != null && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                          <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.75rem' }}>
                            {getGradeLabel(avg)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(avg * 10, 100)}
                            sx={{
                              width: 50, height: 4, borderRadius: 2,
                              backgroundColor: `${color}15`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: color,
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer summary */}
        {grades.length > 0 && (
          <Box sx={{
            p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: isDark ? 'rgba(108,99,255,0.04)' : 'rgba(108,99,255,0.02)',
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tổng điểm trung bình: <strong style={{ color: getGradeColor(totalAvg) }}>{totalAvg.toFixed(2)}</strong>
            </Typography>
            <Chip
              icon={<EmojiEventsRounded sx={{ fontSize: 16 }} />}
              label={`Xếp loại: ${getGradeLabel(totalAvg)}`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: `${getGradeColor(totalAvg)}15`,
                color: getGradeColor(totalAvg),
                border: `1px solid ${getGradeColor(totalAvg)}25`,
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
