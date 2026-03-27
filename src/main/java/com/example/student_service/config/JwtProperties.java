package com.example.student_service.config;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class JwtProperties {
    String signerKey;
    long accessTokenExpirationMs = 60;
    long refreshTokenExpirationMs = 7;
}
