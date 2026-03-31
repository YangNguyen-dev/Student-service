package com.example.student_service.services.admin;

import com.example.student_service.dtos.request.ClassroomRequest;
import com.example.student_service.dtos.request.ScheduleRequest;
import com.example.student_service.dtos.request.SubjectRequest;
import com.example.student_service.entities.*;
import com.example.student_service.exception.ApiException;
import com.example.student_service.exception.ErrorCode;
import com.example.student_service.repositories.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý nghiệp vụ quản trị viên.
 * Mặc định các phương thức đọc sẽ dùng readOnly = true để tối ưu Hibernate.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class AdminService implements AdminServiceImp {

    UserRepository userRepository;
    StudentRepository studentRepository;
    TeacherRepository teacherRepository;
    ClassroomRepository classroomRepository;
    SubjectRepository subjectRepository;
    ClassSubjectTeacherRepository classSubjectTeacherRepository;
    ScheduleRepository scheduleRepository;
    PasswordEncoder passwordEncoder;

    // ===== Quản lý người dùng =====

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
        studentRepository.findByUser_UserId(userId).ifPresent(studentRepository::delete);
        teacherRepository.findByUser_UserId(userId).ifPresent(teacherRepository::delete);
        userRepository.deleteById(userId);
    }

    @Override
    @Transactional
    public void resetPassword(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        user.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(user);
    }

    // ===== Quản lý học sinh =====

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ApiException(ErrorCode.STUDENT_NOT_FOUND));
    }

    @Override
    @Transactional
    public void assignStudentToClass(Long studentId, Long classId) {
        Student student = getStudentById(studentId);
        Classroom classroom = getClassroomById(classId);
        student.setClassroom(classroom);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void removeStudentFromClass(Long studentId) {
        Student student = getStudentById(studentId);
        student.setClassroom(null);
        studentRepository.save(student);
    }

    // ===== Quản lý giáo viên =====

    @Override
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @Override
    public Teacher getTeacherById(Long teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ApiException(ErrorCode.TEACHER_NOT_FOUND));
    }

    @Override
    @Transactional
    public void assignTeacherToSubject(Long teacherId, Long subjectId) {
        Teacher teacher = getTeacherById(teacherId);
        Subject subject = getSubjectById(subjectId);
        teacher.setSubject(subject);
        teacherRepository.save(teacher);
    }

    // ===== Quản lý lớp học =====

    @Override
    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    @Override
    public Classroom getClassroomById(Long classId) {
        return classroomRepository.findById(classId)
                .orElseThrow(() -> new ApiException(ErrorCode.CLASSROOM_NOT_FOUND));
    }

    @Override
    @Transactional
    public Classroom createClassroom(ClassroomRequest request) {
        if (classroomRepository.findByClassroomName(request.getClassroomName()).isPresent()) {
            throw new ApiException(ErrorCode.CLASSROOM_EXISTS);
        }
        Classroom classroom = Classroom.builder()
                .classroomName(request.getClassroomName())
                .maxStudents(request.getMaxStudents())
                .build();
        return classroomRepository.save(classroom);
    }

    @Override
    @Transactional
    public Classroom updateClassroom(Long classId, ClassroomRequest request) {
        Classroom classroom = getClassroomById(classId);
        classroom.setClassroomName(request.getClassroomName());
        classroom.setMaxStudents(request.getMaxStudents());
        return classroomRepository.save(classroom);
    }

    @Override
    @Transactional
    public void deleteClassroom(Long classId) {
        if (!classroomRepository.existsById(classId)) {
            throw new ApiException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        classroomRepository.deleteById(classId);
    }

    @Override
    @Transactional
    public void setHomeroomTeacher(Long classId, Long teacherId) {
        Classroom classroom = getClassroomById(classId);
        Teacher teacher = getTeacherById(teacherId);
        classroom.setHomeroomTeacher(teacher);
        classroomRepository.save(classroom);
    }

    @Override
    @Transactional
    public void removeHomeroomTeacher(Long classId) {
        Classroom classroom = getClassroomById(classId);
        classroom.setHomeroomTeacher(null);
        classroomRepository.save(classroom);
    }

    @Override
    @Transactional
    public void assignSubjectTeacher(Long classId, Long subjectId, Long teacherId) {
        Classroom classroom = getClassroomById(classId);
        Subject subject = getSubjectById(subjectId);
        Teacher teacher = getTeacherById(teacherId);

        ClassSubjectTeacher cst = classSubjectTeacherRepository
                .findByClassroom_ClassIdAndSubject_SubjectId(classId, subjectId)
                .orElse(ClassSubjectTeacher.builder()
                        .classroom(classroom)
                        .subject(subject)
                        .build());

        cst.setTeacher(teacher);
        classSubjectTeacherRepository.save(cst);
    }

    @Override
    @Transactional
    public void removeSubjectTeacher(Long classId, Long subjectId) {
        ClassSubjectTeacher cst = classSubjectTeacherRepository
                .findByClassroom_ClassIdAndSubject_SubjectId(classId, subjectId)
                .orElseThrow(() -> new ApiException(ErrorCode.SUBJECT_NOT_FOUND));
        cst.setTeacher(null);
        classSubjectTeacherRepository.save(cst);
    }

    // ===== Quản lý môn học =====

    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public Subject getSubjectById(Long subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ApiException(ErrorCode.SUBJECT_NOT_FOUND));
    }

    @Override
    @Transactional
    public Subject createSubject(SubjectRequest request) {
        if (subjectRepository.findBySubjectname(request.getSubjectName()).isPresent()) {
            throw new ApiException(ErrorCode.SUBJECT_EXISTS);
        }
        Subject subject = Subject.builder()
                .subjectname(request.getSubjectName())
                .description(request.getDescription())
                .build();
        return subjectRepository.save(subject);
    }

    @Override
    @Transactional
    public Subject updateSubject(Long subjectId, SubjectRequest request) {
        Subject subject = getSubjectById(subjectId);
        subject.setSubjectname(request.getSubjectName());
        subject.setDescription(request.getDescription());
        return subjectRepository.save(subject);
    }

    @Override
    @Transactional
    public void deleteSubject(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new ApiException(ErrorCode.SUBJECT_NOT_FOUND);
        }
        subjectRepository.deleteById(subjectId);
    }

    // ===== Quản lý lịch học =====

    @Override
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @Override
    public List<Schedule> getSchedulesByClass(Long classId) {
        return scheduleRepository.findByClassroom_ClassId(classId);
    }

    @Override
    @Transactional
    public Schedule createSchedule(ScheduleRequest request) {
        Classroom classroom = classroomRepository.findById(request.getClassId())
                .orElseThrow(() -> new ApiException(ErrorCode.CLASSROOM_NOT_FOUND));

        // Teacher có thể null (tiết Chào cờ không cần GV)
        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ApiException(ErrorCode.TEACHER_NOT_FOUND));
        }

        com.example.student_service.enums.Day day = com.example.student_service.enums.Day.valueOf(request.getDay());
        Integer period = request.getPeriod();

        // Kiểm tra trùng lịch lớp: cùng lớp, cùng ngày, cùng tiết
        scheduleRepository.findByClassroom_ClassIdAndDayAndPeriod(request.getClassId(), day, period)
                .ifPresent(s -> { throw new ApiException(ErrorCode.SCHEDULE_CLASS_CONFLICT); });

        // Kiểm tra trùng lịch giáo viên: cùng GV, cùng ngày, cùng tiết (chỉ khi có GV)
        if (request.getTeacherId() != null) {
            scheduleRepository.findByTeacher_IdAndDayAndPeriod(request.getTeacherId(), day, period)
                    .ifPresent(s -> { throw new ApiException(ErrorCode.SCHEDULE_TEACHER_CONFLICT); });
        }

        // Môn có thể null (tiết Sinh hoạt lớp / Chào cờ)
        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ApiException(ErrorCode.SUBJECT_NOT_FOUND));
        }

        Schedule schedule = new Schedule();
        schedule.setDay(day);
        schedule.setPeriod(period);
        schedule.setClassroom(classroom);
        schedule.setSubject(subject);
        schedule.setTeacher(teacher);
        schedule.setScheduleType(request.getScheduleType());
        return scheduleRepository.save(schedule);
    }

    @Override
    @Transactional
    public Schedule updateSchedule(Long scheduleId, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ApiException(ErrorCode.SCHEDULE_NOT_FOUND));
        Classroom classroom = classroomRepository.findById(request.getClassId())
                .orElseThrow(() -> new ApiException(ErrorCode.CLASSROOM_NOT_FOUND));

        // Teacher có thể null (tiết Chào cờ không cần GV)
        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ApiException(ErrorCode.TEACHER_NOT_FOUND));
        }

        com.example.student_service.enums.Day day = com.example.student_service.enums.Day.valueOf(request.getDay());
        Integer period = request.getPeriod();

        // Kiểm tra trùng lịch lớp (bỏ qua chính nó)
        scheduleRepository.findByClassroom_ClassIdAndDayAndPeriod(request.getClassId(), day, period)
                .ifPresent(s -> { if (!s.getScheduleId().equals(scheduleId)) throw new ApiException(ErrorCode.SCHEDULE_CLASS_CONFLICT); });

        // Kiểm tra trùng lịch giáo viên (bỏ qua chính nó, chỉ khi có GV)
        if (request.getTeacherId() != null) {
            scheduleRepository.findByTeacher_IdAndDayAndPeriod(request.getTeacherId(), day, period)
                    .ifPresent(s -> { if (!s.getScheduleId().equals(scheduleId)) throw new ApiException(ErrorCode.SCHEDULE_TEACHER_CONFLICT); });
        }

        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ApiException(ErrorCode.SUBJECT_NOT_FOUND));
        }

        schedule.setDay(day);
        schedule.setPeriod(period);
        schedule.setClassroom(classroom);
        schedule.setSubject(subject);
        schedule.setTeacher(teacher);
        schedule.setScheduleType(request.getScheduleType());
        return scheduleRepository.save(schedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long scheduleId) {
        if (!scheduleRepository.existsById(scheduleId)) {
            throw new ApiException(ErrorCode.SCHEDULE_NOT_FOUND);
        }
        scheduleRepository.deleteById(scheduleId);
    }
}
