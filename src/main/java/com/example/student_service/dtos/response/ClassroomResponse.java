package com.example.student_service.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassroomReponse {
    Long classId;

    String classroomName;

    String homeroomTeacher;
}
