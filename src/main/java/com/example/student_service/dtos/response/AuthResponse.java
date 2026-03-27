package com.example.student_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * DTO trả về khi xác thực thành công (đăng nhập, đăng ký, làm mới token).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AuthResponse {
    /** Access token JWT (thời hạn ngắn) */
    String token;

    /** Refresh token JWT (thời hạn dài, dùng để lấy token mới) */
    String refreshToken;

    String username;
    String fullName;
    String role;
    String avatarUrl;
}
