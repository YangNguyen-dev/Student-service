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

### 4.2. Danh sách bảng

| STT | Bảng | Mô tả |
|-----|------|--------|
| 1 | `users` | Thông tin đăng nhập, hồ sơ cá nhân, avatar |
| 2 | `roles` | Vai trò (ADMIN, TEACHER, STUDENT) |
| 3 | `user_roles` | Liên kết users ↔ roles (nhiều-nhiều) |
| 4 | `students` | Thông tin riêng của học sinh (mã HS, lớp) |
| 5 | `teachers` | Thông tin riêng của giáo viên (mã GV, môn) |
| 6 | `classrooms` | Lớp học (tên, GVCN, sĩ số tối đa) |
| 7 | `subjects` | Môn học (tên, mô tả) |
| 8 | `class_subjects` | Phân công GV dạy môn nào ở lớp nào |
| 9 | `schedules` | Thời khóa biểu (ngày, tiết, lớp, môn, GV, loại tiết) |
| 10 | `grades` | Điểm số (miệng, 15 phút, giữa kỳ, cuối kỳ) |

### 4.4. Bảng schedules — Cột `schedule_type`

| Giá trị | Mô tả |
|---------|--------|
| `NULL` | Tiết học bình thường (có môn học) |
| `HOMEROOM` | Tiết Sinh hoạt lớp (GVCN, không có môn) |
| `CEREMONY` | Tiết Chào cờ (GVCN, không có môn) |

### 4.3. Chi tiết bảng điểm (grades)

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| `ma_diem` | BIGINT (PK) | Mã điểm (tự tăng) |
| `diem_mieng` | DOUBLE | Điểm miệng (hệ số 1) |
| `diem_15_phut` | DOUBLE | Điểm 15 phút (hệ số 1) |
| `diem_giua_ky` | DOUBLE | Điểm giữa kỳ (hệ số 3) |
| `diem_cuoi_ky` | DOUBLE | Điểm cuối kỳ (hệ số 5) |
| `student_id` | BIGINT (FK) | Học sinh |
| `subject_id` | BIGINT (FK) | Môn học |
| `teacher_id` | BIGINT (FK) | Giáo viên nhập điểm |

**Công thức tính ĐTB**: `Miệng×0.1 + 15Phút×0.1 + GiữaKỳ×0.3 + CuốiKỳ×0.5` (tính ở tầng Mapper, không lưu DB)

### 4.5. File SQL đi kèm
| File | Mô tả |
|------|--------|
| `database.sql` | Tạo toàn bộ cấu trúc DB (10 bảng + FK + comment) |
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
