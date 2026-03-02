package com.staffscheduler.api.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShiftDto {
    private String id;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    /** ISO date (YYYY-MM-DD) */
    private String date;

    /** Day-of-week index 0=Mon .. 6=Sun (frontend compat) */
    private Integer day;

    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Invalid time format")
    private String startTime;

    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Invalid time format")
    private String endTime;

    private Double duration;
    private String type;
    private String color;
    private String department;
}
