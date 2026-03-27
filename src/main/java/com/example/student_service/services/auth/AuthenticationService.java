package com.example.student_service.services.auth;

import com.example.student_service.config.JwtProperties;
import com.example.student_service.dtos.request.ChangePasswordRequest;
import com.example.student_service.dtos.request.LoginRequest;
import com.example.student_service.dtos.request.RegisterRequest;
import com.example.student_service.dtos.response.AuthResponse;
import com.example.student_service.entities.*;
import com.example.student_service.enums.Roles;
import com.example.student_service.exception.ApiException;
import com.example.student_service.exception.ErrorCode;
import com.example.student_service.mapper.UserMapper;
import com.example.student_service.repositories.*;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Service xử lý xác thực người dùng:
 * - Đăng ký tài khoản mới
 * - Đăng nhập (hỗ trợ username, mã học sinh, mã giáo viên)
 * - Đổi mật khẩu
 * - Tạo và làm mới JWT token (access + refresh)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService implements AuthenticationServiceImp {
    UserRepository repo;
    UserMapper mapper;
    JwtProperties jwtProperties;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    StudentRepository studentRepository;
    TeacherRepository teacherRepository;

    /**
     * Đăng ký tài khoản mới.
     * Tự động tạo bản ghi Student/Teacher tương ứng với vai trò.
     */
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra username đã tồn tại chưa
        if (repo.existsByUsername(request.getUsername()))
            throw new ApiException(ErrorCode.USER_EXISTS);

        User user = mapper.toUser(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Xác định vai trò từ request, mặc định là STUDENT
        Roles roleName = Roles.STUDENT;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                roleName = Roles.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ApiException(ErrorCode.INVALID_ROLE);
            }
        }
        final Roles finalRoleName = roleName;

        // Tìm hoặc tạo mới Role trong DB
        Role assignedRole = roleRepository.findByName(finalRoleName)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(finalRoleName).build()
                ));

        UserRole userRole = UserRole.builder().user(user).role(assignedRole).build();
        user.setUserRoles(new ArrayList<>(List.of(userRole)));

        User savedUser = repo.save(user);

        // Tự động tạo bản ghi Student hoặc Teacher
        if (finalRoleName == Roles.STUDENT) {
            studentRepository.save(Student.builder()
                    .user(savedUser)
                    .studentCode("STU" + savedUser.getUserId())
                    .build());
        } else if (finalRoleName == Roles.TEACHER) {
            teacherRepository.save(Teacher.builder()
                    .user(savedUser)
                    .teacherCode("TCH" + savedUser.getUserId())
                    .build());
        }

        // Tạo cặp token (access + refresh)
        String token = generateToken(savedUser);
        String refreshTk = generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshTk)
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .role(finalRoleName.name())
                .build();
    }

    /**
     * Đăng nhập.
     * Hỗ trợ đăng nhập bằng: username, mã học sinh (STUxxx), mã giáo viên (TCHxxx).
     */
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername();

        // Tìm user theo username
        User user = repo.findByUsername(identifier).orElse(null);

        // Không tìm thấy → thử theo mã học sinh
        if (user == null) {
            user = studentRepository.findByStudentCode(identifier)
                    .map(Student::getUser).orElse(null);
        }

        // Vẫn không tìm thấy → thử theo mã giáo viên
        if (user == null) {
            user = teacherRepository.findByTeacherCode(identifier)
                    .map(Teacher::getUser).orElse(null);
        }

        if (user == null) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }

        // Xác thực mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new ApiException(ErrorCode.INVALID_PASSWORD);

        // Tạo cặp token
        String token = generateToken(user);
        String refreshTk = generateRefreshToken(user);

        String role = user.getUserRoles().stream()
                .findFirst()
                .map(ur -> ur.getRole().getName().name())
                .orElse(null);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshTk)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(role)
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Tạo Access Token (JWT).
     * Thời hạn: theo cấu hình accessTokenExpirationMs (phút).
     * Chứa: userId, username, role, type=access.
     */
    private String generateToken(User user) {
        String role = user.getUserRoles().stream()
                .findFirst()
                .map(ur -> ur.getRole().getName().name())
                .orElse("GUEST");

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(user.getUserId()))
                .issuer("yangd")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(jwtProperties.getAccessTokenExpirationMs(), ChronoUnit.MINUTES).toEpochMilli()
                ))
                .claim("id", user.getUserId())
                .claim("username", user.getUsername())
                .claim("role", role)
                .claim("type", "access")
                .build();

        return signJwt(claimsSet);
    }

    /**
     * Tạo Refresh Token (JWT).
     * Thời hạn: theo cấu hình refreshTokenExpirationMs (giờ).
     * Chỉ chứa: userId, type=refresh. Không chứa role/username.
     */
    private String generateRefreshToken(User user) {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(user.getUserId()))
                .issuer("yangd")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(jwtProperties.getRefreshTokenExpirationMs(), ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("type", "refresh")
                .build();

        return signJwt(claimsSet);
    }

    /**
     * Ký JWT bằng thuật toán HS512 với secret key.
     */
    private String signJwt(JWTClaimsSet claimsSet) {
        try {
            JWSObject jwsObject = new JWSObject(
                    new JWSHeader(JWSAlgorithm.HS512),
                    new Payload(claimsSet.toJSONObject())
            );
            jwsObject.sign(new MACSigner(jwtProperties.getSignerKey().getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Không thể tạo JWT token", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Làm mới token bằng refresh token.
     * Xác thực refresh token → tạo cặp access + refresh token mới.
     */
    public AuthResponse refreshToken(String refreshTokenStr) {
        try {
            // Phân tích và xác thực chữ ký
            JWSObject jwsObject = JWSObject.parse(refreshTokenStr);
            if (!jwsObject.verify(new MACVerifier(jwtProperties.getSignerKey().getBytes()))) {
                throw new ApiException(ErrorCode.INVALID_PASSWORD);
            }

            JWTClaimsSet claims = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());

            // Kiểm tra hết hạn
            if (claims.getExpirationTime().before(new Date())) {
                throw new ApiException(ErrorCode.INVALID_PASSWORD);
            }

            // Kiểm tra loại token phải là "refresh"
            String type = (String) claims.getClaim("type");
            if (!"refresh".equals(type)) {
                throw new ApiException(ErrorCode.INVALID_PASSWORD);
            }

            // Tìm user và tạo token mới
            Long userId = Long.parseLong(claims.getSubject());
            User user = repo.findById(userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

            String role = user.getUserRoles().stream()
                    .findFirst()
                    .map(ur -> ur.getRole().getName().name())
                    .orElse(null);

            return AuthResponse.builder()
                    .token(generateToken(user))
                    .refreshToken(generateRefreshToken(user))
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .role(role)
                    .avatarUrl(user.getAvatarUrl())
                    .build();

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi làm mới token", e);
            throw new ApiException(ErrorCode.INVALID_PASSWORD);
        }
    }

    /**
     * Đổi mật khẩu cho người dùng đã đăng nhập.
     */
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // Xác thực mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException(ErrorCode.INVALID_PASSWORD);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        repo.save(user);
    }
}
