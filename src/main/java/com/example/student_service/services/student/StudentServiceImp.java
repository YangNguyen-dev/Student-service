package com.example.student_service.services.student;

import com.example.student_service.dtos.request.ProfileUpdateRequest;
import com.example.student_service.entities.Grade;
import com.example.student_service.entities.Schedule;
import com.example.student_service.entities.Student;

import java.util.List;

public interface StudentServiceImp {
    Student getProfile(Long userId);
    Student updateProfile(Long userId, ProfileUpdateRequest request);
    List<Grade> getGrades(Long userId);
    List<Schedule> getSchedule(Long userId);
    com.example.student_service.entities.Classroom getClassroomInfo(Long userId);
}
