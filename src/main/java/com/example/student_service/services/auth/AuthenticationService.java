package com.example.student_service.services.auth;

import com.example.student_service.config.JwtProperties;
import com.example.student_service.dtos.request.LoginRequest;
import com.example.student_service.dtos.request.RegisterRequest;
import com.example.student_service.dtos.response.AuthResponse;
import com.example.student_service.entities.User;
import com.example.student_service.enums.Roles;
import com.example.student_service.exception.ApiException;
import com.example.student_service.exception.ErrorCode;
import com.example.student_service.mapper.UserMapper;
import com.example.student_service.repositories.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.HashSet;

@Slf4j
@Service
@Data
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationService implements AuthenticationServiceImp {
    UserRepository repo;
    UserMapper mapper;
    JwtProperties jwtProperties;


    public AuthResponse register(RegisterRequest request){
        if (repo.existsByUsername(request.getUsername())) throw new ApiException(ErrorCode.USER_EXISTS);
        User user = mapper.toUser(request);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<String> roles = new HashSet<>();
        roles.add(Roles.GUEST.name());

        user.setRoles(roles);

        return mapper.toUserResponse(repo.save(user));
    }

    public AuthResponse login(LoginRequest request){
        User user = repo.findByUsername(request.getUsername())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if (!user.getPassword().equals(request.getPassword()))
            throw new ApiException(ErrorCode.INVALID_PASSWORD);

        String token = generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .build();
    }


    private String generateToken(User user) {
        JWSHeader jwtheader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("yangd")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, java.time.temporal.ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("id", user.getId())
                .claim("username", user.getUsername())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwtheader, payload);

        try {
            jwsObject.sign(new MACSigner(jwtProperties.getSignerKey().getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }
}
