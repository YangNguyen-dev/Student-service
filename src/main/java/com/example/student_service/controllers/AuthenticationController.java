package com.example.student_service.controllers;

import com.example.student_service.api.ApiResponse;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping()
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationController {
    AuthenticationServiceImp service;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AuthResponse>builder()
                .data(service.register(request)).build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.<AuthResponse>builder()
                .data(service.login(request)).build());
    }


}