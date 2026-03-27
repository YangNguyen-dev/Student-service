package com.example.student_service.dtos.response;

import com.example.student_service.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentResponse {
    Long studentId;
    String studentCode;
    String username;
    String fullName;
    String email;
    LocalDate dateOfBirth;
    Gender gender;
    String classroomName;
    String avatarUrl;
}