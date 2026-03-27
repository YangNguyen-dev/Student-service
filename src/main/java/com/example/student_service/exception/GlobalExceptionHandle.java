package com.example.student_service.exception;

import com.example.student_service.api.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandle {

    @ExceptionHandler(value = ApiException.class)
    ResponseEntity<ApiResponse<?>> handlingApiException(ApiException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse<?> response = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse<?>> handlingException(Exception exception) {
        log.error("Unexpected error occurred: ", exception);
        ApiResponse<?> response = ApiResponse.builder()
                .code(ErrorCode.UNCATEGORIZED_EXIT.getCode())
                .message(ErrorCode.UNCATEGORIZED_EXIT.getMessage())
                .build();
        return ResponseEntity.internalServerError().body(response);
    }
}
