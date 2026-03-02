package com.staffscheduler.api.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShiftMoveDto {
    private String employeeId;
    /** ISO date string (YYYY-MM-DD) or day index */
    private String date;
    private Integer day;
}
