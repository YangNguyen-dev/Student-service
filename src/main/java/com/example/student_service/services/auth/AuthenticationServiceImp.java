package com.example.student_service.services.auth;

import com.example.student_service.dtos.request.LoginRequest;
import com.example.student_service.dtos.request.RegisterRequest;
import com.example.student_service.dtos.response.AuthResponse;

public interface AuthenticationServiceImp {
     AuthResponse register(RegisterRequest request);
     AuthResponse login(LoginRequest request);
}
