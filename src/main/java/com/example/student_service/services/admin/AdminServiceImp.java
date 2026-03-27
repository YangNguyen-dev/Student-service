package com.example.student_service.services.admin;

import com.example.student_service.dtos.request.ClassroomRequest;
import com.example.student_service.dtos.request.SubjectRequest;
import com.example.student_service.entities.*;

import java.util.List;

public interface AdminServiceImp {

    // ===== User Management =====
    List<User> getAllUsers();
    User getUserById(Long userId);
    void deleteUser(Long userId);
    void resetPassword(Long userId);

    // ===== Student Management =====
    List<Student> getAllStudents();
    Student getStudentById(Long studentId);
    void assignStudentToClass(Long studentId, Long classId);
    void removeStudentFromClass(Long studentId);

    // ===== Teacher Management =====
    List<Teacher> getAllTeachers();
    Teacher getTeacherById(Long teacherId);
    void assignTeacherToSubject(Long teacherId, Long subjectId);

    // ===== Classroom Management =====
    List<Classroom> getAllClassrooms();
    Classroom getClassroomById(Long classId);
    Classroom createClassroom(ClassroomRequest request);
    Classroom updateClassroom(Long classId, ClassroomRequest request);
    void deleteClassroom(Long classId);
    void setHomeroomTeacher(Long classId, Long teacherId);
    void removeHomeroomTeacher(Long classId);
    void assignSubjectTeacher(Long classId, Long subjectId, Long teacherId);
    void removeSubjectTeacher(Long classId, Long subjectId);

    // ===== Subject Management =====
    List<Subject> getAllSubjects();
    Subject getSubjectById(Long subjectId);
    Subject createSubject(SubjectRequest request);
    Subject updateSubject(Long subjectId, SubjectRequest request);
    void deleteSubject(Long subjectId);

    // ===== Schedule Management =====
    List<Schedule> getAllSchedules();
    List<Schedule> getSchedulesByClass(Long classId);
    Schedule createSchedule(com.example.student_service.dtos.request.ScheduleRequest request);
    Schedule updateSchedule(Long scheduleId, com.example.student_service.dtos.request.ScheduleRequest request);
    void deleteSchedule(Long scheduleId);
}
