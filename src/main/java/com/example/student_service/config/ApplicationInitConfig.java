package com.example.student_service.config;

import com.example.student_service.entities.Role;
import com.example.student_service.entities.User;
import com.example.student_service.entities.UserRole;
import com.example.student_service.enums.Roles;
import com.example.student_service.repositories.RoleRepository;
import com.example.student_service.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository repo, RoleRepository roleRepository) {
        return args -> {
            Role adminRole = roleRepository.findByName(Roles.ADMIN)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(Roles.ADMIN).build()));

            if (!repo.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("duonghoangfc6@gmail.com")
                        .passwordHash(passwordEncoder.encode("admin"))
                        .build();

                repo.save(admin);

                UserRole adminUserRole = UserRole.builder()
                        .user(admin)
                        .role(adminRole)
                        .build();

                admin.setUserRoles(List.of(adminUserRole));
                repo.save(admin);
            }
        };
    }
}
