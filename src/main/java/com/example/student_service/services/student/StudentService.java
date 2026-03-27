package com.example.student_service.services.student;

import com.example.student_service.dtos.request.ProfileUpdateRequest;
import com.example.student_service.entities.Classroom;
import com.example.student_service.entities.Grade;
import com.example.student_service.entities.Schedule;
import com.example.student_service.entities.Student;
import com.example.student_service.exception.ApiException;
import com.example.student_service.exception.ErrorCode;
import com.example.student_service.repositories.GradeRepository;
import com.example.student_service.repositories.ScheduleRepository;
import com.example.student_service.repositories.StudentRepository;
import com.example.student_service.repositories.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý nghiệp vụ học sinh.
 * Mặc định readOnly = true, chỉ override khi cần ghi.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class StudentService implements StudentServiceImp {

    StudentRepository studentRepository;
    GradeRepository gradeRepository;
    ScheduleRepository scheduleRepository;
    UserRepository userRepository;

    /** Lấy thông tin học sinh từ userId */
    @Override
    public Student getProfile(Long userId) {
        return studentRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.STUDENT_NOT_FOUND));
    }

    /** Cập nhật hồ sơ học sinh */
    @Override
    @Transactional
    public Student updateProfile(Long userId, ProfileUpdateRequest request) {
        Student student = getProfile(userId);
        if (request.getFullName() != null) {
            student.getUser().setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            student.getUser().setEmail(request.getEmail());
        }
        userRepository.save(student.getUser());
        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            student.setGender(request.getGender());
        }
        return studentRepository.save(student);
    }

    /** Lấy bảng điểm của học sinh */
    @Override
    public List<Grade> getGrades(Long userId) {
        Student student = studentRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.STUDENT_NOT_FOUND));
        return gradeRepository.findByStudent_Id(student.getId());
    }

    /** Lấy thời khóa biểu của học sinh (theo lớp) */
    @Override
    public List<Schedule> getSchedule(Long userId) {
        Student student = studentRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.STUDENT_NOT_FOUND));

        if (student.getClassroom() == null) {
            throw new ApiException(ErrorCode.STUDENT_NO_CLASS);
        }

        return scheduleRepository.findByClassroom_ClassId(
                student.getClassroom().getClassId()
        );
    }

    /** Lấy thông tin lớp học của học sinh */
    @Override
    public Classroom getClassroomInfo(Long userId) {
        Student student = studentRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.STUDENT_NOT_FOUND));

        if (student.getClassroom() == null) {
            throw new ApiException(ErrorCode.STUDENT_NO_CLASS);
        }

        return student.getClassroom();
    }
}