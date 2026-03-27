# BÁO CÁO ĐỒ ÁN MÔN HỌC / THỰC TẬP TỐT NGHIỆP
**ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ HỌC TẬP (QLHT)**

---

## CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN

### 1.1. Khảo sát bài toán và tính cấp thiết của đề tài
Trong thời đại số hóa, việc quản lý học tập tại các trường phổ thông không thể chỉ dựa vào sổ sách thủ công. Hệ thống Quản Lý Học Tập (LMS - Learning Management System) ra đời nhằm mục đích tự động hóa các hoạt động quản lý, vận hành của nhà trường. 
Hệ thống QLHT được thiết kế tập trung phục vụ 3 nhóm đối tượng chính, mỗi nhóm có một không gian làm việc (workspace) và quyền hạn (roles) chuyên biệt:
*   **Quản trị viên (Admin):** Có toàn quyền kiểm soát hệ thống, quản lý nhân sự (Giáo viên, Học sinh), lớp học, môn học, phân công giảng dạy, và thời khóa biểu toàn trường.
*   **Giáo viên (Teacher):** Được phân quyền để quản lý lớp chủ nhiệm, theo dõi lịch dạy cá nhân, thống kê học lực, và đặc biệt là tính năng nhập bảng điểm cho nhiều học sinh cùng lúc (Batch Mode).
*   **Học sinh (Student):** Có thể tra cứu điểm số chi tiết của bản thân, theo dõi thời khóa biểu và cập nhật hồ sơ cá nhân.

### 1.2. Cơ sở lý thuyết về Công nghệ sử dụng
Dự án được xây dựng theo mô hình **Client-Server** hiện đại, phân tách hoàn toàn giao diện (Frontend) và máy chủ xử lý dữ liệu (Backend) thông qua chuẩn giao tiếp RESTful API.

#### 1.2.1. Nền tảng Backend (Máy chủ API)
*   **Java 22 & Spring Boot 3.4.3:** Bộ đôi công nghệ chuẩn doanh nghiệp (Enterprise). Spring Boot cung cấp cơ chế Dependency Injection (DI) và Inversion of Control (IoC), giúp quản lý các module lỏng lẻo (loose coupling) và dễ dàng bảo trì.
*   **Spring Data JPA & Hibernate:** Là công nghệ ORM (Object-Relational Mapping). Thay vì viết các câu lệnh SQL truyền thống, JPA ánh xạ trực tiếp các đối tượng Java (Entity) xuống các bảng trong CSDL, bao bọc dữ liệu an toàn và chống lại các rủi ro SQL Injection.
*   **MapStruct & Lombok:** Các thư viện bổ trợ giúp tự động hóa quá trình sinh mã (getter, setter, constructor) và tự động ánh xạ (mapping) từ thực thể CSDL (Entity) sang các đối tượng trung chuyển (DTO - Data Transfer Object), đảm bảo thông tin nhạy cảm ở DB không bị rò rỉ trực tiếp ra API.
*   **MySQL 8.0:** Hệ quản trị CSDL quan hệ dùng để tổ chức lưu trữ thông tin có cấu trúc chặt chẽ (tài khoản, điểm số, thời khóa biểu).

#### 1.2.2. Nền tảng Frontend (Giao diện người dùng)
*   **ReactJS & Vite:** React áp dụng kỹ thuật Virtual DOM giúp tối ưu hóa việc vẽ lại giao diện (rendering). Kết hợp cùng Vite – công cụ build tool thế hệ mới – cho phép khởi động dự án và hot-reload tính bằng mili-giây. Tất cả tạo thành một Single Page Application (SPA) mượt mà không cần tải lại trang.
*   **Material UI (MUI):** Thư viện các Component theo chuẩn Material Design của Google. Cung cấp sẵn hệ thống lưới (Grid), bảng (Table), Form và hỗ trợ native cho thiết kế Dark/Light Mode.
*   **Axios & React Router:** Axios dùng để cấu hình các luồng gửi/nhận HTTP Request có đính kèm chứng chỉ xác thực. React Router giúp điều hướng các trang ảo trên SPA.
*   **Recharts:** Thư viện mạnh mẽ dùng để trực quan hóa dữ liệu thống kê (Data Visualization) qua các biểu đồ trục và biểu đồ tròn.

#### 1.2.3. Cơ sở lý thuyết về JWT (JSON Web Token)
Để bảo mật hệ thống API không trạng thái (Stateless), dự án áp dụng chuẩn JWT, bao gồm 2 loại token:
*   **Access Token:** Dùng để chứng minh quyền truy cập mỗi khi gọi API. Sống ngắn (60 phút) để giới hạn rủi ro nếu bị đánh cắp.
*   **Refresh Token:** Dùng để "đổi lấy" Access Token mới khi cái cũ hết hạn. Sống dài (7 ngày), giúp người dùng duy trì trạng thái đăng nhập liên tục mà không cần nhập lại mật khẩu. Token được ký bằng thuật toán bảo mật cao HMAC-SHA512 (HS512).

---

## CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 2.1. Sơ đồ kiến trúc tổng quan
Kiến trúc hệ thống được chia làm 3 lớp chính bảo mật độc lập:

```text
[ TẦNG CLIENT ] 
ReactJS (Views / Components / Hooks) 
      │ 
      │ Sử dụng Axios gọi REST API (Đính kèm Bearer Token)
      ▼ 
[ TẦNG SERVER - SPRING BOOT 8080 ]
  1. Security Filter Chain (Kiểm tra token, phân giải Role: Admin/Teacher/Student)
  2. Controller (Nhận Request, Validate bằng @Valid, gỡ gói DTO)
  3. Service (Xử lý nghiệp vụ lõi: tính điểm, check trùng lịch)
  4. Repository (Spring Data JPA - Tương tác Database)
      │
      ▼
[ TẦNG DATABASE ] 
MySQL (Schema: sms)
```

### 2.2. Thiết kế Cơ sở dữ liệu (Database Design)
CSDL được chuẩn hóa và thiết kế thành 10 bảng quan hệ khăng khít:
1.  **Nhóm Phân Quyền:** `users`, `roles`, `user_roles` (Liên kết nhiều-nhiều).
2.  **Nhóm Nhân Sự & Lớp học:** `students` (hồ sơ học sinh), `teachers` (hồ sơ giáo viên), `classrooms` (thông tin lớp, sĩ số tối đa, GVCN), `subjects` (danh mục môn học).
3.  **Nhóm Chuyên Môn:** 
    *   `class_subjects`: Lưu thông tin phân công Giáo viên nào dạy môn nào ở Lớp nào.
    *   `schedules` (Thời khóa biểu): Chứa thông tin ngày trong tuần, tiết học, lớp, giáo viên. **Điểm đặc biệt:** Bảng có thêm cột `schedule_type` cho phép lưu các "tiết học ngoại khóa" như **Sinh hoạt lớp (HOMEROOM)** và **Chào cờ (CEREMONY)** mặc dù chúng không thuộc một môn học cụ thể nào (subject_id = null).
    *   `grades` (Bảng điểm): Lưu trữ điểm Miệng, 15 phút, Giữa kỳ, Cuối kỳ. Điểm Trung bình sẽ được thuật toán tính toán tại tầng Service (Miệng×0.1 + 15Phút×0.1 + GiữaKỳ×0.3 + CuốiKỳ×0.5) thay vì lưu cứng vào CSDL, giúp đảm bảo tính nhất quán nếu công thức thay đổi.

### 2.3. Thiết kế Chức năng và Phân quyền (Use-Case & RBAC)

| Đối tượng | Chức năng chi tiết (Endpoints Mapping) |
| :--- | :--- |
| **Admin (Quản trị)** | - Quản lý Tài khoản (Thêm/Sửa/Xóa, Reset mật khẩu).<br>- Quản lý Học sinh & Phân Lớp.<br>- Quản lý Giáo viên & Phân công chuyên môn.<br>- Quản lý Lớp học & Môn học.<br>- Quản lý Thời khóa biểu (Batch-fill tạo lịch loạt, kiểm tra trùng lặp lịch).<br>- Thống kê tổng quan trường học (Dashboard Recharts). |
| **Teacher (Giáo viên)** | - Quản lý Hồ sơ cá nhân (Chỉnh sửa thông tin, Avatar).<br>- Quản lý Lớp chủ nhiệm (Xem danh sách, tình hình điểm lớp).<br>- Lớp giảng dạy (Nhập điểm hàng loạt - Batch grading grid).<br>- Xem Lịch dạy cá nhân.<br>- Thống kê báo cáo học lực học sinh. |
| **Student (Học sinh)** | - Tra cứu hồ sơ cá nhân.<br>- Xem bảng điểm và xếp loại học lực cá nhân.<br>- Tra cứu thời khóa biểu của lớp. |

---

## CHƯƠNG 3: CÀI ĐẶT VÀ ĐÁNH GIÁ KẾT QUẢ

### 3.1. Các kết quả và tính năng nổi bật đã đạt được
Hệ thống đã triển khai thành công thành một sản phẩm phần mềm vận hành trơn tru với các tiêu chuẩn của môi trường làm việc thực tế:

1.  **Cơ chế Refresh Token tự động ngầm mượt mà:** Tại tầng Client, Axios Interceptors được lập trình để bắt mã lỗi 401 (hết hạn token). Hệ thống tự động đẩy các request đang dang dở vào một hàng đợi (Queue), âm thầm gửi Refresh Token lên server lấy token mới, sau đó tự động kích hoạt lại các request lỗi. Người dùng sẽ không bao giờ bị "văng" ra trang đăng nhập một cách đột ngột.
2.  **Giao diện Tương tác cao (UI/UX):**
    *   Sử dụng MUI hỗ trợ cá nhân hóa 100% không gian làm việc Sáng/Tối (Dark/Light mode).
    *   Tính năng nhập điểm hiển thị dưới dạng Bảng lưới (Data Grid), cho phép giáo viên điền điểm nhanh chóng nhiều học sinh cùng lúc, có tự động đánh màu xanh/đỏ/vàng để phân biệt Giỏi/Khá/TB/Yếu.
    *   Trang Thời khóa biểu xử lý rất mượt các tiết học đặc biệt như "Chào cờ" 🚩 và "Sinh hoạt lớp" nhờ sự mở rộng cấu trúc `schedule_type`, với màu sắc trực quan (Red/Amber) định hướng thị giác tốt.
3.  **Bảo mật theo khuôn mẫu DTO:** API không bao giờ trả về nguyên mẫu các bảng dữ liệu `Entity` từ CSDL (chứa password hash, metadata nhạy cảm). Toàn bộ dữ liệu được đi qua `MapStruct` để "lọc" bằng biểu đồ đối tượng `DTO Response`, và từ Client gửi lên cũng được hứng bằng `DTO Request` kèm theo `@Valid` xác thực chặt chẽ chống Spam/Invalid Data.
4.  **Tối ưu hóa Database chuyên sâu:** 
    *   Giải quyết triệt để lỗi `N+1 Query` khét tiếng trong Hibernate bằng cách áp dụng Annotation `@EntityGraph` trong Repository (FETCH JOIN một lần thay vì SELECT hàng trăm lần).
    *   Áp dụng `@Transactional(readOnly = true)` tại tất cả các Service truy vấn. Việc này vô hiệu hóa quá trình "dirty-checking" của Hibernate, tiết kiệm lượng lớn chu kỳ CPU và RAM cho máy chủ.
5.  **Triển khai nguyên khối (Monolith Deployment):** Dù code dưới dạng Client-Server riêng biệt, dự án cung cấp bộ công cụ gộp giao diện đã build (`npm run build`) vào thẳng thư mục tĩnh của Spring Boot. Cả ứng dụng và API chạy chung thống nhất trên cổng `8080`, tránh hoàn toàn rắc rối CORS và tối giản chi phí cấu hình mạng triển khai.

### 3.2. Đánh giá chất lượng dự án
*   **Về mặt kiến trúc:** Hệ thống phân mảnh module chuẩn xác (Separation of Concerns). Cách thiết kế mô phỏng rất khéo léo nghiệp vụ phức tạp của một trường phổ thông Việt Nam (sĩ số, phân công, điểm hệ số, tiết sinh hoạt không môn), không gò bó rập khuôn.
*   **Về mặt thẩm mĩ:** Giao diện Responsive có thể sử dụng dễ dàng trên iPad/Tablet đối với Giáo viên, và trải nghiệm mobile tốt đối với Phụ huynh/Học sinh khi xem điểm. Biểu đồ thống kê sinh động mang tính báo cáo chuyên nghiệp.

### 3.3. Hướng phát triển trong tương lai
Dù hệ thống đã trọn vẹn ở mức độ Đồ án, một số hướng nâng cấp có thể thực hiện để mang ra triển khai diện rộng toàn quốc (Enterprise Ready):
1.  **Phân trang dữ liệu máy chủ (Server-side Pagination):** Khi sĩ số trường vượt mức 5.000, dữ liệu trả về cần phối hợp với đối tượng `Pageable` của JPA để thực hiện phân trang và Tải theo yêu cầu (Lazy Loading), nhằm chống tràn Memory trình duyệt.
2.  **State Management & Caching:** Chuyển dịch ứng dụng Frontend sang hệ sinh thái `React Query (TanStack Query)` để quản lý Cache cấp độ trình duyệt, tự động refetching dữ liệu khi người dùng chuyển Tab, loại bỏ việc viết quá nhiều Hooks `useEffect` rối rắm.
3.  **Tăng cường An ninh Token:** Chuyển cơ chế lưu trữ `Refresh Token` từ `localStorage` sáng dạng **`HttpOnly Cookie`**. Điều này giúp ứng dụng miễn nhiễm 100% với các cuộc tấn công đánh cắp phiên giao dịch (XSS cross-site scripting attacks).
4.  **Hệ thống thông báo & Email:** Tích hợp WebSockets/SSE để đẩy thông báo theo thời gian thực (Real-time Notification) khi giáo viên chốt bảng điểm, cũng như cấu hình SMTP để gửi kết quả học tập tự động về email của Phụ huynh mỗi tháng.

---
**KẾT LUẬN**
Đề tài *"Xây dựng hệ thống Quản Lý Học Tập"* đã đáp ứng được tất cả các bài toán thiết kế ban đầu đề ra, tạo được một công cụ hữu ích, tự động hóa toàn phần quy trình học vụ, đáp ứng cả tiêu chuẩn về Công nghệ Hiện đại, Trải nghiệm UX/UI và tính An toàn Bảo mật.

*(Hết báo cáo)*
