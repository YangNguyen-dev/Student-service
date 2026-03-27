# Sơ đồ Luồng Hoạt Động: User → Frontend → Backend → DB

## 1. Tổng quan kiến trúc hệ thống

```mermaid
graph LR
    subgraph USER["👤 User (Browser)"]
        U[Người dùng]
    end

    subgraph FRONTEND["⚛️ Frontend - React + Vite"]
        direction TB
        Pages["Pages (19 trang)"]
        Context["Context (Auth + Theme)"]
        Services["Services (API Layer)"]
        Axios["Axios Interceptors"]
    end

    subgraph BACKEND["☕ Backend - Spring Boot"]
        direction TB
        Security["Security Filter (JWT)"]
        Controllers["Controllers (5)"]
        ServiceLayer["Services (3 + Auth)"]
        Mapper["UserMapper (DTO)"]
        Repos["Repositories (10 JPA)"]
    end

    subgraph DB["🗄️ Database - MySQL"]
        Tables["11 Tables"]
    end

    U -->|"Tương tác UI"| Pages
    Pages -->|"Gọi hàm"| Services
    Services -->|"HTTP + JWT"| Axios
    Axios -->|"REST API /api/*"| Security
    Security -->|"Xác thực"| Controllers
    Controllers -->|"Gọi logic"| ServiceLayer
    ServiceLayer -->|"Entity ↔ DTO"| Mapper
    ServiceLayer -->|"CRUD"| Repos
    Repos -->|"JPA/Hibernate"| Tables
    Tables -->|"Kết quả"| Repos
    Repos -->|"Entity"| ServiceLayer
    Controllers -->|"JSON Response"| Axios
    Axios -->|"Cập nhật State"| Pages
```

---

## 2. Luồng xác thực (Login Flow)

```mermaid
sequenceDiagram
    actor User as 👤 User
    participant LP as LoginPage.jsx
    participant Auth as AuthContext
    participant Svc as authService.js
    participant Ax as Axios (api.js)
    participant Ctrl as AuthController
    participant AS as AuthService
    participant DB as 🗄️ Database

    User->>LP: Nhập username + password
    LP->>Auth: login(username, password)
    Auth->>Svc: authService.login()
    Svc->>Ax: POST /api/login
    Ax->>Ctrl: LoginRequest
    Ctrl->>AS: service.login(request)
    AS->>DB: userRepo.findByUsername()
    DB-->>AS: User entity
    AS->>AS: Verify password (BCrypt)
    AS->>AS: Generate JWT + Refresh Token
    AS->>DB: Save RefreshToken
    AS-->>Ctrl: AuthResponse
    Ctrl-->>Ax: ApiResponse (token, refreshToken, user)
    Ax-->>Svc: response.data
    Svc-->>Auth: result
    Auth->>Auth: localStorage.setItem(token, user)
    Auth->>Auth: setUser() + setToken()
    Auth-->>LP: userData
    LP->>LP: navigate("/dashboard")
```

---

## 3. Luồng tự động làm mới Token (Auto Refresh)

```mermaid
sequenceDiagram
    actor User as 👤 User
    participant Page as Trang bất kỳ
    participant Ax as Axios Interceptors
    participant Ctrl as AuthController
    participant AS as AuthService
    participant DB as 🗄️ Database

    User->>Page: Thao tác (token hết hạn)
    Page->>Ax: GET /api/some-endpoint
    Ax->>Ax: Gắn Bearer Token
    Ax-->>Ax: Nhận 401 Unauthorized
    
    rect rgb(255, 240, 220)
        Note over Ax: Interceptor xử lý tự động
        Ax->>Ax: isRefreshing = true
        Ax->>Ctrl: POST /api/refresh-token
        Ctrl->>AS: refreshToken(token)
        AS->>DB: Tìm RefreshToken
        DB-->>AS: Token entity
        AS->>AS: Tạo JWT mới + Refresh mới
        AS->>DB: Cập nhật RefreshToken
        AS-->>Ctrl: AuthResponse mới
        Ctrl-->>Ax: Token mới
        Ax->>Ax: localStorage cập nhật
        Ax->>Ax: processQueue() - retry các request đang chờ
    end
    
    Ax->>Page: Kết quả request gốc (thành công)
```

---

## 4. Luồng theo vai trò (Role-based Flow)

### 4.1 Học sinh — Xem bảng điểm

```mermaid
sequenceDiagram
    actor HS as 👨‍🎓 Học sinh
    participant SG as StudentGrades.jsx
    participant Svc as studentService.js
    participant Ax as Axios + JWT
    participant Ctrl as StudentController
    participant SS as StudentService
    participant Repo as GradeRepository
    participant DB as 🗄️ Database

    HS->>SG: Mở trang "Bảng điểm"
    SG->>Svc: studentService.getGrades()
    Svc->>Ax: GET /api/students/grades
    Ax->>Ax: Gắn Authorization header
    Ax->>Ctrl: Request + JWT
    Ctrl->>Ctrl: getUserId(authentication)
    Ctrl->>SS: getGrades(userId)
    SS->>SS: getStudent(userId)
    SS->>Repo: findByStudent_Id(studentId)
    Repo->>DB: SELECT * FROM grades WHERE student_id = ?
    DB-->>Repo: List Grade entities
    Repo-->>SS: List Grade
    SS-->>Ctrl: List Grade
    Ctrl->>Ctrl: userMapper::toGradeResponse
    Ctrl-->>Ax: List GradeResponse (JSON)
    Ax-->>SG: grades[]
    SG->>SG: Tính ĐTB, xếp loại, render bảng
```

### 4.2 Giáo viên — Nhập điểm

```mermaid
sequenceDiagram
    actor GV as 👩‍🏫 Giáo viên
    participant TT as TeacherTeaching.jsx
    participant Svc as teacherService.js
    participant Ax as Axios + JWT
    participant Ctrl as TeacherController
    participant TS as TeacherService
    participant GR as GradeRepository
    participant DB as 🗄️ Database

    GV->>TT: Nhập điểm cho lớp 10A1
    TT->>Svc: teacherService.inputGrades(classId, grades[])
    Svc->>Ax: POST /api/teacher/grades?classId=1
    Ax->>Ctrl: List EnterGradeRequest
    Ctrl->>Ctrl: userMapper::toGrade (DTO → Entity)
    Ctrl->>TS: inputGrades(userId, classId, grades)
    TS->>TS: checkTeachingClass() - Kiểm tra quyền
    
    loop Mỗi học sinh
        TS->>GR: findByStudent_IdAndSubject(...)
        GR->>DB: SELECT grade
        DB-->>GR: Existing grade (nếu có)
        TS->>GR: save(grade) - Tạo mới hoặc cập nhật
        GR->>DB: INSERT/UPDATE grades
    end
    
    TS-->>Ctrl: Thành công
    Ctrl-->>Ax: "Nhập điểm thành công"
    Ax-->>TT: Hiển thị thông báo
```

### 4.3 Admin — Quản lý lớp học

```mermaid
sequenceDiagram
    actor AD as 🔧 Admin
    participant CM as ClassroomManagement.jsx
    participant Svc as adminService.js
    participant Ax as Axios + JWT
    participant Ctrl as AdminController
    participant AS as AdminService
    participant Repo as ClassroomRepository
    participant DB as 🗄️ Database

    AD->>CM: Tạo lớp "10A3"
    CM->>Svc: adminService.createClassroom(data)
    Svc->>Ax: POST /api/admin/classrooms
    Ax->>Ctrl: ClassroomRequest
    Ctrl->>AS: createClassroom(request)
    AS->>Repo: save(classroom)
    Repo->>DB: INSERT INTO classrooms(...)
    DB-->>Repo: Classroom entity
    AS-->>Ctrl: Classroom
    Ctrl->>Ctrl: userMapper::toClassroomResponse
    Ctrl-->>Ax: ClassroomResponse (JSON)
    Ax-->>CM: Cập nhật danh sách

    AD->>CM: Gán GVCN cho 10A3
    CM->>Svc: adminService.setHomeroomTeacher(classId, teacherId)
    Svc->>Ax: PUT /api/admin/classrooms/3/homeroom/1
    Ax->>Ctrl: Request
    Ctrl->>AS: setHomeroomTeacher(3, 1)
    AS->>Repo: findById(3)
    AS->>AS: classroom.setHomeroomTeacher(teacher)
    AS->>Repo: save(classroom)
    Repo->>DB: UPDATE classrooms SET homeroom_teacher_id = 1
    AS-->>Ctrl: Thành công
    Ctrl-->>Ax: "Gán GVCN thành công"
```

---

## 5. Kiến trúc tầng chi tiết

```mermaid
graph TB
    subgraph FE["⚛️ FRONTEND (React 18 + Vite)"]
        direction TB
        subgraph Pages["Pages Layer"]
            LP["LoginPage"]
            DP["DashboardPage"]
            Admin["Admin Pages (7)"]
            Student["Student Pages (3)"]
            Teacher["Teacher Pages (5)"]
        end
        subgraph Components["Components"]
            ML["MainLayout"]
        end
        subgraph Ctx["State Management"]
            AC["AuthContext"]
            TC["ThemeContext"]
        end
        subgraph Svcs["Service Layer"]
            AuthS["authService"]
            AdminS["adminService"]
            StudentS["studentService"]
            TeacherS["teacherService"]
        end
        subgraph HTTP["HTTP Layer"]
            API["api.js (Axios)"]
            INT["Request Interceptor (JWT)"]
            RES["Response Interceptor (Auto Refresh)"]
        end
    end

    subgraph BE["☕ BACKEND (Spring Boot 3)"]
        direction TB
        subgraph Security["Security Layer"]
            SF["SecurityConfig"]
            JF["JwtAuthFilter"]
            JP["JwtProperties"]
        end
        subgraph Ctrls["Controller Layer"]
            AuC["AuthenticationController"]
            AdC["AdminController"]
            TC2["TeacherController"]
            SC["StudentController"]
            AvC["AvatarController"]
        end
        subgraph SvcLayer["Service Layer"]
            AuS["AuthenticationService"]
            AdS["AdminService"]
            TS["TeacherService"]
            SS["StudentService"]
        end
        subgraph MapperLayer["Mapper"]
            UM["UserMapper (MapStruct)"]
        end
        subgraph RepoLayer["Repository Layer (Spring Data JPA)"]
            UR["UserRepository"]
            SR["StudentRepository"]
            TR["TeacherRepository"]
            CR["ClassroomRepository"]
            GR["GradeRepository"]
            SubR["SubjectRepository"]
            SchR["ScheduleRepository"]
            RR["RoleRepository"]
            RTR["RefreshTokenRepository"]
            CSTR["ClassSubjectTeacherRepository"]
        end
    end

    subgraph Database["🗄️ MySQL Database"]
        subgraph Tables["Entity Tables"]
            users["users"]
            students["students"]
            teachers["teachers"]
            classrooms["classrooms"]
            subjects["subjects"]
            grades["grades"]
            schedules["schedules"]
            roles["roles"]
            user_roles["user_roles"]
            class_subject_teacher["class_subject_teacher"]
            refresh_tokens["refresh_tokens"]
        end
    end

    Pages --> Svcs
    Svcs --> HTTP
    HTTP -->|"REST API"| Security
    Security --> Ctrls
    Ctrls --> SvcLayer
    SvcLayer --> MapperLayer
    SvcLayer --> RepoLayer
    RepoLayer -->|"JPA/Hibernate"| Database
```

---

## 6. Bảng tóm tắt API Endpoints

| Controller | Method | Endpoint | Mô tả |
|---|---|---|---|
| **Auth** | POST | `/login` | Đăng nhập |
| | POST | `/register` | Đăng ký |
| | POST | `/refresh-token` | Làm mới token |
| | PUT | `/change-password` | Đổi mật khẩu |
| **Student** | GET | `/students/profile` | Xem hồ sơ |
| | PUT | `/students/profile` | Cập nhật hồ sơ |
| | GET | `/students/grades` | Xem bảng điểm |
| | GET | `/students/schedule` | Xem TKB |
| **Teacher** | GET | `/teacher/profile` | Xem hồ sơ |
| | GET | `/teacher/classrooms` | DS lớp dạy |
| | GET | `/teacher/schedule` | Lịch dạy |
| | POST | `/teacher/grades` | Nhập điểm |
| | GET | `/teacher/homeroom/grades` | Điểm lớp CN |
| **Admin** | GET/DELETE | `/admin/users` | Quản lý users |
| | GET/PUT/DELETE | `/admin/students` | Quản lý HS |
| | GET/PUT | `/admin/teachers` | Quản lý GV |
| | CRUD | `/admin/classrooms` | Quản lý lớp |
| | CRUD | `/admin/subjects` | Quản lý môn |
| | CRUD | `/admin/schedules` | Quản lý TKB |

---

## 7. Luồng dữ liệu tổng quát (Data Flow)

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        UI["UI Component"]
        Form["Form Data"]
    end

    subgraph Transform1["🔄 Frontend Transform"]
        SVC["Service Function"]
        AX["Axios (+ JWT header)"]
    end

    subgraph Network["🌐 Network"]
        REQ["HTTP Request"]
        RES["HTTP Response"]
    end

    subgraph Transform2["🔄 Backend Transform"]
        CTRL["Controller"]
        DTO_IN["Request DTO"]
        SVC2["Service Logic"]
        ENTITY["Entity"]
        DTO_OUT["Response DTO"]
    end

    subgraph Storage["💾 Storage"]
        REPO["JPA Repository"]
        DB["MySQL"]
    end

    UI -->|"event"| Form
    Form -->|"data"| SVC
    SVC -->|"axios call"| AX
    AX -->|"JSON + Bearer"| REQ
    REQ --> CTRL
    CTRL -->|"deserialize"| DTO_IN
    DTO_IN -->|"mapper"| ENTITY
    ENTITY --> SVC2
    SVC2 --> REPO
    REPO -->|"SQL"| DB
    DB -->|"result"| REPO
    REPO -->|"Entity"| SVC2
    SVC2 -->|"mapper"| DTO_OUT
    DTO_OUT --> CTRL
    CTRL -->|"serialize"| RES
    RES --> AX
    AX -->|"response.data"| UI
```
