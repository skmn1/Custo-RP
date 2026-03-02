package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Payload for a drag-and-drop shift move")
public class ShiftMoveDto {
    @Schema(description = "New employee ID to reassign the shift to", example = "emp-3")
    private String employeeId;

    @Schema(description = "New ISO date (YYYY-MM-DD)", example = "2025-06-11")
    private String date;

    @Schema(description = "New day-of-week index (0=Mon..6=Sun)", example = "2", minimum = "0", maximum = "6")
    private Integer day;
}
