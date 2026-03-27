package com.example.student_service.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 150)
    String username;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    String email;

    @Column(name = "full_name", length = 255)
    String fullName;

    @Column(name = "avatar_url", length = 500)
    String avatarUrl;

    @Column(name = "password_hash", nullable = false)
    String passwordHash;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    List<UserRole> userRoles = new ArrayList<>();
}