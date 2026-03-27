# Sơ đồ Use Case & Activity — Hệ thống QLHT

## 1. Sơ đồ Use Case tổng quan

```mermaid
graph TB
    subgraph System["🎓 Hệ thống Quản Lý Học Tập (QLHT)"]
        direction TB

        subgraph AuthUC["Xác thực"]
            UC_Login["Đăng nhập"]
            UC_Register["Đăng ký"]
            UC_ChangePW["Đổi mật khẩu"]
            UC_Avatar["Upload avatar"]
        end

        subgraph AdminUC["Quản trị"]
            UC_MngUser["Quản lý người dùng"]
            UC_MngStudent["Quản lý học sinh"]
            UC_MngTeacher["Quản lý giáo viên"]
            UC_MngClass["Quản lý lớp học"]
            UC_MngSubject["Quản lý môn học"]
            UC_MngSchedule["Quản lý TKB"]
            UC_Stats["Xem thống kê"]
        end

        subgraph TeacherUC["Giảng dạy"]
            UC_TProfile["Xem/sửa hồ sơ GV"]
            UC_Homeroom["Quản lý lớp chủ nhiệm"]
            UC_Teaching["Xem lớp giảng dạy"]
            UC_TSchedule["Xem lịch dạy"]
            UC_InputGrade["Nhập điểm"]
            UC_TStats["Xem thống kê GV"]
            UC_HRGrades["Xem điểm lớp CN"]
        end

        subgraph StudentUC["Học tập"]
            UC_SProfile["Xem/sửa hồ sơ HS"]
            UC_Grades["Xem bảng điểm"]
            UC_SSchedule["Xem thời khóa biểu"]
            UC_Dashboard["Xem tổng quan"]
        end
    end

    Admin["🔧 Admin"]
    Teacher["👩‍🏫 Giáo viên"]
    Student["👨‍🎓 Học sinh"]

    Admin --> UC_Login
    Admin --> UC_ChangePW
    Admin --> UC_Avatar
    Admin --> UC_MngUser
    Admin --> UC_MngStudent
    Admin --> UC_MngTeacher
    Admin --> UC_MngClass
    Admin --> UC_MngSubject
    Admin --> UC_MngSchedule
    Admin --> UC_Stats

    Teacher --> UC_Login
    Teacher --> UC_ChangePW
    Teacher --> UC_Avatar
    Teacher --> UC_TProfile
    Teacher --> UC_Homeroom
    Teacher --> UC_Teaching
    Teacher --> UC_TSchedule
    Teacher --> UC_InputGrade
    Teacher --> UC_TStats
    Teacher --> UC_HRGrades

    Student --> UC_Login
    Student --> UC_Register
    Student --> UC_ChangePW
    Student --> UC_Avatar
    Student --> UC_SProfile
    Student --> UC_Grades
    Student --> UC_SSchedule
    Student --> UC_Dashboard
```

---

## 2. Use Case chi tiết — Admin

```mermaid
graph LR
    Admin["🔧 Admin"]

    subgraph UC_Users["Quản lý người dùng"]
        U1["Xem DS users"]
        U2["Xem chi tiết user"]
        U3["Xóa user"]
        U4["Reset mật khẩu"]
    end

    subgraph UC_Students["Quản lý học sinh"]
        S1["Xem DS học sinh"]
        S2["Xem chi tiết HS"]
        S3["Gán HS vào lớp"]
        S4["Xóa HS khỏi lớp"]
    end

    subgraph UC_Teachers["Quản lý giáo viên"]
        T1["Xem DS giáo viên"]
        T2["Xem chi tiết GV"]
        T3["Phân công môn cho GV"]
    end

    subgraph UC_Classes["Quản lý lớp học"]
        C1["Xem DS lớp"]
        C2["Tạo lớp mới"]
        C3["Sửa thông tin lớp"]
        C4["Xóa lớp"]
        C5["Gán GVCN"]
        C6["Xóa GVCN"]
        C7["Gán GV bộ môn"]
        C8["Xóa GV bộ môn"]
    end

    subgraph UC_Subjects["Quản lý môn học"]
        Sub1["Xem DS môn"]
        Sub2["Tạo môn mới"]
        Sub3["Sửa môn"]
        Sub4["Xóa môn"]
    end

    subgraph UC_Schedules["Quản lý TKB"]
        Sch1["Xem TKB"]
        Sch2["Tạo tiết học"]
        Sch3["Sửa tiết"]
        Sch4["Xóa tiết"]
    end

    Admin --> UC_Users
    Admin --> UC_Students
    Admin --> UC_Teachers
    Admin --> UC_Classes
    Admin --> UC_Subjects
    Admin --> UC_Schedules
```

## 3. Use Case chi tiết — Giáo viên

```mermaid
graph LR
    Teacher["👩‍🏫 Giáo viên"]

    subgraph UC_Profile["Hồ sơ"]
        P1["Xem hồ sơ cá nhân"]
        P2["Cập nhật hồ sơ"]
        P3["Đổi mật khẩu"]
        P4["Upload avatar"]
    end

    subgraph UC_Class["Lớp học"]
        CL1["Xem DS lớp dạy"]
        CL2["Xem DS HS trong lớp"]
        CL3["Xem lớp chủ nhiệm"]
    end

    subgraph UC_Grade["Điểm"]
        G1["Nhập điểm cho lớp"]
        G2["Xem điểm đã nhập"]
        G3["Cập nhật điểm"]
        G4["Xem điểm lớp CN"]
    end

    subgraph UC_Schedule["Lịch dạy"]
        S1["Xem lịch dạy tuần"]
        S2["Xem tiết hôm nay"]
    end

    subgraph UC_Stat["Thống kê"]
        ST1["Thống kê điểm theo lớp"]
        ST2["Phân bổ xếp loại"]
    end

    Teacher --> UC_Profile
    Teacher --> UC_Class
    Teacher --> UC_Grade
    Teacher --> UC_Schedule
    Teacher --> UC_Stat
```

## 4. Use Case chi tiết — Học sinh

```mermaid
graph LR
    Student["👨‍🎓 Học sinh"]

    subgraph UC_Profile["Hồ sơ"]
        P1["Xem hồ sơ cá nhân"]
        P2["Cập nhật hồ sơ"]
        P3["Đổi mật khẩu"]
        P4["Upload avatar"]
    end

    subgraph UC_Academic["Học tập"]
        A1["Xem tổng quan (Dashboard)"]
        A2["Xem bảng điểm chi tiết"]
        A3["Xem ĐTB tổng"]
        A4["Xem xếp loại"]
    end

    subgraph UC_Schedule["Thời khóa biểu"]
        S1["Xem TKB cả tuần"]
        S2["Xem lịch hôm nay"]
    end

    Student --> UC_Profile
    Student --> UC_Academic
    Student --> UC_Schedule
```

---

## 5. Sơ đồ Activity — Đăng nhập & Đăng ký

```mermaid
flowchart TD
    Start(("Bắt đầu")) --> OpenApp["Mở ứng dụng"]
    OpenApp --> CheckToken{"Có token trong\nLocalStorage?"}

    CheckToken -->|Có| ValidateToken{"Token\ncòn hạn?"}
    ValidateToken -->|Có| Dashboard["→ Dashboard"]
    ValidateToken -->|Không| TryRefresh["Gọi refresh-token"]
    TryRefresh --> RefreshOK{"Refresh\nthành công?"}
    RefreshOK -->|Có| SaveNewToken["Lưu token mới"] --> Dashboard
    RefreshOK -->|Không| ClearStorage["Xóa localStorage"] --> LoginPage

    CheckToken -->|Không| LoginPage["Hiện trang Đăng nhập"]

    LoginPage --> HasAccount{"Có tài khoản?"}
    HasAccount -->|Có| EnterCredentials["Nhập username + password"]
    HasAccount -->|Không| RegisterPage["→ Trang Đăng ký"]

    RegisterPage --> EnterRegInfo["Nhập thông tin đăng ký"]
    EnterRegInfo --> SubmitReg["POST /register"]
    SubmitReg --> RegSuccess{"Đăng ký\nthành công?"}
    RegSuccess -->|Không| ShowRegError["Hiện lỗi"] --> EnterRegInfo
    RegSuccess -->|Có| LoginPage

    EnterCredentials --> SubmitLogin["POST /login"]
    SubmitLogin --> LoginSuccess{"Đăng nhập\nthành công?"}
    LoginSuccess -->|Không| ShowLoginError["Hiện lỗi (sai MK / không tồn tại)"] --> EnterCredentials
    LoginSuccess -->|Có| SaveAuth["Lưu token + refreshToken + user\nvào localStorage"]
    SaveAuth --> CheckRole{"Kiểm tra\nvai trò?"}

    CheckRole -->|ADMIN| AdminDash["Dashboard Admin"]
    CheckRole -->|TEACHER| TeacherDash["Dashboard Giáo viên"]
    CheckRole -->|STUDENT| StudentDash["Dashboard Học sinh"]

    AdminDash --> End(("Kết thúc"))
    TeacherDash --> End
    StudentDash --> End
    Dashboard --> End
```

---

## 6. Sơ đồ Activity — Giáo viên nhập điểm

```mermaid
flowchart TD
    Start(("Bắt đầu")) --> OpenTeaching["Mở trang 'Lớp dạy học'"]
    OpenTeaching --> LoadClasses["GET /teacher/classrooms\nTải DS lớp"]
    LoadClasses --> SelectClass["Chọn lớp cần nhập điểm"]
    SelectClass --> LoadStudents["GET /teacher/class/{id}/students\nTải DS học sinh"]
    LoadStudents --> LoadExisting["GET /teacher/class/{id}/grades\nTải điểm hiện tại"]

    LoadExisting --> DisplayForm["Hiển thị form nhập điểm\n(TX1, TX2, Giữa kỳ, Cuối kỳ)"]
    DisplayForm --> InputScores["GV nhập/sửa điểm\ncho từng học sinh"]

    InputScores --> Validate{"Điểm hợp lệ?\n(0 - 10)"}
    Validate -->|Không| ShowError["Hiện lỗi validation"] --> InputScores
    Validate -->|Có| ClickSave["Bấm Lưu điểm"]

    ClickSave --> SendAPI["POST /teacher/grades?classId=...\nGửi batch điểm"]
    SendAPI --> CheckAuth{"Token\nhợp lệ?"}

    CheckAuth -->|Không| AutoRefresh["Auto refresh token"] --> SendAPI
    CheckAuth -->|Có| CheckPermission{"GV có quyền\ndạy lớp này?"}

    CheckPermission -->|Không| PermError["Trả về lỗi 403\n'Không có quyền'"]
    PermError --> End1(("Kết thúc"))

    CheckPermission -->|Có| ProcessGrades["Xử lý từng học sinh"]

    ProcessGrades --> CheckExist{"Đã có điểm\ncho HS + Môn?"}
    CheckExist -->|Có| UpdateGrade["UPDATE grade"]
    CheckExist -->|Không| InsertGrade["INSERT grade mới"]

    UpdateGrade --> NextStudent{"Còn HS\ntiếp theo?"}
    InsertGrade --> NextStudent

    NextStudent -->|Có| ProcessGrades
    NextStudent -->|Không| Success["Trả về 'Nhập điểm thành công'"]

    Success --> ShowNotify["Hiện thông báo thành công\nReload bảng điểm"]
    ShowNotify --> End2(("Kết thúc"))
```

---

## 7. Sơ đồ Activity — Admin quản lý lớp học

```mermaid
flowchart TD
    Start(("Bắt đầu")) --> OpenPage["Mở trang 'Quản lý lớp học'"]
    OpenPage --> LoadData["GET /admin/classrooms\nGET /admin/teachers\nGET /admin/subjects"]
    LoadData --> DisplayList["Hiển thị DS lớp"]

    DisplayList --> Action{"Chọn hành động?"}

    Action -->|"Tạo mới"| OpenCreate["Mở dialog tạo lớp"]
    OpenCreate --> InputClassInfo["Nhập: tên lớp, sĩ số tối đa"]
    InputClassInfo --> SubmitCreate["POST /admin/classrooms"]
    SubmitCreate --> CreateOK{"Thành công?"}
    CreateOK -->|Có| RefreshList["Reload DS lớp"] --> DisplayList
    CreateOK -->|Không| ShowCreateErr["Hiện lỗi"] --> OpenCreate

    Action -->|"Sửa"| OpenEdit["Mở dialog sửa lớp"]
    OpenEdit --> EditInfo["Sửa thông tin"]
    EditInfo --> SubmitEdit["PUT /admin/classrooms/{id}"]
    SubmitEdit --> RefreshList

    Action -->|"Xóa"| ConfirmDel{"Xác nhận\nxóa lớp?"}
    ConfirmDel -->|Không| DisplayList
    ConfirmDel -->|Có| DeleteClass["DELETE /admin/classrooms/{id}"]
    DeleteClass --> RefreshList

    Action -->|"Gán GVCN"| SelectTeacher["Chọn GV từ dropdown"]
    SelectTeacher --> AssignHR["PUT /classrooms/{classId}/homeroom/{teacherId}"]
    AssignHR --> RefreshList

    Action -->|"Gán GV bộ môn"| SelectSubjectTeacher["Chọn Môn + GV"]
    SelectSubjectTeacher --> AssignST["PUT /classrooms/{classId}/subject/{subId}/teacher/{tId}"]
    AssignST --> RefreshList

    Action -->|"Gán HS"| GotoStudent["→ Trang Quản lý HS"]
```

---

## 8. Sơ đồ Activity — Học sinh xem bảng điểm

```mermaid
flowchart TD
    Start(("Bắt đầu")) --> Navigate["Bấm menu 'Bảng điểm'"]
    Navigate --> CheckAuth{"Đã đăng nhập?"}

    CheckAuth -->|Không| Redirect["→ Trang Đăng nhập"]
    CheckAuth -->|Có| LoadGrades["GET /students/grades\n(gửi JWT token)"]

    LoadGrades --> HasData{"Có dữ liệu\nđiểm?"}

    HasData -->|Không| ShowEmpty["Hiện 'Chưa có điểm nào'\nvới icon trống"]
    ShowEmpty --> End1(("Kết thúc"))

    HasData -->|Có| CalcStats["Tính toán thống kê:\n• ĐTB tổng\n• Số môn giỏi\n• Số môn khá\n• Điểm cao nhất"]

    CalcStats --> RenderCards["Hiển thị 4 Summary Cards:\nĐiểm TB | Môn Giỏi | Môn Khá | Cao nhất"]

    RenderCards --> RenderTable["Hiển thị bảng chi tiết:\nMôn | TX1 | TX2 | GK | CK | TB | Xếp loại"]

    RenderTable --> ColorCode["Tô màu theo điểm:\n🟢 ≥8 Giỏi  🔵 ≥6.5 Khá\n🟡 ≥5 TB  🔴 <5 Yếu"]

    ColorCode --> RenderFooter["Hiển thị footer:\nTổng ĐTB + Xếp loại tổng"]

    RenderFooter --> End2(("Kết thúc"))
```

---

## 9. Sơ đồ Activity — Quản lý thời khóa biểu

```mermaid
flowchart TD
    Start(("Bắt đầu")) --> OpenPage["Mở trang 'Thời khóa biểu'"]
    OpenPage --> LoadAll["GET /admin/classrooms\nGET /admin/subjects\nGET /admin/teachers\nGET /admin/schedules"]
    LoadAll --> SelectClass["Chọn lớp từ dropdown"]
    SelectClass --> FilterSchedule["Lọc TKB theo lớp"]

    FilterSchedule --> DisplayGrid["Hiển thị lưới TKB\n(Thứ 2→7 × Tiết 1→5)"]

    DisplayGrid --> Action{"Chọn hành động?"}

    Action -->|"Bấm ô trống"| OpenDialog["Mở dialog thêm tiết"]
    OpenDialog --> SelectType{"Loại tiết?"}
    SelectType -->|"Môn học"| SelectSubject["Chọn Môn + GV"]
    SelectType -->|"Chào cờ"| SetCeremony["scheduleType = CEREMONY"]
    SelectType -->|"Sinh hoạt"| SetHomeroom["scheduleType = HOMEROOM"]

    SelectSubject --> SubmitSchedule["POST /admin/schedules"]
    SetCeremony --> SubmitSchedule
    SetHomeroom --> SubmitSchedule

    SubmitSchedule --> CheckConflict{"Trùng lịch?"}
    CheckConflict -->|Có| ShowConflict["Hiện lỗi trùng lịch"] --> OpenDialog
    CheckConflict -->|Không| Reload["Reload TKB"] --> DisplayGrid

    Action -->|"Bấm ô có tiết"| EditOrDelete{"Sửa hay Xóa?"}
    EditOrDelete -->|"Sửa"| EditDialog["Mở dialog sửa\nPUT /admin/schedules/{id}"] --> Reload
    EditOrDelete -->|"Xóa"| ConfirmDel{"Xác nhận xóa?"}
    ConfirmDel -->|Có| DeleteSchedule["DELETE /admin/schedules/{id}"] --> Reload
    ConfirmDel -->|Không| DisplayGrid

    Action -->|"Batch thêm"| BatchMode["Chọn môn → tick nhiều ô\n→ Tạo hàng loạt"] --> Reload
```
