package com.staffscheduler.api.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockLocationDto {
    private UUID id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer sortOrder;
}
