package com.example.student_service.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "subject_name", nullable = false, unique = true, length = 150)
    private String subjectname;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "subject")
    private List<Grade> grades;

    @OneToMany(mappedBy = "subject")
    private List<Teacher> teachers;

    @OneToMany(mappedBy = "subject")
    private List<Schedule> schedules;

    @OneToMany(mappedBy = "subject")
    private List<ClassSubjectTeacher> classSubjectTeachers;
}
