/**
 * Hằng số dùng chung trong ứng dụng.
 * Tập trung các giá trị cố định để tránh hardcode string rải rác.
 */

// === Vai trò người dùng ===
export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
};

// === Nhãn hiển thị cho vai trò ===
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.TEACHER]: 'Giáo viên',
  [ROLES.STUDENT]: 'Học sinh',
};

// === Màu chủ đạo cho từng vai trò ===
export const ROLE_COLORS = {
  [ROLES.ADMIN]: '#FF6584',
  [ROLES.TEACHER]: '#10B981',
  [ROLES.STUDENT]: '#6C63FF',
};

// === Các cột điểm ===
export const GRADE_TYPES = {
  ORAL: 'oralScore',
  QUIZ15: 'quiz15Score',
  MIDTERM: 'midtermScore',
  FINAL: 'finalScore',
  AVERAGE: 'averageScore',
};

export const GRADE_LABELS = {
  [GRADE_TYPES.ORAL]: 'Miệng',
  [GRADE_TYPES.QUIZ15]: '15 phút',
  [GRADE_TYPES.MIDTERM]: 'Giữa kỳ',
  [GRADE_TYPES.FINAL]: 'Cuối kỳ',
  [GRADE_TYPES.AVERAGE]: 'Trung bình',
};

// === Xếp loại học lực ===
export const CLASSIFICATIONS = {
  EXCELLENT: { label: 'Giỏi', min: 8.0, color: '#10B981' },
  GOOD: { label: 'Khá', min: 6.5, color: '#3B82F6' },
  AVERAGE: { label: 'Trung bình', min: 5.0, color: '#F59E0B' },
  WEAK: { label: 'Yếu', min: 0, color: '#EF4444' },
};

/**
 * Xếp loại học lực từ điểm trung bình.
 * @param {number} avg - Điểm trung bình
 * @returns {string} Xếp loại (Giỏi/Khá/Trung bình/Yếu)
 */
export function classifyGrade(avg) {
  if (avg >= 8.0) return CLASSIFICATIONS.EXCELLENT.label;
  if (avg >= 6.5) return CLASSIFICATIONS.GOOD.label;
  if (avg >= 5.0) return CLASSIFICATIONS.AVERAGE.label;
  return CLASSIFICATIONS.WEAK.label;
}

// === Ngày trong tuần (mapping với backend enum Day) ===
export const DAYS = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
};

export const DAY_LABELS = {
  [DAYS.MONDAY]: 'Thứ 2',
  [DAYS.TUESDAY]: 'Thứ 3',
  [DAYS.WEDNESDAY]: 'Thứ 4',
  [DAYS.THURSDAY]: 'Thứ 5',
  [DAYS.FRIDAY]: 'Thứ 6',
  [DAYS.SATURDAY]: 'Thứ 7',
};

// === Số tiết trong ngày ===
export const MAX_PERIODS = 10;

// === Kích thước layout ===
export const LAYOUT = {
  DRAWER_WIDTH: 250,
  DRAWER_COLLAPSED: 68,
  HEADER_HEIGHT: 60,
};
