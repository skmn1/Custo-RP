package com.staffscheduler.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShiftTypeDto {
    private UUID id;
    private String nameEn;
    private String nameFr;
    private String defaultStart;
    private BigDecimal durationHours;
    private String color;
    private Boolean active;
}
