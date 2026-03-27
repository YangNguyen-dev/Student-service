package com.example.student_service.services.teacher;
import com.example.student_service.dtos.request.ProfileUpdateRequest;
import com.example.student_service.entities.*;

import java.util.List;

public interface TeacherServiceImp {
    Teacher getProfile(Long userId);
    Teacher updateProfile(Long userId, ProfileUpdateRequest request);
    Subject getMySubject(Long userId);
    List<Classroom> getMyClassrooms(Long userId);
    List<Schedule> getMySchedules(Long userId);
    List<Student> getStudentsByClass(Long userId, Long classId);
    List<Grade> getGradesByClass(Long userId, Long classId);
    void inputGrades(Long userId, Long classId, List<Grade> grades);
    List<Grade> getHomeroomGrades(Long userId);
}
