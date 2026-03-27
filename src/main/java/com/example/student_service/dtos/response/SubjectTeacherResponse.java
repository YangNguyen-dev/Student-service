package com.example.student_service.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubjectTeacherResponse {
    Long subjectId;
    String subjectName;
    Long teacherId;
    String teacherName;
    String teacherCode;
}
