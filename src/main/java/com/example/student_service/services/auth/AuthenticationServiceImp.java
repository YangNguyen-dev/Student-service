package com.example.student_service.services.auth;

import com.example.student_service.dtos.request.ChangePasswordRequest;
import com.example.student_service.dtos.request.LoginRequest;
import com.example.student_service.dtos.request.RegisterRequest;
import com.example.student_service.dtos.response.AuthResponse;

/**
 * Interface định nghĩa các chức năng xác thực.
 */
public interface AuthenticationServiceImp {
    /** Đăng ký tài khoản mới */
    AuthResponse register(RegisterRequest request);

    /** Đăng nhập */
    AuthResponse login(LoginRequest request);

    /** Làm mới token bằng refresh token */
    AuthResponse refreshToken(String refreshToken);

    /** Đổi mật khẩu */
    void changePassword(Long userId, ChangePasswordRequest request);
}
