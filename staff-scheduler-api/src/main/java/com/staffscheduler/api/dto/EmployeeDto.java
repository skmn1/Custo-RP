package com.staffscheduler.api.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeDto {
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Role is required")
    private String role;

    private String avatar;
    private String color;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Max hours is required")
    @Min(1) @Max(168)
    private Integer maxHours;

    @NotBlank(message = "Department is required")
    private String department;

    private Long posId;
    private Boolean isManager;
}
