package com.example.student_service.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GradeResponse {

    Long gradeId;
    Long studentId;
    String studentCode;
    String studentName;
    String subjectName;
    Double oralScore;
    Double quiz15Score;
    Double midtermScore;
    Double finalScore;
    Double averageScore;

}