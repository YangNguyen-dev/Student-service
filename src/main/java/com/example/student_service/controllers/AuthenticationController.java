package com.example.student_service.controllers;

import com.example.student_service.api.ApiResponse;
import com.example.student_service.dtos.request.ChangePasswordRequest;
import com.example.student_service.dtos.request.LoginRequest;
import com.example.student_service.dtos.request.RegisterRequest;
import com.example.student_service.dtos.response.AuthResponse;
import com.example.student_service.services.auth.AuthenticationServiceImp;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý xác thực:
 * - POST /register     : Đăng ký tài khoản
 * - POST /login        : Đăng nhập
 * - POST /refresh-token: Làm mới access token
 * - PUT  /change-password: Đổi mật khẩu
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationServiceImp service;

    /** Đăng ký tài khoản mới */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AuthResponse>builder().data(service.register(request)).build());
    }

    /** Đăng nhập */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder().data(service.login(request)).build());
    }

    /** Làm mới token bằng refresh token */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder().data(service.refreshToken(refreshToken)).build());
    }

    /** Đổi mật khẩu (yêu cầu đăng nhập) */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @RequestBody @Valid ChangePasswordRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        service.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.<String>builder().data("Đổi mật khẩu thành công").build());
    }
}