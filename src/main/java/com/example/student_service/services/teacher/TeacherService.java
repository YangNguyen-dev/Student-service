package com.example.student_service.services.teacher;

import com.example.student_service.dtos.request.ProfileUpdateRequest;
import com.example.student_service.entities.*;
import com.example.student_service.exception.ApiException;
import com.example.student_service.exception.ErrorCode;
import com.example.student_service.repositories.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service xử lý nghiệp vụ giáo viên.
 * Mặc định readOnly = true, chỉ override khi cần ghi.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class TeacherService implements TeacherServiceImp {

    TeacherRepository teacherRepository;
    ClassroomRepository classroomRepository;
    StudentRepository studentRepository;
    GradeRepository gradeRepository;
    UserRepository userRepository;

    /** Lấy thông tin giáo viên từ userId */
    private Teacher getTeacher(Long userId) {
        return teacherRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TEACHER_NOT_FOUND));
    }

    /** Kiểm tra giáo viên có quyền với lớp này không (dạy hoặc chủ nhiệm) */
    private void checkTeachingClass(Teacher teacher, Long classId) {
        // Là GVCN của lớp
        if (teacher.getClassroom() != null && teacher.getClassroom().getClassId().equals(classId)) {
            return;
        }
        // Được phân công dạy lớp này (qua bảng class_subjects)
        boolean isAssigned = teacher.getClassSubjects() != null && teacher.getClassSubjects()
                .stream()
                .anyMatch(cs -> cs.getClassroom().getClassId().equals(classId));
        if (isAssigned) return;

        // Có lịch dạy lớp này (qua bảng schedule)
        boolean isTeaching = teacher.getSchedules() != null && teacher.getSchedules()
                .stream()
                .anyMatch(s -> s.getClassroom().getClassId().equals(classId));
        if (!isTeaching) {
            throw new ApiException(ErrorCode.NOT_TEACHING_CLASS);
        }
    }

    /** Xem hồ sơ giáo viên */
    @Override
    public Teacher getProfile(Long userId) {
        return getTeacher(userId);
    }

    /** Cập nhật hồ sơ giáo viên */
    @Override
    @Transactional
    public Teacher updateProfile(Long userId, ProfileUpdateRequest request) {
        Teacher teacher = getTeacher(userId);
        if (request.getFullName() != null) {
            teacher.getUser().setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            teacher.getUser().setEmail(request.getEmail());
        }
        userRepository.save(teacher.getUser());
        if (request.getDateOfBirth() != null) {
            teacher.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            teacher.setGender(request.getGender());
        }
        return teacherRepository.save(teacher);
    }

    /** Lấy môn mà giáo viên được phân công dạy */
    @Override
    public Subject getMySubject(Long userId) {
        Subject subject = getTeacher(userId).getSubject();
        if (subject == null) {
            throw new ApiException(ErrorCode.SUBJECT_NOT_FOUND);
        }
        return subject;
    }

    /** Lấy tất cả lớp mà giáo viên dạy + chủ nhiệm (không trùng lặp) */
    @Override
    public List<Classroom> getMyClassrooms(Long userId) {
        Teacher teacher = getTeacher(userId);
        Map<Long, Classroom> classMap = new LinkedHashMap<>();

        // Lớp chủ nhiệm
        if (teacher.getClassroom() != null) {
            classMap.put(teacher.getClassroom().getClassId(), teacher.getClassroom());
        }
        // Lớp dạy qua phân công môn
        if (teacher.getClassSubjects() != null) {
            for (ClassSubjectTeacher cs : teacher.getClassSubjects()) {
                classMap.putIfAbsent(cs.getClassroom().getClassId(), cs.getClassroom());
            }
        }
        // Lớp dạy qua lịch
        if (teacher.getSchedules() != null) {
            for (Schedule s : teacher.getSchedules()) {
                classMap.putIfAbsent(s.getClassroom().getClassId(), s.getClassroom());
            }
        }
        return new ArrayList<>(classMap.values());
    }

    /** Lấy lịch dạy của giáo viên */
    @Override
    public List<Schedule> getMySchedules(Long userId) {
        return getTeacher(userId).getSchedules();
    }

    /** Lấy danh sách học sinh trong lớp (kiểm tra quyền) */
    @Override
    public List<Student> getStudentsByClass(Long userId, Long classId) {
        Teacher teacher = getTeacher(userId);
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ApiException(ErrorCode.CLASSROOM_NOT_FOUND));
        checkTeachingClass(teacher, classId);
        return classroom.getStudents();
    }

    /** Xem điểm đã nhập cho lớp (chỉ điểm do GV này nhập) */
    @Override
    public List<Grade> getGradesByClass(Long userId, Long classId) {
        Teacher teacher = getTeacher(userId);
        checkTeachingClass(teacher, classId);
        return gradeRepository.findByTeacher_IdAndStudent_Classroom_ClassId(
                teacher.getId(), classId);
    }

    /** Nhập/cập nhật điểm hàng loạt */
    @Override
    @Transactional
    public void inputGrades(Long userId, Long classId, List<Grade> grades) {
        Teacher teacher = getTeacher(userId);
        Subject subject = teacher.getSubject();

        classroomRepository.findById(classId)
                .orElseThrow(() -> new ApiException(ErrorCode.CLASSROOM_NOT_FOUND));
        checkTeachingClass(teacher, classId);

        for (Grade gradeInput : grades) {
            Student student = studentRepository.findById(gradeInput.getStudent().getId())
                    .orElseThrow(() -> new ApiException(ErrorCode.STUDENT_NOT_FOUND));

            if (student.getClassroom() == null || !student.getClassroom().getClassId().equals(classId)) {
                throw new ApiException(ErrorCode.STUDENT_NOT_IN_CLASS);
            }

            Grade grade = new Grade();
            grade.setOralScore(gradeInput.getOralScore());
            grade.setQuiz15Score(gradeInput.getQuiz15Score());
            grade.setMidtermScore(gradeInput.getMidtermScore());
            grade.setFinalScore(gradeInput.getFinalScore());
            grade.setTeacher(teacher);
            grade.setSubject(subject);
            grade.setStudent(student);

            // Nếu đã có điểm cho HS-Môn này → cập nhật thay vì tạo mới
            gradeRepository
                    .findByStudent_IdAndSubject_SubjectId(student.getId(), subject.getSubjectId())
                    .ifPresent(existing -> grade.setGradeId(existing.getGradeId()));

            gradeRepository.save(grade);
        }
    }

    /** GVCN xem tất cả điểm của học sinh trong lớp chủ nhiệm */
    @Override
    public List<Grade> getHomeroomGrades(Long userId) {
        Teacher teacher = getTeacher(userId);
        Classroom homeroom = teacher.getClassroom();
        if (homeroom == null) {
            throw new ApiException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        return gradeRepository.findByStudent_Classroom_ClassId(homeroom.getClassId());
    }
}
