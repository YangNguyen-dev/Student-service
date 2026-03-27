package com.example.student_service.controllers;

import com.example.student_service.dtos.response.GradeResponse;
import com.example.student_service.dtos.response.ScheduleResponse;
import com.example.student_service.dtos.response.StudentResponse;
import com.example.student_service.mapper.UserMapper;
import com.example.student_service.services.student.StudentServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/students") 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SudentController {

    StudentServiceImp studentService;
    UserMapper userMapper;

    private Long getUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    // 🔹 Lấy profile
    @GetMapping("/profile")
    public StudentResponse getProfile(Authentication authentication) {
        return userMapper.toStudentResponse(studentService.getProfile(getUserId(authentication)));
    }

    // 🔹 Lấy bảng điểm
    @GetMapping("/grades")
    public List<GradeResponse> getGrades(Authentication authentication) {
        return studentService.getGrades(getUserId(authentication)).stream()
                .map(userMapper::toGradeResponse)
                .collect(Collectors.toList());
    }

    // 🔹 Lấy thời khóa biểu
    @GetMapping("/schedule")
    public List<ScheduleResponse> getSchedule(Authentication authentication) {
        return studentService.getSchedule(getUserId(authentication)).stream()
                .map(userMapper::toScheduleResponse)
                .collect(Collectors.toList());
    }
}