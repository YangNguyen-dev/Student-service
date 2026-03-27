package com.example.student_service.controllers;

import com.example.student_service.api.ApiResponse;
import com.example.student_service.dtos.request.ClassroomRequest;
import com.example.student_service.dtos.request.ScheduleRequest;
import com.example.student_service.dtos.request.SubjectRequest;
import com.example.student_service.dtos.response.*;
import com.example.student_service.entities.User;
import com.example.student_service.mapper.UserMapper;
import com.example.student_service.services.admin.AdminServiceImp;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller quản trị viên.
 * Quản lý: người dùng, học sinh, giáo viên, lớp, môn học, lịch học.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminController {

    AdminServiceImp adminService;
    UserMapper userMapper;

    // ========== QUẢN LÝ NGƯỜI DÙNG ==========

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers().stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/users/{userId}")
    public UserResponse getUserById(@PathVariable Long userId) {
        return mapUserToResponse(adminService.getUserById(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ApiResponse<String> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ApiResponse.<String>builder().data("Xóa user thành công").build();
    }

    @PutMapping("/users/{userId}/reset-password")
    public ApiResponse<String> resetPassword(@PathVariable Long userId) {
        adminService.resetPassword(userId);
        return ApiResponse.<String>builder().data("Reset mật khẩu thành công (mật khẩu mới: 123456)").build();
    }

    // ========== QUẢN LÝ HỌC SINH ==========

    @GetMapping("/students")
    public List<StudentResponse> getAllStudents() {
        return adminService.getAllStudents().stream()
                .map(userMapper::toStudentResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/students/{studentId}")
    public StudentResponse getStudentById(@PathVariable Long studentId) {
        return userMapper.toStudentResponse(adminService.getStudentById(studentId));
    }

    @PutMapping("/students/{studentId}/class/{classId}")
    public ApiResponse<String> assignStudentToClass(@PathVariable Long studentId, @PathVariable Long classId) {
        adminService.assignStudentToClass(studentId, classId);
        return ApiResponse.<String>builder().data("Gán student vào lớp thành công").build();
    }

    @DeleteMapping("/students/{studentId}/class")
    public ApiResponse<String> removeStudentFromClass(@PathVariable Long studentId) {
        adminService.removeStudentFromClass(studentId);
        return ApiResponse.<String>builder().data("Xóa student khỏi lớp thành công").build();
    }

    // ========== QUẢN LÝ GIÁO VIÊN ==========

    @GetMapping("/teachers")
    public List<TeacherResponse> getAllTeachers() {
        return adminService.getAllTeachers().stream()
                .map(userMapper::toTeacherResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/teachers/{teacherId}")
    public TeacherResponse getTeacherById(@PathVariable Long teacherId) {
        return userMapper.toTeacherResponse(adminService.getTeacherById(teacherId));
    }

    @PutMapping("/teachers/{teacherId}/subject/{subjectId}")
    public ApiResponse<String> assignTeacherToSubject(@PathVariable Long teacherId, @PathVariable Long subjectId) {
        adminService.assignTeacherToSubject(teacherId, subjectId);
        return ApiResponse.<String>builder().data("Gán teacher vào môn thành công").build();
    }

    // ========== QUẢN LÝ LỚP HỌC ==========

    @GetMapping("/classrooms")
    public List<ClassroomResponse> getAllClassrooms() {
        return adminService.getAllClassrooms().stream()
                .map(userMapper::toClassroomResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/classrooms/{classId}")
    public ClassroomResponse getClassroomById(@PathVariable Long classId) {
        return userMapper.toClassroomResponse(adminService.getClassroomById(classId));
    }

    @PostMapping("/classrooms")
    public ClassroomResponse createClassroom(@RequestBody @Valid ClassroomRequest request) {
        return userMapper.toClassroomResponse(adminService.createClassroom(request));
    }

    @PutMapping("/classrooms/{classId}")
    public ClassroomResponse updateClassroom(@PathVariable Long classId, @RequestBody @Valid ClassroomRequest request) {
        return userMapper.toClassroomResponse(adminService.updateClassroom(classId, request));
    }

    @DeleteMapping("/classrooms/{classId}")
    public ApiResponse<String> deleteClassroom(@PathVariable Long classId) {
        adminService.deleteClassroom(classId);
        return ApiResponse.<String>builder().data("Xóa classroom thành công").build();
    }

    @PutMapping("/classrooms/{classId}/homeroom/{teacherId}")
    public ApiResponse<String> setHomeroomTeacher(@PathVariable Long classId, @PathVariable Long teacherId) {
        adminService.setHomeroomTeacher(classId, teacherId);
        return ApiResponse.<String>builder().data("Gán GVCN thành công").build();
    }

    @DeleteMapping("/classrooms/{classId}/homeroom")
    public ApiResponse<String> removeHomeroomTeacher(@PathVariable Long classId) {
        adminService.removeHomeroomTeacher(classId);
        return ApiResponse.<String>builder().data("Hủy GVCN thành công").build();
    }

    @PutMapping("/classrooms/{classId}/subject/{subjectId}/teacher/{teacherId}")
    public ApiResponse<String> assignSubjectTeacher(@PathVariable Long classId,
                                                     @PathVariable Long subjectId,
                                                     @PathVariable Long teacherId) {
        adminService.assignSubjectTeacher(classId, subjectId, teacherId);
        return ApiResponse.<String>builder().data("Gán GVBM thành công").build();
    }

    @DeleteMapping("/classrooms/{classId}/subject/{subjectId}/teacher")
    public ApiResponse<String> removeSubjectTeacher(@PathVariable Long classId,
                                                     @PathVariable Long subjectId) {
        adminService.removeSubjectTeacher(classId, subjectId);
        return ApiResponse.<String>builder().data("Hủy GVBM thành công").build();
    }

    // ========== QUẢN LÝ MÔN HỌC ==========

    @GetMapping("/subjects")
    public List<SubjectResponse> getAllSubjects() {
        return adminService.getAllSubjects().stream()
                .map(userMapper::toSubjectResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/subjects/{subjectId}")
    public SubjectResponse getSubjectById(@PathVariable Long subjectId) {
        return userMapper.toSubjectResponse(adminService.getSubjectById(subjectId));
    }

    @PostMapping("/subjects")
    public SubjectResponse createSubject(@RequestBody @Valid SubjectRequest request) {
        return userMapper.toSubjectResponse(adminService.createSubject(request));
    }

    @PutMapping("/subjects/{subjectId}")
    public SubjectResponse updateSubject(@PathVariable Long subjectId, @RequestBody @Valid SubjectRequest request) {
        return userMapper.toSubjectResponse(adminService.updateSubject(subjectId, request));
    }

    @DeleteMapping("/subjects/{subjectId}")
    public ApiResponse<String> deleteSubject(@PathVariable Long subjectId) {
        adminService.deleteSubject(subjectId);
        return ApiResponse.<String>builder().data("Xóa subject thành công").build();
    }

    // ========== QUẢN LÝ LỊCH HỌC ==========

    @GetMapping("/schedules")
    public List<ScheduleResponse> getAllSchedules() {
        return adminService.getAllSchedules().stream()
                .map(userMapper::toScheduleResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/schedules/class/{classId}")
    public List<ScheduleResponse> getSchedulesByClass(@PathVariable Long classId) {
        return adminService.getSchedulesByClass(classId).stream()
                .map(userMapper::toScheduleResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/schedules")
    public ScheduleResponse createSchedule(@RequestBody @Valid ScheduleRequest request) {
        return userMapper.toScheduleResponse(adminService.createSchedule(request));
    }

    @PutMapping("/schedules/{scheduleId}")
    public ScheduleResponse updateSchedule(@PathVariable Long scheduleId, @RequestBody @Valid ScheduleRequest request) {
        return userMapper.toScheduleResponse(adminService.updateSchedule(scheduleId, request));
    }

    @DeleteMapping("/schedules/{scheduleId}")
    public ApiResponse<String> deleteSchedule(@PathVariable Long scheduleId) {
        adminService.deleteSchedule(scheduleId);
        return ApiResponse.<String>builder().data("Xóa lịch thành công").build();
    }

    // ========== Helper ==========

    private UserResponse mapUserToResponse(User user) {
        List<String> roles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}
