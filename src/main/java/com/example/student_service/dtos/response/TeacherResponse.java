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
public class TeacherResponse {
    Long id;
    String username;
    String fullName;
    String email;
    String teacherCode;
    LocalDate dateOfBirth;
    Gender gender;
    SubjectResponse subject;
    String avatarUrl;
}
