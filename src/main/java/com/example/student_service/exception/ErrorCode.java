package com.example.student_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXIT(9999, "Uncategorized exit"),
    USER_EXISTS(1001, "User already exists"),
    USER_NOT_FOUND(1002, "User not found"),
    INVALID_PASSWORD(1003, "Mật khẩu hiện tại không đúng"),
    INVALID_ROLE(1004, "Invalid role. Must be STUDENT, TEACHER, or ADMIN"),
    STUDENT_NOT_FOUND(1005, "Student not found"),
    TEACHER_NOT_FOUND(1006, "Teacher not found"),
    CLASSROOM_NOT_FOUND(1007, "Classroom not found"),
    SUBJECT_NOT_FOUND(1008, "Subject not found"),
    NOT_TEACHING_CLASS(1009, "You are not teaching this class"),
    STUDENT_NO_CLASS(1010, "Student has no assigned class"),
    STUDENT_NOT_IN_CLASS(1011, "Student does not belong to this class"),
    CLASSROOM_EXISTS(1012, "Classroom name already exists"),
    SUBJECT_EXISTS(1013, "Subject name already exists"),
    SCHEDULE_NOT_FOUND(1014, "Schedule not found"),
    SCHEDULE_CLASS_CONFLICT(1015, "Lớp đã có tiết học vào thời điểm này"),
    SCHEDULE_TEACHER_CONFLICT(1016, "Giáo viên đã có lịch dạy vào thời điểm này"),
    ;
    int code;
    String message;
}
