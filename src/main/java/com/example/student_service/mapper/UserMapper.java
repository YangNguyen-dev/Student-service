package com.example.student_service.mapper;

import com.example.student_service.dtos.request.RegisterRequest;
import com.example.student_service.dtos.response.*;
import com.example.student_service.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(RegisterRequest request);
    AuthResponse toUserResponse(User user);

    @Mapping(target = "subjectName", source = "subjectname")
    SubjectResponse toSubjectResponse(Subject subject);

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    TeacherResponse toTeacherResponse(Teacher teacher);

    @Mapping(target = "studentId", source = "id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    @Mapping(target = "classroomName", expression = "java(student.getClassroom() != null ? student.getClassroom().getClassroomName() : null)")
    StudentResponse toStudentResponse(Student student);

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentCode", source = "student.studentCode")
    @Mapping(target = "studentName", expression = "java(grade.getStudent().getUser().getFullName() != null ? grade.getStudent().getUser().getFullName() : grade.getStudent().getUser().getUsername())")
    @Mapping(target = "subjectName", source = "subject.subjectname")
    @Mapping(target = "averageScore", expression = "java(calcAverage(grade))")
    GradeResponse toGradeResponse(Grade grade);

    default Double calcAverage(Grade g) {
        Double oral = g.getOralScore();
        Double q15 = g.getQuiz15Score();
        Double mid = g.getMidtermScore();
        Double fin = g.getFinalScore();
        if (oral == null || q15 == null || mid == null || fin == null) return null;
        double avg = oral * 0.1 + q15 * 0.1 + mid * 0.3 + fin * 0.5;
        return Math.round(avg * 100.0) / 100.0;
    }

    @Mapping(target = "scheduleId", source = "scheduleId")
    @Mapping(target = "dayOfWeek", source = "day")
    @Mapping(target = "period", source = "period")
    @Mapping(target = "subject", expression = "java(schedule.getSubject() != null ? schedule.getSubject().getSubjectname() : null)")
    @Mapping(target = "teacherName", expression = "java(schedule.getTeacher() != null ? (schedule.getTeacher().getUser().getFullName() != null ? schedule.getTeacher().getUser().getFullName() : schedule.getTeacher().getUser().getUsername()) : null)")
    @Mapping(target = "classroomName", source = "classroom.classroomName")
    @Mapping(target = "subjectId", expression = "java(schedule.getSubject() != null ? schedule.getSubject().getSubjectId() : null)")
    @Mapping(target = "teacherId", expression = "java(schedule.getTeacher() != null ? schedule.getTeacher().getId() : null)")
    @Mapping(target = "classId", source = "classroom.classId")
    ScheduleResponse toScheduleResponse(Schedule schedule);

    @Mapping(target = "homeroomTeacher", expression = "java(classroom.getHomeroomTeacher() != null ? (classroom.getHomeroomTeacher().getUser().getFullName() != null ? classroom.getHomeroomTeacher().getUser().getFullName() : classroom.getHomeroomTeacher().getUser().getUsername()) : null)")
    @Mapping(target = "homeroomTeacherId", expression = "java(classroom.getHomeroomTeacher() != null ? classroom.getHomeroomTeacher().getId() : null)")
    @Mapping(target = "studentCount", expression = "java(classroom.getStudents() != null ? classroom.getStudents().size() : 0)")
    @Mapping(target = "subjectTeachers", expression = "java(mapSubjectTeachers(classroom))")
    ClassroomResponse toClassroomResponse(Classroom classroom);

    default List<SubjectTeacherResponse> mapSubjectTeachers(Classroom classroom) {
        if (classroom.getClassSubjectTeachers() == null) return Collections.emptyList();
        return classroom.getClassSubjectTeachers().stream().map(cst -> {
            SubjectTeacherResponse.SubjectTeacherResponseBuilder builder = SubjectTeacherResponse.builder()
                    .subjectId(cst.getSubject().getSubjectId())
                    .subjectName(cst.getSubject().getSubjectname());
            if (cst.getTeacher() != null) {
                builder.teacherId(cst.getTeacher().getId())
                        .teacherCode(cst.getTeacher().getTeacherCode())
                        .teacherName(cst.getTeacher().getUser().getFullName() != null
                                ? cst.getTeacher().getUser().getFullName()
                                : cst.getTeacher().getUser().getUsername());
            }
            return builder.build();
        }).collect(Collectors.toList());
    }

    @Mapping(target = "student.id", source = "studentId")
    Grade toGrade(com.example.student_service.dtos.request.EnterGradeRequest request);
}