package com.example.student_service.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity bảng điểm (grades).
 * Mỗi bản ghi = điểm của 1 học sinh cho 1 môn, do 1 giáo viên nhập.
 * Ràng buộc UNIQUE: mỗi HS chỉ có 1 bản ghi điểm / môn.
 */
@Entity
@Table(
        name = "grades",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id","subject_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_diem")
    private Long gradeId;

    /** Điểm miệng (hệ số 1) */
    @Column(name = "diem_mieng")
    private Double oralScore;

    /** Điểm 15 phút (hệ số 1) */
    @Column(name = "diem_15_phut")
    private Double quiz15Score;

    /** Điểm giữa kỳ (hệ số 3) */
    @Column(name = "diem_giua_ky")
    private Double midtermScore;

    /** Điểm cuối kỳ (hệ số 5) */
    @Column(name = "diem_cuoi_ky")
    private Double finalScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

}
