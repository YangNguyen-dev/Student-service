package com.example.student_service.entities;

import jakarta.persistence.*;
import lombok.*;
import jakarta.persistence.Id;

import java.util.List;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private Long classId;

    @Column(name = "classroom_name", nullable = false, unique = true)
    private String classroomName;

    @Column(name = "max_students")
    private Integer maxStudents;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", unique = true)
    private Teacher homeroomTeacher;

    @OneToMany(mappedBy = "classroom")
    private List<Student> students;

    @OneToMany(mappedBy = "classroom")
    private List<Schedule> schedules;

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClassSubjectTeacher> classSubjectTeachers;
}