import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, CircularProgress, Alert,
  useTheme, Divider, Chip,
} from '@mui/material';
import {
  TrendingUpRounded, SchoolRounded, ClassRounded, GradeRounded,
  HomeRounded, EmojiEventsRounded, ThumbUpRounded, HelpOutlineRounded,
  SentimentDissatisfiedRounded,
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

function getRank(avg) {
  if (avg >= 8) return 'Giỏi';
  if (avg >= 6.5) return 'Khá';
  if (avg >= 5) return 'Trung bình';
  return 'Yếu';
}

function computeStudentAverage(grades) {
  // Given all grade entries for one student, compute overall average across subjects
  const validGrades = grades.filter(g => g.averageScore != null);
  if (validGrades.length === 0) return null;
  return validGrades.reduce((sum, g) => sum + g.averageScore, 0) / validGrades.length;
}

const RANK_COLORS = { 'Giỏi': '#4CAF50', 'Khá': '#2196F3', 'Trung bình': '#FF9800', 'Yếu': '#FF5252' };

export default function TeacherStatistics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Homeroom stats
  const [homeroomRankData, setHomeroomRankData] = useState([]);
  const [homeroomSubjectAvg, setHomeroomSubjectAvg] = useState([]);
  const [homeroomRankCount, setHomeroomRankCount] = useState({ 'Giỏi': 0, 'Khá': 0, 'Trung bình': 0, 'Yếu': 0, 'Chưa xét': 0 });
  const [homeroomTotal, setHomeroomTotal] = useState(0);
  const [hasHomeroom, setHasHomeroom] = useState(true);

  // Teaching stats
  const [teachingClassAvg, setTeachingClassAvg] = useState([]);
  const [teachingRankByClass, setTeachingRankByClass] = useState([]);
  const [teachingTotal, setTeachingTotal] = useState(0);
  const [teachingPassRate, setTeachingPassRate] = useState(null);
  const [teachingOverallAvg, setTeachingOverallAvg] = useState(null);
  const [teachingBestClass, setTeachingBestClass] = useState('—');

  useEffect(() => {
    (async () => {
      try {
        // === HOMEROOM SECTION ===
        try {
          // Find homeroom class
          const [profile, classrooms] = await Promise.all([
            teacherService.getProfile(),
            teacherService.getMyClassrooms(),
          ]);
          const teacherName = profile.fullName || profile.username;
          const homeroomClass = classrooms.find(c => c.homeroomTeacher === teacherName);

          if (!homeroomClass) {
            setHasHomeroom(false);
          } else {
            // Get real student list (sĩ số) and grades
            const [students, grades] = await Promise.all([
              teacherService.getStudentsByClass(homeroomClass.classId),
              teacherService.getHomeroomGrades(),
            ]);

            setHomeroomTotal(students.length); // Real class size

            // Group grades by student
            const studentGrades = {};
            const subjectMap = {};

            grades.forEach(g => {
              if (!studentGrades[g.studentId]) studentGrades[g.studentId] = [];
              studentGrades[g.studentId].push(g);

              if (g.averageScore != null) {
                const subject = g.subjectName || 'Không rõ';
                if (!subjectMap[subject]) subjectMap[subject] = { total: 0, count: 0 };
                subjectMap[subject].total += g.averageScore;
                subjectMap[subject].count++;
              }
            });

            // Rank each student, track who has no grades at all
            const rankCount = { 'Giỏi': 0, 'Khá': 0, 'Trung bình': 0, 'Yếu': 0 };
            let ranked = 0;
            Object.values(studentGrades).forEach(sGrades => {
              const avg = computeStudentAverage(sGrades);
              if (avg != null) { rankCount[getRank(avg)]++; ranked++; }
            });
            // "Chưa xét" = students in class but without any ranked grade
            const chuaXet = students.length - ranked;
            setHomeroomRankCount({ ...rankCount, 'Chưa xét': chuaXet });

            setHomeroomRankData(
              Object.entries(rankCount)
                .filter(([, v]) => v > 0)
                .map(([name, value]) => ({ name, value, color: RANK_COLORS[name] }))
            );

            setHomeroomSubjectAvg(
              Object.entries(subjectMap).map(([name, { total, count }]) => ({
                name,
                'Điểm trung bình': Math.round((total / count) * 100) / 100,
              }))
            );
          }
        } catch {
          setHasHomeroom(false);
        }

        // === TEACHING SECTION (CHI TIẾT) ===
        try {
          const classrooms = await teacherService.getMyClassrooms();
          const classAvgs = [];
          const rankByClass = [];
          let allScores = [];
          let passCount = 0;
          let totalGraded = 0;

          for (const cls of classrooms) {
            try {
              const grades = await teacherService.getGradesByClass(cls.classId);
              const validGrades = grades.filter(g => g.averageScore != null);
              totalGraded += validGrades.length;
              passCount += validGrades.filter(g => g.averageScore >= 5).length;

              // Tính Điểm trung bình lớp
              let avg = 0;
              if (validGrades.length > 0) {
                avg = validGrades.reduce((sum, g) => sum + g.averageScore, 0) / validGrades.length;
                allScores.push(...validGrades.map(g => g.averageScore));
              }
              classAvgs.push({
                name: cls.classroomName,
                'Điểm trung bình': Math.round(avg * 100) / 100,
                'Số HS': validGrades.length,
              });

              // Tính xếp loại từng HS trong lớp dạy
              const rc = { 'Giỏi': 0, 'Khá': 0, 'Trung bình': 0, 'Yếu': 0 };
              validGrades.forEach(g => {
                const r = getRank(g.averageScore);
                if (r === 'Trung bình') rc['Trung bình']++;
                else rc[r]++;
              });
              rankByClass.push({ name: cls.classroomName, ...rc });
            } catch { }
          }

          setTeachingTotal(classrooms.length);
          setTeachingClassAvg(classAvgs);
          setTeachingRankByClass(rankByClass);
          if (totalGraded > 0) setTeachingPassRate(Math.round((passCount / totalGraded) * 100));

          if (allScores.length > 0) {
            const overall = allScores.reduce((a, b) => a + b, 0) / allScores.length;
            setTeachingOverallAvg(Math.round(overall * 100) / 100);
          }

          // Lớp có Điểm trung bình cao nhất
          if (classAvgs.length > 0) {
            const best = classAvgs.reduce((a, b) => (a['Điểm trung bình'] >= b['Điểm trung bình'] ? a : b));
            if (best['Điểm trung bình'] > 0) setTeachingBestClass(`${best.name} (${best['Điểm trung bình']})`);
          }
        } catch { }

      } catch { setError('Không thể tải dữ liệu thống kê'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
      <CircularProgress sx={{ color: '#EC4899' }} size={48} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Đang tải thống kê...</Typography>
    </Box>
  );

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ==================== HOMEROOM SECTION ==================== */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #FF6584, #EC4899)', boxShadow: '0 4px 20px rgba(255,101,132,0.3)' }}>
          <HomeRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Thống kê lớp chủ nhiệm</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Kết quả học tập và xếp loại</Typography>
        </Box>
      </Box>

      {hasHomeroom ? (
        <>
          {/* Rank stat cards */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Sĩ số', value: homeroomTotal, icon: <SchoolRounded sx={{ fontSize: 18 }} />, color: '#6C63FF' },
              { label: 'Giỏi', value: homeroomRankCount['Giỏi'], icon: <EmojiEventsRounded sx={{ fontSize: 18 }} />, color: '#10B981' },
              { label: 'Khá', value: homeroomRankCount['Khá'], icon: <ThumbUpRounded sx={{ fontSize: 18 }} />, color: '#2196F3' },
              { label: 'Trung bình', value: homeroomRankCount['Trung bình'], icon: <GradeRounded sx={{ fontSize: 18 }} />, color: '#FF9800' },
              { label: 'Yếu', value: homeroomRankCount['Yếu'], icon: <SentimentDissatisfiedRounded sx={{ fontSize: 18 }} />, color: '#FF5252' },
              { label: 'Chưa xét', value: homeroomRankCount['Chưa xét'], icon: <HelpOutlineRounded sx={{ fontSize: 18 }} />, color: '#9E9E9E' },
            ].map((r, i) => (
              <Card key={r.label} sx={{ flex: '1 1 100px', borderRadius: 3, animation: `slideUp 0.5s ease-out ${i * 0.06}s both`, transition: 'all 0.3s', border: '1px solid', borderColor: `${r.color}25`, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${r.color}20` } }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: `${r.color}18`, color: r.color, mx: 'auto', mb: 0.5, width: 32, height: 32 }}>{r.icon}</Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: r.color, lineHeight: 1.1 }}>{r.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>{r.label}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Pie Chart */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>Phân bố xếp loại</Typography>
                  {homeroomRankData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={homeroomRankData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {homeroomRankData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: isDark ? '#1E293B' : '#fff', border: 'none', borderRadius: 8 }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chưa có dữ liệu điểm</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Bar Chart - by subject */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>Điểm trung bình theo môn</Typography>
                  {homeroomSubjectAvg.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={homeroomSubjectAvg} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                        <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} angle={-35} textAnchor="end" interval={0} height={60} />
                        <YAxis domain={[0, 10]} tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: isDark ? '#1E293B' : '#fff', border: 'none', borderRadius: 8 }}
                          formatter={(value) => [value.toFixed(2), 'Điểm trung bình']} />
                        <Bar dataKey="Điểm trung bình" fill="#FF6584" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chưa có dữ liệu</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>Bạn chưa được phân công lớp chủ nhiệm.</Alert>
      )}

      {/* ==================== TEACHING SECTION (CHI TIẾT) ==================== */}
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #10B981, #06B6D4)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
          <ClassRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Thống kê lớp dạy</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{teachingTotal} lớp • Kết quả giảng dạy</Typography>
        </Box>
      </Box>

      {/* Stat cards tổng quan lớp dạy */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Số lớp dạy', value: teachingTotal, icon: <ClassRounded sx={{ fontSize: 20 }} />, color: '#10B981' },
          { label: 'Tỉ lệ đạt (≥5)', value: teachingPassRate != null ? `${teachingPassRate}%` : '—', icon: <ThumbUpRounded sx={{ fontSize: 20 }} />, color: '#6C63FF' },
          { label: 'Điểm trung bình chung', value: teachingOverallAvg != null ? teachingOverallAvg.toFixed(2) : '—', icon: <TrendingUpRounded sx={{ fontSize: 20 }} />, color: '#2196F3' },
          { label: 'Lớp cao nhất', value: teachingBestClass, icon: <EmojiEventsRounded sx={{ fontSize: 20 }} />, color: '#FF9800', isText: true },
        ].map((r, i) => (
          <Card key={r.label} sx={{ flex: '1 1 160px', borderRadius: 3, animation: `slideUp 0.5s ease-out ${i * 0.08}s both`, transition: 'all 0.3s', border: '1px solid', borderColor: `${r.color}25`, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${r.color}20` } }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40, backgroundColor: `${r.color}18`, color: r.color }}>{r.icon}</Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>{r.label}</Typography>
                <Typography variant={r.isText ? 'body1' : 'h5'} sx={{ fontWeight: 800, color: r.color, lineHeight: 1.1 }}>{r.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Biểu đồ xếp loại theo lớp (Stacked Bar) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>Xếp loại học sinh theo lớp</Typography>
              {teachingRankByClass.length > 0 ? (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={teachingRankByClass} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                    <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} angle={-35} textAnchor="end" interval={0} height={60} />
                    <YAxis tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: isDark ? '#1E293B' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="Giỏi" stackId="rank" fill="#4CAF50" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Khá" stackId="rank" fill="#2196F3" />
                    <Bar dataKey="Trung bình" stackId="rank" fill="#FF9800" />
                    <Bar dataKey="Yếu" stackId="rank" fill="#FF5252" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 340 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chưa có dữ liệu</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Biểu đồ Điểm trung bình theo lớp */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>Điểm trung bình theo lớp</Typography>
              {teachingClassAvg.length > 0 ? (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={teachingClassAvg} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                    <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} angle={-35} textAnchor="end" interval={0} height={60} />
                    <YAxis domain={[0, 10]} tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: isDark ? '#1E293B' : '#fff', border: 'none', borderRadius: 8 }}
                      formatter={(value, name) => [name === 'Điểm trung bình' ? value.toFixed(2) : value, name]} />
                    <Legend />
                    <Bar dataKey="Điểm trung bình" fill="#10B981" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 340 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chưa có dữ liệu</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
