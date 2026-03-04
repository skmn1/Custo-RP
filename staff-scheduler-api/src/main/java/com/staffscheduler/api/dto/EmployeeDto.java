package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Employee profile")
public class EmployeeDto {
    @Schema(description = "Unique employee ID (auto-generated on create)", example = "emp-1", accessMode = Schema.AccessMode.READ_ONLY)
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    @Schema(description = "Full name", example = "Maria Papadopoulou", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotBlank(message = "Role is required")
    @Schema(description = "Job role/title", example = "Chef", requiredMode = Schema.RequiredMode.REQUIRED)
    private String role;

    @Schema(description = "Avatar initials (auto-generated if omitted)", example = "MP")
    private String avatar;

    @Schema(description = "Display color hex code (auto-generated if omitted)", example = "#3B82F6")
    private String color;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address (must be unique)", example = "maria.p@restaurant.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotNull(message = "Max hours is required")
    @Min(1) @Max(168)
    @Schema(description = "Maximum weekly working hours", example = "40", minimum = "1", maximum = "168", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer maxHours;

    @Schema(description = "Assigned PoS location ID (null if unassigned)", example = "1")
    private Long posId;

    @Schema(description = "Whether the employee is a manager", example = "false")
    private Boolean isManager;
}
