package com.example.student_service.repositories;

import com.example.student_service.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentCode(String studentCode);

    Optional<Student> findByUser_UserId(Long userId);

    List<Student> findByClassroom_ClassId(Long classId);
}