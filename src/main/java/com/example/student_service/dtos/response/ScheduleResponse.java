package com.example.student_service.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleResponse {
    Long scheduleId;
    String dayOfWeek;
    Integer period;
    String subject;
    String teacherName;
    String classroomName;
    Long subjectId;
    Long teacherId;
    Long classId;
    String scheduleType;
}