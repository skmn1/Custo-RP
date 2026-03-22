package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Shift schedule entry")
public class ShiftDto {
    @Schema(description = "Unique shift ID (auto-generated on create)", example = "shift-1", accessMode = Schema.AccessMode.READ_ONLY)
    private String id;

    @NotBlank(message = "Employee ID is required")
    @Schema(description = "ID of the assigned employee", example = "emp-1", requiredMode = Schema.RequiredMode.REQUIRED)
    private String employeeId;

    @Schema(description = "ISO 8601 date (YYYY-MM-DD)", example = "2025-06-09")
    private String date;

    @Schema(description = "Day-of-week index: 0=Mon .. 6=Sun (frontend compatibility)", example = "0", minimum = "0", maximum = "6")
    private Integer day;

    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Invalid time format")
    @Schema(description = "Shift start time (24h format HH:mm)", example = "09:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private String startTime;

    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Invalid time format")
    @Schema(description = "Shift end time (24h format HH:mm)", example = "17:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private String endTime;

    @Schema(description = "Duration in hours (auto-calculated)", example = "8.0", accessMode = Schema.AccessMode.READ_ONLY)
    private Double duration;

    @Schema(description = "Shift type", example = "morning", allowableValues = {"morning", "afternoon", "evening", "night", "full"})
    private String type;

    @Schema(description = "Display color (mapped from employee department)", example = "#3B82F6", accessMode = Schema.AccessMode.READ_ONLY)
    private String color;

    @Schema(description = "Department (populated from employee)", example = "Kitchen", accessMode = Schema.AccessMode.READ_ONLY)
    private String department;
}
