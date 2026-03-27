package com.example.student_service.controllers;

import com.example.student_service.dtos.request.EnterGradeRequest;
import com.example.student_service.dtos.request.ProfileUpdateRequest;
import com.example.student_service.dtos.response.*;
import com.example.student_service.entities.Grade;
import com.example.student_service.mapper.UserMapper;
import com.example.student_service.services.teacher.TeacherServiceImp;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TeacherController {

    TeacherServiceImp teacherService;
    UserMapper userMapper;

    // 🔹 lấy userId từ token
    private Long getUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    // 🔹 profile
    @GetMapping("/profile")
    public TeacherResponse getProfile(Authentication authentication) {
        return userMapper.toTeacherResponse(teacherService.getProfile(getUserId(authentication)));
    }

    // 🔹 Cập nhật profile
    @PutMapping("/profile")
    public TeacherResponse updateProfile(Authentication authentication, @RequestBody ProfileUpdateRequest request) {
        return userMapper.toTeacherResponse(teacherService.updateProfile(getUserId(authentication), request));
    }

    // 🔹 subject của teacher
    @GetMapping("/subject")
    public SubjectResponse getMySubject(Authentication authentication) {
        return userMapper.toSubjectResponse(teacherService.getMySubject(getUserId(authentication)));
    }

    // 🔹 các lớp đang dạy
    @GetMapping("/classrooms")
    public List<ClassroomResponse> getMyClassrooms(Authentication authentication) {
        return teacherService.getMyClassrooms(getUserId(authentication)).stream()
                .map(userMapper::toClassroomResponse)
                .collect(Collectors.toList());
    }

    // 🔹 danh sách student trong lớp
    @GetMapping("/class/{classId}/students")
    public List<StudentResponse> getStudentsByClass(
            Authentication authentication,
            @PathVariable Long classId
    ) {
        return teacherService.getStudentsByClass(
                getUserId(authentication),
                classId
        ).stream().map(userMapper::toStudentResponse).collect(Collectors.toList());
    }

    // 🔹 xem điểm đã nhập cho lớp
    @GetMapping("/class/{classId}/grades")
    public List<GradeResponse> getGradesByClass(
            Authentication authentication,
            @PathVariable Long classId
    ) {
        return teacherService.getGradesByClass(
                getUserId(authentication),
                classId
        ).stream().map(userMapper::toGradeResponse).collect(Collectors.toList());
    }

    // 🔹 lịch dạy
    @GetMapping("/schedule")
    public List<ScheduleResponse> getMySchedule(Authentication authentication) {
        return teacherService.getMySchedules(getUserId(authentication)).stream()
                .map(userMapper::toScheduleResponse)
                .collect(Collectors.toList());
    }

    // 🔥 nhập điểm (batch)
    @PostMapping("/grades")
    public String inputGrades(
            Authentication authentication,
            @RequestBody List<EnterGradeRequest> requests,
            @RequestParam Long classId
    ) {

        List<Grade> grades = requests.stream()
                .map(userMapper::toGrade)
                .collect(Collectors.toList());

        teacherService.inputGrades(
                getUserId(authentication),
                classId,
                grades
        );

        return "Nhập điểm thành công";
    }

    // 🔹 GVCN xem bảng điểm học sinh lớp chủ nhiệm
    @GetMapping("/homeroom/grades")
    public List<GradeResponse> getHomeroomGrades(Authentication authentication) {
        return teacherService.getHomeroomGrades(getUserId(authentication)).stream()
                .map(userMapper::toGradeResponse)
                .collect(Collectors.toList());
    }
}