package com.example.student_service.dtos.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class EnterGradeRequest {
    Long studentId;
    Double oralScore;
    Double quiz15Score;
    Double midtermScore;
    Double finalScore;
}
