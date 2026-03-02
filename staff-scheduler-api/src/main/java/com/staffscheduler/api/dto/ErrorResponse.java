package com.staffscheduler.api.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ErrorResponse {
    private ErrorBody error;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ErrorBody {
        private String code;
        private String message;
        private List<FieldError> details;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FieldError {
        private String field;
        private String message;
    }

    public static ErrorResponse of(String code, String message) {
        return ErrorResponse.builder()
                .error(ErrorBody.builder().code(code).message(message).build())
                .build();
    }

    public static ErrorResponse of(String code, String message, List<FieldError> details) {
        return ErrorResponse.builder()
                .error(ErrorBody.builder().code(code).message(message).details(details).build())
                .build();
    }
}
