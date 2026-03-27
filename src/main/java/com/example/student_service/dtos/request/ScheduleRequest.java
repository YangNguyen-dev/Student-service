package com.example.student_service.dtos.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleRequest {
    Long classId;
    Long subjectId;
    Long teacherId;
    String day;       // MONDAY, TUESDAY, etc.
    Integer period;   // 1-10
    String scheduleType; // null=normal, HOMEROOM, CEREMONY
}
