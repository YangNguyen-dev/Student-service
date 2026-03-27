package com.example.student_service.dtos.request;

import com.example.student_service.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    String fullName;
    String email;
    LocalDate dateOfBirth;
    Gender gender;
}
