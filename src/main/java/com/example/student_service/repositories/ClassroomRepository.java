package com.example.student_service.repositories;

import com.example.student_service.entities.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    Optional<Classroom> findByClassroomName(String classroomName);

    Optional<Classroom> findByHomeroomTeacher_Id(Long teacherId);
}
