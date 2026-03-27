package com.example.student_service.repositories;

import com.example.student_service.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByTeacherCode(String teacherCode);

    Optional<Teacher> findByUser_UserId(Long userId);

    Optional<Teacher> findBySubject_SubjectId(Long subjectId);
}
