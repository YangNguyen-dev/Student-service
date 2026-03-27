package com.example.student_service.repositories;

import com.example.student_service.entities.Grade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý điểm số.
 * Dùng @EntityGraph để JOIN FETCH student/subject/teacher, tránh N+1 query.
 */
@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    /** Tìm điểm theo HS + Môn (dùng để kiểm tra trước khi tạo/cập nhật) */
    Optional<Grade> findByStudent_IdAndSubject_SubjectId(Long studentId, Long subjectId);

    /** Lấy điểm của giáo viên */
    List<Grade> findByTeacher_Id(Long teacherId);

    /** Lấy điểm theo môn */
    List<Grade> findBySubject_SubjectId(Long subjectId);

    /** Lấy điểm của học sinh (kèm thông tin môn + GV) */
    @EntityGraph(attributePaths = {"subject", "teacher"})
    List<Grade> findByStudent_Id(Long studentId);

    /** Lấy điểm GV nhập cho lớp (kèm student, subject) */
    @EntityGraph(attributePaths = {"student", "subject"})
    List<Grade> findByTeacher_IdAndStudent_Classroom_ClassId(Long teacherId, Long classId);

    /** Lấy tất cả điểm của HS trong lớp (cho GVCN, kèm student, subject, teacher) */
    @EntityGraph(attributePaths = {"student", "subject", "teacher"})
    List<Grade> findByStudent_Classroom_ClassId(Long classId);
}