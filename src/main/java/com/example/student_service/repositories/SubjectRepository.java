package com.example.student_service.repositories;

import com.example.student_service.entities.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectname(String subjectname);

    List<Subject> findByClassSubjectTeachers_Classroom_ClassId(Long classId);
}
