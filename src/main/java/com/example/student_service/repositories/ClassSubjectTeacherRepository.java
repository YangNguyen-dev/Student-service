package com.example.student_service.repositories;

import com.example.student_service.entities.ClassSubjectTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSubjectTeacherRepository extends JpaRepository<ClassSubjectTeacher, Long> {

    List<ClassSubjectTeacher> findByClassroom_ClassId(Long classId);

    Optional<ClassSubjectTeacher> findByClassroom_ClassIdAndSubject_SubjectId(Long classId, Long subjectId);

    void deleteByClassroom_ClassIdAndSubject_SubjectId(Long classId, Long subjectId);
}
