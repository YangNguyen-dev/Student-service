# BÁO CÁO CHI TIẾT DỰ ÁN
# HỆ THỐNG QUẢN LÝ HỌC TẬP (QLHT)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Giới thiệu
Hệ thống Quản Lý Học Tập (QLHT) là ứng dụng web quản lý hoạt động giảng dạy và học tập tại trường phổ thông. Hệ thống hỗ trợ 3 vai trò chính: **Quản trị viên (Admin)**, **Giáo viên (Teacher)**, và **Học sinh (Student)**, mỗi vai trò có quyền hạn và giao diện riêng biệt.

### 1.2. Mục tiêu
- Quản lý thông tin người dùng (tài khoản, hồ sơ, avatar)
- Quản lý lớp học, môn học, phân công giáo viên
- Quản lý lịch học/lịch dạy
- Nhập và tra cứu điểm số
- Thống kê học lực theo nhiều chiều
- Bảo mật bằng JWT với cơ chế refresh token tự động

---

## 2. CÔNG NGHỆ SỬ DỤNG

### 2.1. Backend
| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| **Java** | 22 | Ngôn ngữ lập trình chính |
| **Spring Boot** | 3.4.3 | Framework backend |
| **Spring Security + OAuth2** | — | Xác thực và phân quyền JWT |
| **Spring Data JPA** | — | ORM, truy vấn cơ sở dữ liệu |
| **MySQL** | 8.0+ | Cơ sở dữ liệu quan hệ |
| **Nimbus JOSE + JWT** | 10.0.2 | Tạo và xác thực JWT token |
| **MapStruct** | 1.5.5 | Ánh xạ DTO ↔ Entity tự động |
| **Lombok** | — | Giảm boilerplate code |
| **Gradle** | 9.0.0 | Build tool |

### 2.2. Frontend
| Công nghệ | Mô tả |
|---|---|
| **React** | Thư viện xây dựng giao diện |
| **Vite** | Build tool, dev server |
| **MUI (Material UI)** | Thư viện UI component |
| **Recharts** | Biểu đồ thống kê |
| **Axios** | HTTP client + interceptor tự động refresh token |
| **React Router** | Điều hướng SPA |

### 2.3. Triển khai
- Backend và Frontend được đóng gói chung: Vite build ra `frontend/dist/`, Spring Boot phục vụ file tĩnh
- Khởi chạy bằng `start.bat` (build frontend → chạy Spring Boot)
- Cơ sở dữ liệu: MySQL, schema `sms`, port `3306`
- Ứng dụng chạy trên port `8080`

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1. Sơ đồ kiến trúc tổng quan

```
┌─────────────────────────────────────────────┐
│              Trình duyệt (Browser)           │
│    React + MUI + Recharts + React Router     │
└──────────────────┬──────────────────────────┘
                   │ HTTP (REST API)
                   ▼
┌─────────────────────────────────────────────┐
│           Spring Boot Backend (8080)         │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │Controller │→ │ Service  │→ │Repository │ │
│  │  (REST)   │  │ (Logic)  │  │  (JPA)    │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│       ▲                            │        │
│  Security Filter                   ▼        │
│  (JWT Auth)              ┌──────────────┐   │
│                          │  MySQL (sms)  │   │
│                          └──────────────┘   │
└─────────────────────────────────────────────┘
```

### 3.2. Cấu trúc thư mục Backend

```
src/main/java/com/example/student_service/
├── api/                    # ApiResponse wrapper
├── config/                 # Cấu hình (Security, JWT, CORS)
│   ├── SecurityConfig.java
│   └── JwtProperties.java
├── controllers/            # REST API endpoints
│   ├── AuthenticationController.java
│   ├── AdminController.java
│   ├── TeacherController.java
│   ├── StudentController.java
│   └── AvatarController.java
├── dtos/                   # Data Transfer Objects
│   ├── request/            # 10 request DTOs
│   └── response/           # 9 response DTOs
├── entities/               # JPA Entities (10 bảng)
├── enums/                  # Enum (Roles, Gender, Day)
├── exception/              # Xử lý lỗi tập trung (ApiException)
├── mapper/                 # MapStruct mapper
├── repositories/           # Spring Data JPA repositories
└── services/               # Business logic
    ├── admin/              # AdminService  (@Transactional readOnly)
    ├── auth/               # AuthenticationService
    ├── student/            # StudentService (@Transactional readOnly)
    └── teacher/            # TeacherService (@Transactional readOnly)
```

### 3.3. Cấu trúc thư mục Frontend

```
frontend/src/
├── components/
│   └── MainLayout.jsx      # Layout chung (sidebar, header, routing)
├── constants.js             # Hằng số (ROLES, GRADE_TYPES, DAYS, LAYOUT)
├── context/
│   ├── AuthContext.jsx      # Quản lý trạng thái xác thực
│   └── ThemeContext.jsx     # Quản lý Dark/Light mode
├── pages/
│   ├── LoginPage.jsx        # Trang đăng nhập
│   ├── RegisterPage.jsx     # Trang đăng ký
│   ├── DashboardPage.jsx    # Trang tổng quan
│   ├── admin/               # 7 trang cho Admin
│   ├── teacher/             # 5 trang cho Giáo viên
│   └── student/             # 3 trang cho Học sinh
├── services/
│   ├── api.js               # Axios instance + interceptors + auto refresh
│   ├── authService.js       # API xác thực
│   ├── adminService.js      # API quản trị (21 phương thức)
│   ├── teacherService.js    # API giáo viên (10 phương thức)
│   └── studentService.js    # API học sinh (6 phương thức)
└── theme/                   # Cấu hình MUI theme (dark/light)
```

---

## 4. CƠ SỞ DỮ LIỆU

### 4.1. Sơ đồ thực thể (Entity Relationship)

```
┌─────────┐     ┌──────────┐     ┌────────┐
│  users  │────→│user_roles│←────│ roles  │
└────┬────┘     └──────────┘     └────────┘
     │
     ├──→ students ──→ classrooms
     │                    │
     └──→ teachers        │
              │           │
              ▼           ▼
     class_subjects  ←── subjects
              │
              ▼
          schedules
              │
              ▼
           grades
```

### 4.2. Danh sách bảng tổng quan

| STT | Bảng | Mô tả | Số cột |
|-----|------|--------|--------|
| 1 | `users` | Thông tin đăng nhập, hồ sơ cá nhân, avatar | 6 |
| 2 | `roles` | Vai trò (ADMIN, TEACHER, STUDENT) | 3 |
| 3 | `user_roles` | Liên kết users ↔ roles (nhiều-nhiều) | 3 |
| 4 | `students` | Thông tin riêng của học sinh (mã HS, lớp) | 5 |
| 5 | `teachers` | Thông tin riêng của giáo viên (mã GV, môn) | 5 |
| 6 | `classrooms` | Lớp học (tên, GVCN, sĩ số tối đa) | 4 |
| 7 | `subjects` | Môn học (tên, mô tả) | 3 |
| 8 | `class_subjects` | Phân công GV dạy môn nào ở lớp nào | 4 |
| 9 | `schedules` | Thời khóa biểu (ngày, tiết, lớp, môn, GV, loại tiết) | 7 |
| 10 | `grades` | Điểm số (miệng, 15 phút, giữa kỳ, cuối kỳ) | 8 |

---

### 4.3. Chi tiết từng bảng

#### 4.3.1. Bảng `users` — Người dùng

> Lưu tài khoản đăng nhập chung cho tất cả vai trò. Mỗi người dùng có thể là Admin, Giáo viên, hoặc Học sinh.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `user_id` | BIGINT | **PK**, AUTO_INCREMENT | Mã người dùng |
| `username` | VARCHAR(150) | NOT NULL, UNIQUE | Tên đăng nhập |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Địa chỉ email |
| `full_name` | VARCHAR(255) | NULL | Họ và tên đầy đủ |
| `avatar_url` | VARCHAR(500) | NULL | Đường dẫn ảnh đại diện |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa (BCrypt, strength=10) |

**Quan hệ:**
- `1 — N` → `user_roles` (một user có nhiều vai trò)
- `1 — 1` → `students` (nếu là học sinh, liên kết qua `user_id`)
- `1 — 1` → `teachers` (nếu là giáo viên, liên kết qua `user_id`)

---

#### 4.3.2. Bảng `roles` — Vai trò

> Bảng tra cứu vai trò người dùng. Dữ liệu được khởi tạo sẵn 3 bản ghi mặc định.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `role_id` | INT | **PK**, AUTO_INCREMENT | Mã vai trò |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Tên vai trò (Enum) |
| `description` | VARCHAR(255) | NULL | Mô tả vai trò |

**Giá trị Enum `Roles`:**

| role_id | name | description |
|---------|------|-------------|
| 1 | `ADMIN` | Quản trị viên hệ thống |
| 2 | `STUDENT` | Học sinh |
| 3 | `TEACHER` | Giáo viên |

**Quan hệ:**
- `1 — N` → `user_roles` (một vai trò gán cho nhiều user)

---

#### 4.3.3. Bảng `user_roles` — Phân quyền người dùng

> Bảng trung gian liên kết N-N giữa `users` và `roles`. Khóa chính là tổ hợp (`user_id`, `role_id`).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `user_id` | BIGINT | **PK**, FK → `users.user_id` | Mã người dùng |
| `role_id` | INT | **PK**, FK → `roles.role_id` | Mã vai trò |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP, không cập nhật | Thời gian gán quyền (tự động tạo) |

**Ràng buộc FK:**
- `user_id` → `users(user_id)` ON DELETE CASCADE
- `role_id` → `roles(role_id)` ON DELETE CASCADE

**Đặc điểm:** Sử dụng `@IdClass(UserRoleId)` trong JPA, composite primary key.

---

#### 4.3.4. Bảng `students` — Học sinh

> Lưu thông tin riêng của học sinh. Liên kết 1-1 với `users` qua `@MapsId` (dùng chung `user_id` làm PK).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `user_id` | BIGINT | **PK**, FK → `users.user_id` | Mã người dùng (chia sẻ PK với `users`) |
| `student_code` | VARCHAR(50) | NOT NULL, UNIQUE | Mã học sinh (VD: `HS001`) |
| `date_of_birth` | DATE | NULL | Ngày sinh |
| `gender` | TINYINT | NULL | Giới tính (Enum) |
| `class_id` | BIGINT | NULL, FK → `classrooms.class_id` | Lớp đang học |

**Giá trị Enum `Gender`:**

| Giá trị DB | Enum Java | Mô tả |
|------------|-----------|--------|
| 0 | `MALE` | Nam |
| 1 | `FEMALE` | Nữ |
| 2 | `OTHER` | Khác |

**Ràng buộc FK:**
- `user_id` → `users(user_id)` ON DELETE CASCADE
- `class_id` → `classrooms(class_id)` ON DELETE SET NULL

**Quan hệ:**
- `1 — 1` ← `users` (kế thừa PK, `@MapsId`)
- `N — 1` → `classrooms` (nhiều HS thuộc 1 lớp)
- `1 — N` → `grades` (một HS có nhiều bản ghi điểm cho các môn)

---

#### 4.3.5. Bảng `teachers` — Giáo viên

> Lưu thông tin riêng của giáo viên. Liên kết 1-1 với `users` qua `@MapsId`.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `user_id` | BIGINT | **PK**, FK → `users.user_id` | Mã người dùng (chia sẻ PK với `users`) |
| `teacher_code` | VARCHAR(50) | NOT NULL, UNIQUE | Mã giáo viên (VD: `GV001`) |
| `date_of_birth` | DATE | NULL | Ngày sinh |
| `gender` | TINYINT | NULL | Giới tính (Enum: `MALE`, `FEMALE`, `OTHER`) |
| `subject_id` | BIGINT | NULL, FK → `subjects.subject_id` | Môn học phụ trách chính |

**Ràng buộc FK:**
- `user_id` → `users(user_id)` ON DELETE CASCADE
- `subject_id` → `subjects(subject_id)` ON DELETE SET NULL

**Quan hệ:**
- `1 — 1` ← `users` (kế thừa PK, `@MapsId`)
- `N — 1` → `subjects` (nhiều GV thuộc 1 môn)
- `1 — 1` ← `classrooms` (GV là GVCN của 1 lớp, `mappedBy="homeroomTeacher"`)
- `1 — N` → `grades` (GV nhập điểm cho nhiều bản ghi)
- `1 — N` → `schedules` (GV có nhiều tiết dạy)
- `1 — N` → `class_subjects` (GV được phân công dạy nhiều lớp-môn)

---

#### 4.3.6. Bảng `classrooms` — Lớp học

> Lưu thông tin lớp học. Mỗi lớp có tối đa 1 GVCN (ràng buộc UNIQUE trên `teacher_id`).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `class_id` | BIGINT | **PK**, AUTO_INCREMENT | Mã lớp học |
| `classroom_name` | VARCHAR(100) | NOT NULL, UNIQUE | Tên lớp (VD: `10A1`, `11B2`) |
| `max_students` | INT | NULL | Sĩ số tối đa |
| `teacher_id` | BIGINT | NULL, UNIQUE, FK → `teachers.user_id` | Giáo viên chủ nhiệm |

**Ràng buộc FK:**
- `teacher_id` → `teachers(user_id)` ON DELETE SET NULL

**Ràng buộc đặc biệt:**
- `teacher_id` có UNIQUE → mỗi GV chỉ chủ nhiệm tối đa 1 lớp (quan hệ 1-1)

**Quan hệ:**
- `1 — 1` → `teachers` (GVCN, `@OneToOne` + `@JoinColumn`)
- `1 — N` → `students` (danh sách HS trong lớp)
- `1 — N` → `schedules` (thời khóa biểu của lớp)
- `1 — N` → `class_subjects` (phân công GVBM, `cascade=ALL`, `orphanRemoval=true`)

---

#### 4.3.7. Bảng `subjects` — Môn học

> Lưu danh sách các môn học trong hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `subject_id` | BIGINT | **PK**, AUTO_INCREMENT | Mã môn học |
| `subject_name` | VARCHAR(150) | NOT NULL, UNIQUE | Tên môn học (VD: `Toán`, `Ngữ Văn`) |
| `description` | VARCHAR(255) | NULL | Mô tả môn học |

**Quan hệ:**
- `1 — N` → `teachers` (nhiều GV cùng dạy 1 môn)
- `1 — N` → `grades` (điểm theo từng môn)
- `1 — N` → `schedules` (tiết học của môn)
- `1 — N` → `class_subjects` (phân công lớp-môn)

---

#### 4.3.8. Bảng `class_subjects` — Phân công giáo viên bộ môn

> Bảng trung gian xác định: **Lớp nào — Môn nào — Giáo viên nào dạy**. Ràng buộc UNIQUE trên cặp (`class_id`, `subject_id`) → mỗi lớp chỉ có 1 GV dạy 1 môn.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `id` | BIGINT | **PK**, AUTO_INCREMENT | Mã phân công |
| `class_id` | BIGINT | NOT NULL, FK → `classrooms.class_id` | Lớp học |
| `subject_id` | BIGINT | NOT NULL, FK → `subjects.subject_id` | Môn học |
| `teacher_id` | BIGINT | NULL, FK → `teachers.user_id` | Giáo viên bộ môn |

**Ràng buộc:**
- UNIQUE(`class_id`, `subject_id`) — mỗi lớp chỉ có 1 bản ghi cho 1 môn
- `class_id` → `classrooms(class_id)` ON DELETE CASCADE
- `subject_id` → `subjects(subject_id)` ON DELETE CASCADE
- `teacher_id` → `teachers(user_id)` ON DELETE SET NULL

---

#### 4.3.9. Bảng `schedules` — Thời khóa biểu

> Mỗi tiết học = 1 bản ghi: Lớp + Ngày + Tiết + Môn + GV + Loại tiết. Hỗ trợ tiết đặc biệt (Sinh hoạt lớp, Chào cờ).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `schedules_id` | BIGINT | **PK**, AUTO_INCREMENT | Mã tiết học |
| `day` | TINYINT | NOT NULL | Ngày trong tuần (Enum) |
| `period` | INT | NOT NULL | Tiết học (1 – 10) |
| `class_id` | BIGINT | NULL, FK → `classrooms.class_id` | Lớp học |
| `subject_id` | BIGINT | NULL, FK → `subjects.subject_id` | Môn học (NULL nếu tiết đặc biệt) |
| `teacher_id` | BIGINT | NULL, FK → `teachers.user_id` | Giáo viên dạy |
| `schedule_type` | VARCHAR(255) | NULL | Loại tiết (NULL / `HOMEROOM` / `CEREMONY`) |

**Giá trị Enum `Day`:**

| Giá trị DB | Enum Java | Mô tả |
|------------|-----------|--------|
| 0 | `MONDAY` | Thứ Hai |
| 1 | `TUESDAY` | Thứ Ba |
| 2 | `WEDNESDAY` | Thứ Tư |
| 3 | `THURSDAY` | Thứ Năm |
| 4 | `FRIDAY` | Thứ Sáu |
| 5 | `SATURDAY` | Thứ Bảy |

**Giá trị cột `schedule_type`:**

| Giá trị | Mô tả | Đặc điểm |
|---------|--------|-----------|
| `NULL` | Tiết học bình thường | Có `subject_id`, GV bộ môn |
| `HOMEROOM` | Tiết Sinh hoạt lớp | Không có `subject_id`, GV = GVCN |
| `CEREMONY` | Tiết Chào cờ | Không có `subject_id`, GV = GVCN |

**Ràng buộc FK:**
- `class_id` → `classrooms(class_id)` ON DELETE CASCADE
- `subject_id` → `subjects(subject_id)` ON DELETE SET NULL
- `teacher_id` → `teachers(user_id)` ON DELETE SET NULL

**Lưu ý:** Hệ thống kiểm tra trùng lịch (cùng lớp + cùng ngày + cùng tiết) ở tầng Service trước khi thêm.

---

#### 4.3.10. Bảng `grades` — Điểm số

> Mỗi bản ghi = điểm của 1 học sinh cho 1 môn, do 1 giáo viên nhập. Ràng buộc UNIQUE trên (`student_id`, `subject_id`) → mỗi HS chỉ có 1 bản ghi điểm / môn.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|---------------|-----------|--------|
| `ma_diem` | BIGINT | **PK**, AUTO_INCREMENT | Mã điểm |
| `diem_mieng` | DOUBLE | NULL | Điểm miệng (hệ số 1) |
| `diem_15_phut` | DOUBLE | NULL | Điểm 15 phút (hệ số 1) |
| `diem_giua_ky` | DOUBLE | NULL | Điểm giữa kỳ (hệ số 3) |
| `diem_cuoi_ky` | DOUBLE | NULL | Điểm cuối kỳ (hệ số 5) |
| `student_id` | BIGINT | NOT NULL, FK → `students.user_id` | Học sinh |
| `subject_id` | BIGINT | NULL, FK → `subjects.subject_id` | Môn học |
| `teacher_id` | BIGINT | NULL, FK → `teachers.user_id` | Giáo viên đã nhập điểm |

**Ràng buộc:**
- UNIQUE(`student_id`, `subject_id`) — mỗi HS chỉ có 1 bản ghi điểm / môn
- `student_id` → `students(user_id)` ON DELETE CASCADE
- `subject_id` → `subjects(subject_id)` ON DELETE SET NULL
- `teacher_id` → `teachers(user_id)` ON DELETE SET NULL

**Công thức tính Điểm Trung Bình (ĐTB):**
```
ĐTB = Miệng × 0.1 + 15Phút × 0.1 + GiữaKỳ × 0.3 + CuốiKỳ × 0.5
```
> ĐTB được tính ở tầng Java Mapper (`GradeMapper.java`), **không lưu trong DB**.

**Xếp loại học lực (tính ở Frontend):**

| Xếp loại | Điều kiện |
|-----------|-----------|
| Giỏi | ĐTB ≥ 8.0 |
| Khá | 6.5 ≤ ĐTB < 8.0 |
| Trung bình | 5.0 ≤ ĐTB < 6.5 |
| Yếu | ĐTB < 5.0 |
| Chưa xét | Chưa đủ điểm |

---

### 4.4. Chi tiết các Enum trong hệ thống

Hệ thống sử dụng **3 enum Java chính** (package `enums/`), **1 enum mã lỗi** (package `exception/`), và **các hằng số enum-like** ở Frontend.

---

#### 4.4.1. Enum `Roles` — Vai trò người dùng

> **File**: `src/.../enums/Roles.java`  
> **Lưu trữ DB**: `EnumType.STRING` → cột `VARCHAR` trong bảng `roles.name`

```java
public enum Roles {
    ADMIN,    // Quản trị viên
    TEACHER,  // Giáo viên
    STUDENT;  // Học sinh
}
```

| Giá trị Enum | Giá trị trong DB | Mô tả | Quyền truy cập |
|---|---|---|---|
| `ADMIN` | `"ADMIN"` | Quản trị viên hệ thống | Toàn quyền quản lý: users, HS, GV, lớp, môn, TKB, thống kê |
| `TEACHER` | `"TEACHER"` | Giáo viên | Xem hồ sơ, lớp dạy, lịch dạy, nhập điểm, thống kê GV |
| `STUDENT` | `"STUDENT"` | Học sinh | Xem hồ sơ, bảng điểm, thời khóa biểu |

**Sử dụng tại:**
- Entity `Role.name` → lưu tên vai trò vào bảng `roles`
- `SecurityConfig.java` → phân quyền endpoint (`ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STUDENT`)
- `AuthenticationService.java` → gán vai trò khi đăng ký
- Frontend `constants.js` → mapping tương ứng `ROLES = { ADMIN, TEACHER, STUDENT }`

**Cơ chế hoạt động:**
```
Đăng ký → AuthService kiểm tra role trong RegisterRequest
        → Tìm Role entity theo Roles.valueOf(roleName)
        → Tạo UserRole liên kết user + role
        → Lưu vào bảng user_roles
```

---

#### 4.4.2. Enum `Gender` — Giới tính

> **File**: `src/.../enums/Gender.java`  
> **Lưu trữ DB**: `EnumType.ORDINAL` → cột `TINYINT` (0, 1, 2)

```java
public enum Gender {
    MALE,    // Nam
    FEMALE,  // Nữ
    OTHER    // Khác
}
```

| Ordinal (DB) | Giá trị Enum | Hiển thị Frontend | Mô tả |
|---|---|---|---|
| `0` | `MALE` | "Nam" | Giới tính nam |
| `1` | `FEMALE` | "Nữ" | Giới tính nữ |
| `2` | `OTHER` | "Khác" | Giới tính khác |

**Sử dụng tại:**
- Entity `Student.gender` → cột `students.gender` (TINYINT)
- Entity `Teacher.gender` → cột `teachers.gender` (TINYINT)
- `ProfileUpdateRequest.gender` → nhận từ frontend khi cập nhật hồ sơ
- `StudentResponse.gender` / `TeacherResponse.gender` → trả về frontend

**Cách mapping Frontend ↔ Backend:**
```
Frontend gửi:    { "gender": "MALE" }     (string)
Backend nhận:    Gender.MALE              (enum, tự động parse)
Lưu DB:          0                        (TINYINT ordinal)
Trả frontend:    "MALE"                   (serialize thành string)
Frontend hiển thị: gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : 'Khác'
```

---

#### 4.4.3. Enum `Day` — Ngày trong tuần

> **File**: `src/.../enums/Day.java`  
> **Lưu trữ DB**: `EnumType.ORDINAL` → cột `TINYINT` (0 → 5)

```java
public enum Day {
    MONDAY,     // Thứ Hai
    TUESDAY,    // Thứ Ba
    WEDNESDAY,  // Thứ Tư
    THURSDAY,   // Thứ Năm
    FRIDAY,     // Thứ Sáu
    SATURDAY    // Thứ Bảy
}
```

| Ordinal (DB) | Giá trị Enum | Nhãn tiếng Việt | JavaScript `getDay()` |
|---|---|---|---|
| `0` | `MONDAY` | Thứ 2 | `1` |
| `1` | `TUESDAY` | Thứ 3 | `2` |
| `2` | `WEDNESDAY` | Thứ 4 | `3` |
| `3` | `THURSDAY` | Thứ 5 | `4` |
| `4` | `FRIDAY` | Thứ 6 | `5` |
| `5` | `SATURDAY` | Thứ 7 | `6` |

> **Lưu ý:** Không có `SUNDAY` (Chủ nhật) vì trường phổ thông không học Chủ nhật.

**Sử dụng tại:**
- Entity `Schedule.day` → cột `schedules.day` (TINYINT)
- `ScheduleRequest.dayOfWeek` → nhận chuỗi `"MONDAY"`, convert thành `Day` enum
- `ScheduleResponse.dayOfWeek` → trả chuỗi `"MONDAY"` cho frontend
- Frontend `constants.js` → mapping `DAY_LABELS` để hiển thị tiếng Việt

**Mapping Frontend ↔ Backend:**
```
Frontend gửi:    { "dayOfWeek": "MONDAY" }
Backend nhận:    Day.MONDAY (enum)
Lưu DB:          0 (TINYINT)
Frontend nhận:   "MONDAY" → DAY_LABELS["MONDAY"] → "Thứ 2"
```

---

#### 4.4.4. Enum `ErrorCode` — Mã lỗi hệ thống

> **File**: `src/.../exception/ErrorCode.java`  
> **Không lưu DB** — chỉ dùng trong runtime để trả mã lỗi thống nhất qua API.

```java
public enum ErrorCode {
    UNCATEGORIZED_EXIT(9999, "Uncategorized exit"),
    USER_EXISTS(1001, "User already exists"),
    USER_NOT_FOUND(1002, "User not found"),
    INVALID_PASSWORD(1003, "Mật khẩu hiện tại không đúng"),
    INVALID_ROLE(1004, "Invalid role. Must be STUDENT, TEACHER, or ADMIN"),
    STUDENT_NOT_FOUND(1005, "Student not found"),
    TEACHER_NOT_FOUND(1006, "Teacher not found"),
    CLASSROOM_NOT_FOUND(1007, "Classroom not found"),
    SUBJECT_NOT_FOUND(1008, "Subject not found"),
    NOT_TEACHING_CLASS(1009, "You are not teaching this class"),
    STUDENT_NO_CLASS(1010, "Student has no assigned class"),
    STUDENT_NOT_IN_CLASS(1011, "Student does not belong to this class"),
    CLASSROOM_EXISTS(1012, "Classroom name already exists"),
    SUBJECT_EXISTS(1013, "Subject name already exists"),
    SCHEDULE_NOT_FOUND(1014, "Schedule not found"),
    SCHEDULE_CLASS_CONFLICT(1015, "Lớp đã có tiết học vào thời điểm này"),
    SCHEDULE_TEACHER_CONFLICT(1016, "Giáo viên đã có lịch dạy vào thời điểm này");

    int code;       // Mã số lỗi
    String message; // Thông báo lỗi
}
```

| Nhóm | Mã | Tên | Mô tả |
|---|---|---|---|
| **Chung** | 9999 | `UNCATEGORIZED_EXIT` | Lỗi không xác định |
| **User** | 1001 | `USER_EXISTS` | Tên đăng nhập đã tồn tại (đăng ký) |
| | 1002 | `USER_NOT_FOUND` | Không tìm thấy người dùng |
| | 1003 | `INVALID_PASSWORD` | Sai mật khẩu hiện tại (đổi MK) |
| | 1004 | `INVALID_ROLE` | Vai trò không hợp lệ |
| **Học sinh** | 1005 | `STUDENT_NOT_FOUND` | Không tìm thấy học sinh |
| | 1010 | `STUDENT_NO_CLASS` | Học sinh chưa có lớp |
| | 1011 | `STUDENT_NOT_IN_CLASS` | HS không thuộc lớp này |
| **Giáo viên** | 1006 | `TEACHER_NOT_FOUND` | Không tìm thấy giáo viên |
| | 1009 | `NOT_TEACHING_CLASS` | GV không dạy lớp này |
| **Lớp học** | 1007 | `CLASSROOM_NOT_FOUND` | Không tìm thấy lớp |
| | 1012 | `CLASSROOM_EXISTS` | Tên lớp đã tồn tại |
| **Môn học** | 1008 | `SUBJECT_NOT_FOUND` | Không tìm thấy môn |
| | 1013 | `SUBJECT_EXISTS` | Tên môn đã tồn tại |
| **Lịch học** | 1014 | `SCHEDULE_NOT_FOUND` | Không tìm thấy tiết |
| | 1015 | `SCHEDULE_CLASS_CONFLICT` | Trùng lịch lớp |
| | 1016 | `SCHEDULE_TEACHER_CONFLICT` | Trùng lịch giáo viên |

**Cơ chế hoạt động:**
```
Service throw → new ApiException(ErrorCode.USER_NOT_FOUND)
GlobalExceptionHandler bắt → trả về JSON:
{
  "code": 1002,
  "message": "User not found"
}
```

---

#### 4.4.5. Giá trị Enum-like — `ScheduleType` (Loại tiết học)

> **Không phải Java enum** — lưu dưới dạng `VARCHAR` trong cột `schedules.schedule_type`.  
> Dùng để phân biệt tiết học bình thường và tiết đặc biệt (Sinh hoạt, Chào cờ).

| Giá trị DB | Ý nghĩa | Có `subject_id`? | GV phụ trách | Hiển thị Frontend |
|---|---|---|---|---|
| `NULL` | Tiết học bình thường | ✅ Có | GV bộ môn | Tên môn học (VD: "Toán") |
| `"HOMEROOM"` | Tiết Sinh hoạt lớp | ❌ Không | GVCN | 🏠 Sinh hoạt |
| `"CEREMONY"` | Tiết Chào cờ | ❌ Không | GVCN | 🚩 Chào cờ |

**Sử dụng tại:**
- Entity `Schedule.scheduleType` → cột `schedule_type` (VARCHAR)
- `ScheduleRequest.scheduleType` → frontend gửi `"HOMEROOM"` / `"CEREMONY"` / `null`
- `ScheduleResponse.scheduleType` → trả về frontend để render đúng icon và màu

---

#### 4.4.6. Giá trị Enum-like — Frontend Constants

> **File**: `frontend/src/constants.js`  
> Các hằng số enum-like chỉ dùng ở Frontend, không có Java enum tương ứng.

**a) `GRADE_TYPES` — Loại cột điểm:**

| Key | Giá trị | Nhãn hiển thị | Hệ số |
|---|---|---|---|
| `ORAL` | `"oralScore"` | Miệng | ×1 (10%) |
| `QUIZ15` | `"quiz15Score"` | 15 phút | ×1 (10%) |
| `MIDTERM` | `"midtermScore"` | Giữa kỳ | ×3 (30%) |
| `FINAL` | `"finalScore"` | Cuối kỳ | ×5 (50%) |
| `AVERAGE` | `"averageScore"` | Trung bình | (tính tự động) |

**b) `CLASSIFICATIONS` — Xếp loại học lực:**

| Key | Nhãn | Điều kiện ĐTB | Màu | Emoji |
|---|---|---|---|---|
| `EXCELLENT` | Giỏi | ≥ 8.0 | `#10B981` (xanh lá) | 🏆 / ⭐ |
| `GOOD` | Khá | ≥ 6.5 | `#3B82F6` (xanh dương) | 👍 |
| `AVERAGE` | Trung bình | ≥ 5.0 | `#F59E0B` (vàng) | 📝 |
| `WEAK` | Yếu | < 5.0 | `#EF4444` (đỏ) | 📚 |

**c) `ROLE_COLORS` — Màu theo vai trò:**

| Vai trò | Màu | Mã hex |
|---|---|---|
| Admin | Hồng đỏ | `#FF6584` |
| Giáo viên | Xanh lá | `#10B981` |
| Học sinh | Tím xanh | `#6C63FF` |

---

#### 4.4.7. Tổng hợp Enum

| Enum | File Java | Giá trị | Lưu DB | Kiểu lưu |
|------|-----------|---------|--------|----------|
| `Roles` | `enums/Roles.java` | `ADMIN`, `TEACHER`, `STUDENT` | `roles.name` | VARCHAR (`EnumType.STRING`) |
| `Gender` | `enums/Gender.java` | `MALE`, `FEMALE`, `OTHER` | `students.gender`, `teachers.gender` | TINYINT (`EnumType.ORDINAL`: 0, 1, 2) |
| `Day` | `enums/Day.java` | `MONDAY` → `SATURDAY` | `schedules.day` | TINYINT (`EnumType.ORDINAL`: 0 → 5) |
| `ErrorCode` | `exception/ErrorCode.java` | 17 mã lỗi (1001 → 9999) | Không lưu | Runtime only |
| `ScheduleType` | (không có enum riêng) | `NULL`, `HOMEROOM`, `CEREMONY` | `schedules.schedule_type` | VARCHAR |

### 4.5. Tổng hợp quan hệ giữa các bảng

| Mối quan hệ | Kiểu | Mô tả |
|--------------|------|--------|
| `users` ↔ `roles` | N — N | Qua bảng trung gian `user_roles` |
| `users` ↔ `students` | 1 — 1 | Chia sẻ PK (`@MapsId`), ON DELETE CASCADE |
| `users` ↔ `teachers` | 1 — 1 | Chia sẻ PK (`@MapsId`), ON DELETE CASCADE |
| `students` → `classrooms` | N — 1 | Nhiều HS thuộc 1 lớp |
| `teachers` → `subjects` | N — 1 | Nhiều GV cùng dạy 1 môn chính |
| `teachers` ↔ `classrooms` | 1 — 1 | 1 GV chủ nhiệm tối đa 1 lớp (UNIQUE FK) |
| `class_subjects` → `classrooms` | N — 1 | Nhiều phân công cho 1 lớp |
| `class_subjects` → `subjects` | N — 1 | Nhiều phân công cho 1 môn |
| `class_subjects` → `teachers` | N — 1 | 1 GV được phân nhiều lớp-môn |
| `schedules` → `classrooms` | N — 1 | Nhiều tiết thuộc 1 lớp |
| `schedules` → `subjects` | N — 1 | Nhiều tiết thuộc 1 môn |
| `schedules` → `teachers` | N — 1 | Nhiều tiết do 1 GV dạy |
| `grades` → `students` | N — 1 | Nhiều điểm thuộc 1 HS |
| `grades` → `subjects` | N — 1 | Nhiều điểm thuộc 1 môn |
| `grades` → `teachers` | N — 1 | Nhiều điểm do 1 GV nhập |

### 4.6. File SQL đi kèm

| File | Mô tả |
|------|--------|
| `database.sql` | Tạo toàn bộ cấu trúc DB (10 bảng + FK + comment + dữ liệu roles mặc định) |
| `seed_data.sql` | Dữ liệu mẫu (22 GV, 66 HS, 11 môn, 3 lớp) |

---

## 5. CHỨC NĂNG THEO VAI TRÒ

### 5.1. Quản trị viên (Admin) — 7 chức năng

| STT | Chức năng | Trang | Mô tả |
|-----|-----------|-------|--------|
| 1 | Quản lý người dùng | `UserManagement.jsx` | CRUD tài khoản, đặt lại mật khẩu |
| 2 | Quản lý học sinh | `StudentManagement.jsx` | Xem/sửa thông tin HS, phân lớp |
| 3 | Quản lý giáo viên | `TeacherManagement.jsx` | Xem/sửa thông tin GV, phân công |
| 4 | Quản lý lớp học | `ClassroomManagement.jsx` | Tạo lớp, gán GVCN, phân công GVBM |
| 5 | Quản lý môn học | `SubjectManagement.jsx` | CRUD môn học |
| 6 | Quản lý lịch học | `ScheduleManagement.jsx` | Tạo/sửa TKB, batch-fill nhanh, xóa nhanh, kiểm tra trùng lịch, hỗ trợ tiết Sinh hoạt lớp + Chào cờ |
| 7 | Thống kê | `AdminStatistics.jsx` | Thống kê tổng quan (HS, GV, lớp) |

### 5.2. Giáo viên (Teacher) — 5 chức năng

| STT | Chức năng | Trang | Mô tả |
|-----|-----------|-------|--------|
| 1 | Hồ sơ cá nhân | `TeacherProfile.jsx` | Xem/sửa thông tin (email, ngày sinh, giới tính), upload avatar |
| 2 | Lớp chủ nhiệm | `TeacherHomeroom.jsx` | Xem danh sách HS (giới tính, email), điểm lớp CN |
| 3 | Lớp giảng dạy | `TeacherTeaching.jsx` | Danh sách HS lớp dạy (giới tính, email), nhập điểm hàng loạt |
| 4 | Lịch dạy | `TeacherSchedule.jsx` | Xem TKB cá nhân, hiển thị tiết SH/Chào cờ |
| 5 | Thống kê | `TeacherStatistics.jsx` | Biểu đồ xếp loại lớp CN + ĐTB theo lớp dạy |

### 5.3. Học sinh (Student) — 3 chức năng

| STT | Chức năng | Trang | Mô tả |
|-----|-----------|-------|--------|
| 1 | Hồ sơ cá nhân | `StudentProfile.jsx` | Xem/sửa thông tin (email, ngày sinh, giới tính), upload avatar |
| 2 | Điểm số | `StudentGrades.jsx` | Xem điểm các môn, ĐTB, xếp loại |
| 3 | Lịch học | `StudentSchedule.jsx` | Xem TKB, hiển thị tiết SH/Chào cờ |

### 5.4. Chức năng chung
- **Đăng nhập / Đăng ký**: Hỗ trợ đăng nhập bằng username, mã học sinh, hoặc mã giáo viên
- **Đổi mật khẩu**: Tất cả vai trò đều có thể đổi mật khẩu
- **Upload avatar**: Ảnh đại diện hiển thị trên header và trang cá nhân
- **Dark/Light mode**: Hỗ trợ chuyển đổi chế độ tối/sáng

---

## 6. BẢO MẬT VÀ XÁC THỰC

### 6.1. Quy trình xác thực JWT

```
Đăng nhập:
  Client → POST /login { username, password }
  Server → Kiểm tra mật khẩu (BCrypt)
         → Tạo Access Token (60 phút) + Refresh Token (7 ngày)
         → Trả về { token, refreshToken, username, role, ... }

Gọi API:
  Client → GET /api/xxx (Header: Authorization: Bearer <token>)
  Server → Giải mã JWT (HS512) → Kiểm tra quyền → Trả kết quả

Khi Access Token hết hạn:
  Client nhận 401 → Tự động gọi POST /refresh-token { refreshToken }
  Server → Xác thực refresh token → Tạo cặp token mới
  Client → Lưu token mới → Thử lại request gốc
  (Nếu refresh thất bại → Đăng xuất)
```

### 6.2. Chi tiết cấu hình bảo mật

| Thuộc tính | Giá trị |
|---|---|
| Thuật toán JWT | **HS512** (HMAC-SHA512) |
| Access token TTL | **60 phút** (cấu hình được) |
| Refresh token TTL | **7 ngày** (cấu hình được) |
| Mã hóa mật khẩu | **BCrypt** (strength = 10) |
| Phân quyền | Role-based (ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT) |

### 6.3. Phân quyền endpoint

| Endpoint | Quyền truy cập |
|---|---|
| `/register`, `/login`, `/refresh-token` | Công khai |
| `/avatar/**` | Công khai (xem ảnh) |
| `/change-password`, `/avatar/upload` | Đã đăng nhập |
| `/students/**` | STUDENT |
| `/teacher/**` | TEACHER |
| `/admin/**` | ADMIN |

---

## 7. API ENDPOINTS

### 7.1. Xác thực (AuthenticationController)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/register` | Đăng ký tài khoản |
| POST | `/login` | Đăng nhập |
| POST | `/refresh-token` | Làm mới token |
| PUT | `/change-password` | Đổi mật khẩu |

### 7.2. Quản trị (AdminController) — có `@Valid` cho request body

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/admin/users` | Danh sách tất cả người dùng |
| DELETE | `/admin/users/{id}` | Xóa người dùng |
| PUT | `/admin/users/{id}/reset-password` | Đặt lại mật khẩu |
| GET | `/admin/students` | Danh sách học sinh |
| PUT | `/admin/students/{id}/class/{classId}` | Phân lớp cho HS |
| GET | `/admin/teachers` | Danh sách giáo viên |
| PUT | `/admin/teachers/{id}/subject/{subjectId}` | Phân công GV dạy môn |
| GET/POST | `/admin/classrooms` | Danh sách / Tạo lớp |
| PUT/DELETE | `/admin/classrooms/{id}` | Sửa / Xóa lớp |
| PUT | `/admin/classrooms/{id}/homeroom/{teacherId}` | Gán GVCN |
| PUT | `/admin/classrooms/{id}/subject/{subjectId}/teacher/{teacherId}` | Gán GVBM |
| GET/POST | `/admin/subjects` | Danh sách / Tạo môn |
| PUT/DELETE | `/admin/subjects/{id}` | Sửa / Xóa môn |
| GET/POST | `/admin/schedules` | Danh sách / Tạo tiết |
| PUT/DELETE | `/admin/schedules/{id}` | Sửa / Xóa tiết |
| GET | `/admin/schedules/class/{classId}` | Lịch theo lớp |

### 7.3. Giáo viên (TeacherController)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET/PUT | `/teacher/profile` | Xem / Cập nhật hồ sơ |
| GET | `/teacher/subject` | Môn được phân công |
| GET | `/teacher/classrooms` | Danh sách lớp dạy |
| GET | `/teacher/class/{id}/students` | HS trong lớp |
| GET | `/teacher/class/{id}/grades` | Điểm lớp dạy |
| POST | `/teacher/grades?classId={id}` | Nhập điểm hàng loạt |
| GET | `/teacher/schedule` | Lịch dạy |
| GET | `/teacher/homeroom/grades` | Điểm lớp CN |

### 7.4. Học sinh (StudentController)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET/PUT | `/students/profile` | Xem / Cập nhật hồ sơ |
| GET | `/students/grades` | Xem điểm |
| GET | `/students/schedule` | Xem lịch học |
| GET | `/students/classroom` | Xem lớp |

### 7.5. Avatar (AvatarController)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/avatar/upload` | Upload ảnh đại diện |
| GET | `/avatar/{filename}` | Xem ảnh |

---

## 8. TỐI ƯU HÓA HIỆU SUẤT

### 8.1. Backend Optimizations

| Kỹ thuật | Áp dụng | Mô tả |
|---|---|---|
| `@Transactional(readOnly = true)` | AdminService, TeacherService, StudentService | Tắt dirty-checking cho các phương thức GET, Hibernate không tốn chi phí snapshot |
| `@Valid` | AdminController (6 endpoint POST/PUT) | Tự động validate DTO trước khi vào Service |
| `@EntityGraph` | ScheduleRepository (2), GradeRepository (3) | JOIN FETCH tránh N+1 query khi load relationship |
| `ApiException` | Toàn bộ Service | Xử lý ngoại lệ tập trung, response format thống nhất |

### 8.2. Frontend Optimizations

| Kỹ thuật | File | Mô tả |
|---|---|---|
| Constants centralization | `constants.js` | Gom tất cả ROLES, GRADE_TYPES, DAYS, LAYOUT vào 1 file |
| Lazy loading | `App.jsx` | Tất cả trang dùng `React.lazy()` + `Suspense` |
| Axios interceptor queue | `api.js` | Tự động refresh token + queue request khi 401 |
| Vietnamese JSDoc | Tất cả service files | Comment tiếng Việt chi tiết cho dễ bảo trì |

---

## 9. GIAO DIỆN NGƯỜI DÙNG

### 9.1. Thiết kế chung
- **Layout**: Sidebar (điều hướng) + Header (user info, dark mode) + Content area
- **Theme**: Hỗ trợ Dark mode và Light mode, lưu trữ qua ThemeContext
- **Responsive**: Sidebar co lại trên màn hình nhỏ, mobile-friendly
- **Branding**: Logo "QLHT" trên sidebar

### 9.2. Trang thống kê Giáo viên
- **Lớp chủ nhiệm**: 6 thẻ thống kê (Sĩ số, Giỏi, Khá, Trung bình, Yếu, Chưa xét)
- **Biểu đồ tròn**: Phân bố xếp loại
- **Biểu đồ cột**: Điểm trung bình theo môn (nhãn nghiêng 35°)
- **Lớp giảng dạy**: Biểu đồ cột ĐTB theo lớp

### 9.3. Dashboard
- Hiển thị số lượng chức năng theo vai trò (Admin: 7, Teacher: 5)
- Quick-action cards cho mỗi chức năng
- Chào mừng với tên đầy đủ của người dùng

---

## 10. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY

### 10.1. Yêu cầu hệ thống
- **Java**: JDK 22+
- **Node.js**: v18+
- **MySQL**: 8.0+
- **Gradle**: 9.0 (đi kèm gradlew)

### 10.2. Cấu hình cơ sở dữ liệu
1. Tạo database và bảng bằng file `database.sql`:
   ```sql
   SOURCE database.sql;
   ```
2. (Tùy chọn) Nạp dữ liệu mẫu:
   ```sql
   SOURCE seed_data.sql;
   ```
3. Cập nhật `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/sms
   spring.datasource.username=root
   spring.datasource.password=123456
   ```

### 10.3. Chạy ứng dụng
```bash
# Cách 1: Dùng start.bat (Windows)
start.bat

# Cách 2: Thủ công
cd frontend
npm install
npx vite build
cd ..
gradlew.bat bootRun
```

### 10.4. Truy cập
- **Ứng dụng**: http://localhost:8080
- **API**: http://localhost:8080/api/...

---

## 11. CẤU HÌNH JWT

Trong file `application.properties`:
```properties
# Khóa bí mật ký JWT (tối thiểu 64 ký tự cho HS512)
jwt.signerKey="your-secret-key-here"

# Thời hạn access token (phút), mặc định: 60
jwt.access-token-expiration-ms=60

# Thời hạn refresh token (ngày), mặc định: 7
jwt.refresh-token-expiration-ms=7
```

---

## 12. TỔNG KẾT

### 12.1. Thống kê mã nguồn

| Thành phần | Số lượng |
|---|---|
| **Entity (bảng DB)** | 10 |
| **Repository** | 9 |
| **Controller** | 5 |
| **Service** | 4 (+ 4 interface) |
| **DTO Request** | 10 |
| **DTO Response** | 9 |
| **Trang Frontend** | 19 |
| **Service Frontend** | 5 |
| **File SQL** | 2 (database.sql, seed_data.sql) |

### 12.2. Điểm nổi bật
- ✅ Phân quyền đầy đủ 3 vai trò với Spring Security
- ✅ JWT Authentication với cơ chế Refresh Token tự động (queue-based interceptor)
- ✅ Giao diện Dark/Light mode hiện đại (MUI)
- ✅ Biểu đồ thống kê trực quan (Recharts)
- ✅ Upload avatar với preview
- ✅ Kiểm tra trùng lịch khi thêm tiết học
- ✅ Hỗ trợ đăng nhập bằng mã học sinh/giáo viên
- ✅ Frontend + Backend đóng gói chung trên 1 port
- ✅ Tối ưu hiệu suất: `@Transactional(readOnly)`, `@EntityGraph`, `@Valid`
- ✅ Tên cột DB tiếng Việt dễ hiểu (bảng `grades`)
- ✅ Constants centralization (`constants.js`) — không hardcode string
- ✅ Comment/JSDoc tiếng Việt toàn bộ Backend + Frontend
- ✅ Hỗ trợ tiết đặc biệt: Sinh hoạt lớp + Chào cờ (phân biệt bằng `scheduleType`)
- ✅ Batch-fill và Quick-delete TKB cho Admin
- ✅ Chỉnh sửa hồ sơ cá nhân (email, ngày sinh, giới tính) cho GV/HS

### 12.3. Hướng phát triển
- Thêm phân quyền chi tiết hơn (Permission-based)
- Xuất báo cáo PDF/Excel
- Thông báo realtime (WebSocket)
- Quản lý năm học/học kỳ
- Tích hợp email thông báo
- Unit test và Integration test
- Chuyển frontend sang React Query (TanStack Query) cho caching

---

> **Tên hệ thống**: Quản Lý Học Tập (QLHT)  
> **Ngày cập nhật**: 26/03/2026  
> **Công nghệ**: Spring Boot 3.4.3 + React + MUI + MySQL
