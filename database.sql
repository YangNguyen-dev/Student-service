-- =====================================================
-- CSDL HỆ THỐNG QUẢN LÝ HỌC TẬP (QLHT)
-- MySQL 8.0+
-- Tạo ngày: 26/03/2026
-- =====================================================

CREATE DATABASE IF NOT EXISTS sms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sms;

-- =====================================================
-- 1. BẢNG VAI TRÒ (roles)
-- Lưu danh sách vai trò: ADMIN, STUDENT, TEACHER
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    role_id     INT             NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)     NOT NULL UNIQUE COMMENT 'Tên vai trò (ADMIN, STUDENT, TEACHER)',
    description VARCHAR(255)    DEFAULT NULL COMMENT 'Mô tả vai trò',
    PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dữ liệu mặc định cho bảng roles
INSERT IGNORE INTO roles (role_id, name, description) VALUES
(1, 'ADMIN',   'Quản trị viên hệ thống'),
(2, 'STUDENT', 'Học sinh'),
(3, 'TEACHER', 'Giáo viên');

-- =====================================================
-- 2. BẢNG NGƯỜI DÙNG (users)
-- Lưu tài khoản đăng nhập chung cho tất cả vai trò
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id       BIGINT        NOT NULL AUTO_INCREMENT,
    username      VARCHAR(150)  NOT NULL UNIQUE COMMENT 'Tên đăng nhập',
    email         VARCHAR(150)  NOT NULL UNIQUE COMMENT 'Email',
    full_name     VARCHAR(255)  DEFAULT NULL COMMENT 'Họ và tên',
    avatar_url    VARCHAR(500)  DEFAULT NULL COMMENT 'Đường dẫn ảnh đại diện',
    password_hash VARCHAR(255)  NOT NULL COMMENT 'Mật khẩu đã mã hóa BCrypt',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. BẢNG PHÂN QUYỀN (user_roles)
-- Liên kết N-N giữa users và roles
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id    BIGINT   NOT NULL,
    role_id    INT      NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gán quyền',
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 4. BẢNG MÔN HỌC (subjects)
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    subject_id   BIGINT       NOT NULL AUTO_INCREMENT,
    subject_name VARCHAR(150) NOT NULL UNIQUE COMMENT 'Tên môn học',
    description  VARCHAR(255) DEFAULT NULL COMMENT 'Mô tả môn học',
    PRIMARY KEY (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. BẢNG LỚP HỌC (classrooms)
-- =====================================================
CREATE TABLE IF NOT EXISTS classrooms (
    class_id       BIGINT       NOT NULL AUTO_INCREMENT,
    classroom_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Tên lớp (VD: 10A1)',
    max_students   INT          DEFAULT NULL COMMENT 'Sĩ số tối đa',
    teacher_id     BIGINT       DEFAULT NULL UNIQUE COMMENT 'FK giáo viên chủ nhiệm',
    PRIMARY KEY (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. BẢNG HỌC SINH (students)
-- Liên kết 1-1 với users (dùng chung user_id làm PK)
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    user_id       BIGINT       NOT NULL,
    student_code  VARCHAR(50)  NOT NULL UNIQUE COMMENT 'Mã học sinh (VD: HS001)',
    date_of_birth DATE         DEFAULT NULL COMMENT 'Ngày sinh',
    gender        TINYINT      DEFAULT NULL COMMENT 'Giới tính: 0=Nam, 1=Nữ, 2=Khác',
    class_id      BIGINT       DEFAULT NULL COMMENT 'FK lớp đang học',
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)      ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classrooms(class_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 7. BẢNG GIÁO VIÊN (teachers)
-- Liên kết 1-1 với users (dùng chung user_id làm PK)
-- =====================================================
CREATE TABLE IF NOT EXISTS teachers (
    user_id      BIGINT       NOT NULL,
    teacher_code VARCHAR(50)  NOT NULL UNIQUE COMMENT 'Mã giáo viên (VD: GV001)',
    date_of_birth DATE        DEFAULT NULL COMMENT 'Ngày sinh',
    gender       TINYINT      DEFAULT NULL COMMENT 'Giới tính: 0=Nam, 1=Nữ, 2=Khác',
    subject_id   BIGINT       DEFAULT NULL COMMENT 'FK môn phụ trách',
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id)    REFERENCES users(user_id)      ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thêm FK cho classrooms.teacher_id (GVCN)
ALTER TABLE classrooms
    ADD FOREIGN KEY (teacher_id) REFERENCES teachers(user_id) ON DELETE SET NULL;

-- =====================================================
-- 8. BẢNG PHÂN CÔNG DẠY (class_subjects)
-- Lớp nào - Môn nào - Giáo viên nào dạy
-- =====================================================
CREATE TABLE IF NOT EXISTS class_subjects (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    class_id   BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT DEFAULT NULL COMMENT 'FK giáo viên bộ môn',
    PRIMARY KEY (id),
    UNIQUE KEY uq_class_subject (class_id, subject_id),
    FOREIGN KEY (class_id)   REFERENCES classrooms(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(user_id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 9. BẢNG THỜI KHÓA BIỂU (schedules)
-- Mỗi tiết = 1 dòng: Lớp + Ngày + Tiết + Môn + GV
-- =====================================================
CREATE TABLE IF NOT EXISTS schedules (
    schedules_id BIGINT  NOT NULL AUTO_INCREMENT,
    day          TINYINT NOT NULL COMMENT 'Ngày (0=Thứ2 ... 5=Thứ7)',
    period       INT     NOT NULL COMMENT 'Tiết học (1-10)',
    class_id     BIGINT  DEFAULT NULL,
    subject_id   BIGINT  DEFAULT NULL,
    teacher_id   BIGINT  DEFAULT NULL,
    PRIMARY KEY (schedules_id),
    FOREIGN KEY (class_id)   REFERENCES classrooms(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(user_id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 10. BẢNG ĐIỂM SỐ (grades)
-- Mỗi HS chỉ có 1 bản ghi điểm / môn (UNIQUE)
-- =====================================================
CREATE TABLE IF NOT EXISTS grades (
    ma_diem      BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Mã điểm (PK)',
    diem_mieng   DOUBLE DEFAULT NULL COMMENT 'Điểm miệng (hệ số 1)',
    diem_15_phut DOUBLE DEFAULT NULL COMMENT 'Điểm 15 phút (hệ số 1)',
    diem_giua_ky DOUBLE DEFAULT NULL COMMENT 'Điểm giữa kỳ (hệ số 3)',
    diem_cuoi_ky DOUBLE DEFAULT NULL COMMENT 'Điểm cuối kỳ (hệ số 5)',
    student_id   BIGINT NOT NULL,
    subject_id   BIGINT DEFAULT NULL,
    teacher_id   BIGINT DEFAULT NULL COMMENT 'GV đã nhập điểm',
    PRIMARY KEY (ma_diem),
    UNIQUE KEY uq_student_subject (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(user_id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(user_id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- CÔNG THỨC TÍNH ĐIỂM TRUNG BÌNH (tham khảo):
-- DTB = Miệng*0.1 + 15Phút*0.1 + GiữaKỳ*0.3 + CuốiKỳ*0.5
-- (Tính ở tầng Java Mapper, không lưu trong DB)
-- =====================================================
