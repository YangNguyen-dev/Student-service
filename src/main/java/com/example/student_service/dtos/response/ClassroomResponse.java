package com.example.student_service.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassroomResponse {
    Long classId;

    String classroomName;

    String homeroomTeacher;

    Long homeroomTeacherId;

    Integer maxStudents;

    Integer studentCount;

    List<SubjectTeacherResponse> subjectTeachers;
}
