package com.example.student_service.entities;

import com.example.student_service.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Teacher {

    @Id
    @Column(name = "user_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "teacher_code", nullable = false, unique = true)
    private String teacherCode;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @OneToOne(mappedBy = "homeroomTeacher", fetch = FetchType.LAZY)
    private Classroom classroom;

    @OneToMany(mappedBy = "teacher")
    private List<Grade> grades;

    @OneToMany(mappedBy = "teacher")
    private List<Schedule> schedules;

    @OneToMany(mappedBy = "teacher")
    private List<ClassSubjectTeacher> classSubjects;
}