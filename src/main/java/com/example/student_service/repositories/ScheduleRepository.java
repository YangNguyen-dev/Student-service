package com.example.student_service.repositories;

import com.example.student_service.entities.Schedule;
import com.example.student_service.enums.Day;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý lịch học.
 * Các phương thức trả danh sách dùng @EntityGraph để JOIN FETCH,
 * tránh vấn đề N+1 query khi nạp Classroom/Teacher/Subject.
 */
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /** Lấy lịch theo lớp (kèm teacher, subject) */
    @EntityGraph(attributePaths = {"classroom", "teacher", "subject"})
    List<Schedule> findByClassroom_ClassId(Long classId);

    /** Lấy lịch theo giáo viên (kèm classroom, subject) */
    @EntityGraph(attributePaths = {"classroom", "teacher", "subject"})
    List<Schedule> findByTeacher_Id(Long teacherId);

    /** Lấy lịch theo môn học */
    List<Schedule> findBySubject_SubjectId(Long subjectId);

    /** Kiểm tra trùng lịch lớp: cùng lớp, cùng ngày, cùng tiết */
    Optional<Schedule> findByClassroom_ClassIdAndDayAndPeriod(Long classId, Day day, Integer period);

    /** Kiểm tra trùng lịch GV: cùng GV, cùng ngày, cùng tiết */
    Optional<Schedule> findByTeacher_IdAndDayAndPeriod(Long teacherId, Day day, Integer period);
}