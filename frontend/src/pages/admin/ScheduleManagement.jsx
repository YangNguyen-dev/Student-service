import { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Avatar, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  useTheme, Select, InputLabel, FormControl, Chip, Tooltip,
} from '@mui/material';
import {
  ScheduleRounded, AddRounded, DeleteRounded, EditRounded, TouchAppRounded,
  CloseRounded, SaveRounded,
} from '@mui/icons-material';

const HOMEROOM_ID = '__HOMEROOM__';
const CEREMONY_ID = '__CEREMONY__';
const DAYS = [
  { value: 'MONDAY', label: 'Thứ 2' },
  { value: 'TUESDAY', label: 'Thứ 3' },
  { value: 'WEDNESDAY', label: 'Thứ 4' },
  { value: 'THURSDAY', label: 'Thứ 5' },
  { value: 'FRIDAY', label: 'Thứ 6' },
  { value: 'SATURDAY', label: 'Thứ 7' },
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function ScheduleManagement() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dialog, setDialog] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState({ classId: '', subjectId: '', teacherId: '', day: 'MONDAY', period: 1 });
  const [saving, setSaving] = useState(false);

  // Batch mode state
  const [batchMode, setBatchMode] = useState(false);
  const [batchDeleteMode, setBatchDeleteMode] = useState(false);
  const [batchSubject, setBatchSubject] = useState('');
  const [batchTeacher, setBatchTeacher] = useState('');
  const [batchSaving, setBatchSaving] = useState(false);

  // Subject options = real subjects + special types
  const subjectOptions = useMemo(() => [
    ...subjects,
    { subjectId: HOMEROOM_ID, subjectName: '🏫 Sinh hoạt lớp' },
    { subjectId: CEREMONY_ID, subjectName: '🚩 Chào cờ' },
  ], [subjects]);

  // Get current classroom info
  const currentClassroom = useMemo(
    () => classrooms.find(c => c.classId === selectedClass),
    [classrooms, selectedClass]
  );

  // Filter teachers by selected subject
  const getFilteredTeachers = (subjectId) => {
    if (subjectId === HOMEROOM_ID || subjectId === CEREMONY_ID) {
      // "Sinh hoạt lớp" / "Chào cờ" → only homeroom teacher
      if (!currentClassroom?.homeroomTeacherId) return [];
      const ht = teachers.find(t => t.id === currentClassroom.homeroomTeacherId);
      return ht ? [ht] : [];
    }
    // Filter teachers who teach this subject
    return teachers.filter(t => t.subject?.subjectId === subjectId);
  };

  // Auto-select teacher when subject changes (for dialog form)
  const handleFormSubjectChange = (subjectId) => {
    const filtered = getFilteredTeachers(subjectId);
    setForm(prev => ({
      ...prev,
      subjectId,
      teacherId: filtered.length > 0 ? filtered[0].id : '',
    }));
  };

  // Auto-select teacher when batch subject changes
  const handleBatchSubjectChange = (subjectId) => {
    const filtered = getFilteredTeachers(subjectId);
    setBatchSubject(subjectId);
    setBatchTeacher(filtered.length > 0 ? filtered[0].id : '');
  };

  useEffect(() => {
    (async () => {
      try {
        const [cls, subs, tchs] = await Promise.all([
          adminService.getAllClassrooms(),
          adminService.getAllSubjects(),
          adminService.getAllTeachers(),
        ]);
        setClassrooms(cls);
        setSubjects(subs);
        setTeachers(tchs);
        if (cls.length > 0) {
          setSelectedClass(cls[0].classId);
          setSchedules(await adminService.getSchedulesByClass(cls[0].classId));
        }
      } catch { setError('Không thể tải dữ liệu'); }
      finally { setLoading(false); }
    })();
  }, []);

  const loadSchedules = async (classId) => {
    setSelectedClass(classId);
    try {
      setSchedules(await adminService.getSchedulesByClass(classId));
    } catch { setError('Không thể tải lịch'); }
  };

  // Click empty cell → open dialog pre-filled with day+period
  const openAddAtCell = (day, period) => {
    if (batchMode) {
      handleBatchCellClick(day, period);
      return;
    }
    const defaultSubject = subjects[0]?.subjectId || '';
    const filtered = getFilteredTeachers(defaultSubject);
    setForm({
      classId: selectedClass,
      subjectId: defaultSubject,
      teacherId: filtered.length > 0 ? filtered[0].id : '',
      day, period,
    });
    setDialog({ open: true, mode: 'add', data: null });
  };

  const openEdit = (s) => {
    let subjectId = s.subjectId;
    if (!subjectId && s.scheduleType === 'HOMEROOM') subjectId = HOMEROOM_ID;
    else if (!subjectId && s.scheduleType === 'CEREMONY') subjectId = CEREMONY_ID;
    setForm({ classId: s.classId, subjectId, teacherId: s.teacherId, day: s.dayOfWeek, period: s.period || 1 });
    setDialog({ open: true, mode: 'edit', data: s });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // For homeroom, we need to send a null/special subjectId or handle it
      const payload = { ...form };
      if (payload.subjectId === HOMEROOM_ID) {
        payload.subjectId = null;
        payload.scheduleType = 'HOMEROOM';
      } else if (payload.subjectId === CEREMONY_ID) {
        payload.subjectId = null;
        payload.scheduleType = 'CEREMONY';
      } else {
        payload.scheduleType = null;
      }
      if (dialog.mode === 'add') {
        await adminService.createSchedule(payload);
        setSuccess('Thêm lịch thành công!');
      } else {
        await adminService.updateSchedule(dialog.data.scheduleId, payload);
        setSuccess('Cập nhật thành công!');
      }
      setDialog({ open: false, mode: 'add', data: null });
      setTimeout(() => setSuccess(''), 3000);
      await loadSchedules(selectedClass);
    } catch (e) { setError(e.response?.data?.message || 'Lưu thất bại'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await adminService.deleteSchedule(scheduleId);
      setSuccess('Xóa thành công!');
      setTimeout(() => setSuccess(''), 3000);
      await loadSchedules(selectedClass);
    } catch { setError('Xóa thất bại'); }
  };

  // Batch delete: click filled cell → delete immediately
  const handleBatchDeleteClick = async (scheduleId) => {
    setBatchSaving(true);
    try {
      await adminService.deleteSchedule(scheduleId);
      await loadSchedules(selectedClass);
    } catch { setError('Xóa thất bại'); }
    finally { setBatchSaving(false); }
  };

  // Batch mode: click cell → create immediately
  const handleBatchCellClick = async (day, period) => {
    if (!batchSubject || !batchTeacher) {
      setError('Vui lòng chọn Môn học và Giáo viên trước khi click ô');
      return;
    }
    setBatchSaving(true);
    try {
      const isHomeroom = batchSubject === HOMEROOM_ID;
      const isCeremony = batchSubject === CEREMONY_ID;
      const payload = {
        classId: selectedClass,
        subjectId: (isHomeroom || isCeremony) ? null : batchSubject,
        teacherId: batchTeacher,
        scheduleType: isHomeroom ? 'HOMEROOM' : isCeremony ? 'CEREMONY' : null,
        day, period,
      };
      await adminService.createSchedule(payload);
      await loadSchedules(selectedClass);
    } catch (e) { setError(e.response?.data?.message || 'Thêm thất bại'); }
    finally { setBatchSaving(false); }
  };

  const startBatch = () => {
    const defaultSubject = subjects[0]?.subjectId || '';
    const filtered = getFilteredTeachers(defaultSubject);
    setBatchSubject(defaultSubject);
    setBatchTeacher(filtered.length > 0 ? filtered[0].id : '');
    setBatchMode(true);
  };

  const exitBatch = () => {
    setBatchMode(false);
    setBatchDeleteMode(false);
    setSuccess('');
  };

  // Build grid: rows = periods, cols = days
  const grid = {};
  PERIODS.forEach(p => { grid[p] = {}; DAYS.forEach(d => { grid[p][d.value] = null; }); });
  schedules.forEach(s => {
    if (s.period && grid[s.period]) grid[s.period][s.dayOfWeek] = s;
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress sx={{ color: '#6C63FF' }} /></Box>;

  const batchSubjectLabel = batchSubject === HOMEROOM_ID ? 'Sinh hoạt lớp' : batchSubject === CEREMONY_ID ? 'Chào cờ' : (subjects.find(s => s.subjectId === batchSubject)?.subjectName || '');
  const batchFilteredTeachers = getFilteredTeachers(batchSubject);
  const dialogFilteredTeachers = getFilteredTeachers(form.subjectId);

  return (
    <Box sx={{
      '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      animation: 'slideUp 0.5s ease-out',
    }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg, #6C63FF, #9D97FF)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}>
          <ScheduleRounded sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>Quản lý thời khóa biểu</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Xếp lịch và quản lý tiết học</Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Chọn lớp</InputLabel>
          <Select value={selectedClass} label="Chọn lớp" onChange={(e) => loadSchedules(e.target.value)}>
            {classrooms.map(c => <MenuItem key={c.classId} value={c.classId}>{c.classroomName}</MenuItem>)}
          </Select>
        </FormControl>
        {!batchMode && !batchDeleteMode ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<TouchAppRounded />} onClick={startBatch}
              sx={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
              Điền nhanh
            </Button>
            <Button variant="contained" startIcon={<DeleteRounded />}
              onClick={() => setBatchDeleteMode(true)}
              sx={{ background: 'linear-gradient(135deg, #FF5252, #FF1744)' }}>
              Xóa nhanh
            </Button>
          </Box>
        ) : (
          <Button variant="outlined" startIcon={<CloseRounded />} onClick={exitBatch} color="error">
            Thoát chế độ {batchMode ? 'điền' : 'xóa'} nhanh
          </Button>
        )}
      </Box>

      {/* Batch toolbar */}
      {batchMode && (
        <Card sx={{ mb: 2, border: '2px solid #10B981', background: isDark ? '#10B98112' : '#10B98108' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="CHẾ ĐỘ ĐIỀN NHANH" color="success" size="small" sx={{ fontWeight: 700 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chọn môn + GV, rồi click vào ô trống:</Typography>
            <TextField select label="Môn học" value={batchSubject} onChange={(e) => handleBatchSubjectChange(e.target.value)}
              size="small" sx={{ minWidth: 170 }}>
              {subjectOptions.map(s => <MenuItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</MenuItem>)}
            </TextField>
            <TextField select label="Giáo viên" value={batchTeacher} onChange={(e) => setBatchTeacher(e.target.value)}
              size="small" sx={{ minWidth: 200 }}
              disabled={batchSubject === HOMEROOM_ID}
              helperText={batchSubject === HOMEROOM_ID ? 'Tự động: GVCN' : (batchFilteredTeachers.length === 0 ? 'Không có GV dạy môn này' : '')}>
              {batchFilteredTeachers.map(t => <MenuItem key={t.id} value={t.id}>{t.fullName || t.username} ({t.teacherCode})</MenuItem>)}
            </TextField>
            {batchSaving && <CircularProgress size={20} sx={{ color: '#10B981' }} />}
          </CardContent>
        </Card>
      )}
      {batchDeleteMode && (
        <Card sx={{ mb: 2, border: '2px solid #FF5252', background: isDark ? '#FF525212' : '#FF525208' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label="CHẾ ĐỘ XÓA NHANH" color="error" size="small" sx={{ fontWeight: 700 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Click vào tiết có sẵn để xóa ngay — không cần xác nhận</Typography>
            {batchSaving && <CircularProgress size={20} sx={{ color: '#FF5252' }} />}
          </CardContent>
        </Card>
      )}

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 70 }}>Tiết</TableCell>
                {DAYS.map(d => (
                  <TableCell key={d.value} sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center', minWidth: 120 }}>{d.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {PERIODS.map(p => (
                <TableRow key={p} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{p}</TableCell>
                  {DAYS.map(d => {
                    const s = grid[p]?.[d.value];
                    const isHomeroom = s && s.scheduleType === 'HOMEROOM';
                    const isCeremony = s && s.scheduleType === 'CEREMONY';
                    const isSpecial = isHomeroom || isCeremony;
                    return (
                      <TableCell key={d.value} sx={{ textAlign: 'center', p: 0.5 }}>
                        {s ? (
                          <Box
                            onClick={() => batchDeleteMode ? handleBatchDeleteClick(s.scheduleId) : null}
                            sx={{
                              p: 0.5, borderRadius: 1, cursor: batchDeleteMode ? 'pointer' : 'default',
                              background: isSpecial ? (isDark ? '#F59E0B15' : '#F59E0B08') : (isDark ? '#6C63FF15' : '#6C63FF08'),
                              position: 'relative', '&:hover .cell-actions': { opacity: 1 },
                              transition: 'all 0.2s',
                              ...(batchDeleteMode && {
                                '&:hover': { background: '#FF525230', border: '1px solid #FF5252' },
                                border: '1px solid transparent',
                              }),
                            }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: isCeremony ? '#EF4444' : isHomeroom ? '#F59E0B' : '#6C63FF', fontSize: 13 }}>
                              {s.subject || (isCeremony ? '🚩 Chào cờ' : '🏫 Sinh hoạt')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 11 }}>{s.teacherName}</Typography>
                            {!batchDeleteMode && (
                              <Box className="cell-actions" sx={{
                                position: 'absolute', top: 2, right: 2, opacity: 0,
                                transition: 'opacity 0.2s', display: 'flex', gap: 0.5,
                                background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
                                borderRadius: 1, p: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              }}>
                                <Tooltip title="Sửa" arrow>
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                                    sx={{ color: '#6C63FF', p: 0.5 }}><EditRounded sx={{ fontSize: 16 }} /></IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa" arrow>
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(s.scheduleId); }}
                                    sx={{ color: '#FF5252', p: 0.5 }}><DeleteRounded sx={{ fontSize: 16 }} /></IconButton>
                                </Tooltip>
                              </Box>
                            )}
                            {batchDeleteMode && (
                              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}>
                                <DeleteRounded sx={{ fontSize: 24, color: '#FF5252' }} />
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Tooltip title={batchMode ? `Click để thêm ${batchSubjectLabel}` : 'Click để thêm tiết'} arrow>
                            <Box
                              onClick={() => openAddAtCell(d.value, p)}
                              sx={{
                                cursor: 'pointer', py: 1.5, borderRadius: 1,
                                border: `1px dashed ${batchMode ? '#10B981' : '#CBD5E1'}`,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  background: batchMode ? (isDark ? '#10B98120' : '#10B98110') : (isDark ? '#6C63FF15' : '#6C63FF08'),
                                  borderColor: batchMode ? '#10B981' : '#6C63FF',
                                },
                              }}
                            >
                              <AddRounded sx={{ fontSize: 16, color: batchMode ? '#10B981' : 'text.disabled' }} />
                            </Box>
                          </Tooltip>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog (single mode) */}
      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'add' ? 'Thêm tiết học' : 'Sửa tiết học'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Thứ" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} fullWidth>
              {DAYS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </TextField>
            <TextField select label="Tiết" value={form.period} onChange={(e) => setForm({ ...form, period: parseInt(e.target.value) })} fullWidth>
              {PERIODS.map(p => <MenuItem key={p} value={p}>Tiết {p}</MenuItem>)}
            </TextField>
          </Box>
          <TextField select label="Môn học" value={form.subjectId} onChange={(e) => handleFormSubjectChange(e.target.value)} fullWidth>
            {subjectOptions.map(s => <MenuItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</MenuItem>)}
          </TextField>
          <TextField select label="Giáo viên" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} fullWidth
            disabled={form.subjectId === HOMEROOM_ID}
            helperText={form.subjectId === HOMEROOM_ID ? 'Tự động chọn GVCN của lớp' : (dialogFilteredTeachers.length === 0 ? 'Không có giáo viên dạy môn này' : '')}>
            {dialogFilteredTeachers.map(t => <MenuItem key={t.id} value={t.id}>{t.fullName || t.username} ({t.teacherCode})</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : <SaveRounded />}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
