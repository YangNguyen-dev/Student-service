package com.example.student_service.config;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Cấu hình JWT Token.
 * Đọc từ application.yml với prefix "jwt".
 *
 * Ví dụ cấu hình:
 *   jwt:
 *     signer-key: "your-secret-key"
 *     access-token-expiration-ms: 60      # phút
 *     refresh-token-expiration-ms: 1       # giờ
 */
@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class JwtProperties {
    /** Khóa bí mật dùng để ký JWT (HS512) */
    String signerKey;

    /** Thời hạn access token (đơn vị: phút), mặc định 60 phút */
    long accessTokenExpirationMs = 60;

    /** Thời hạn refresh token (đơn vị: giờ), mặc định 1 giờ */
    long refreshTokenExpirationMs = 1;
}
