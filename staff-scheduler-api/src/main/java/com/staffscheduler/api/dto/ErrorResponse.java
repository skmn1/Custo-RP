package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Standard error envelope returned for all error responses")
public class ErrorResponse {
    @Schema(description = "Error details")
    private ErrorBody error;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Error body")
    public static class ErrorBody {
        @Schema(description = "Machine-readable error code", example = "NOT_FOUND")
        private String code;
        @Schema(description = "Human-readable error message", example = "Employee not found with id: emp-999")
        private String message;
        @Schema(description = "Validation field errors (present only for VALIDATION_ERROR)")
        private List<FieldError> details;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Individual field validation error")
    public static class FieldError {
        @Schema(description = "Field name that failed validation", example = "email")
        private String field;
        @Schema(description = "Validation error message", example = "Email must be valid")
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
