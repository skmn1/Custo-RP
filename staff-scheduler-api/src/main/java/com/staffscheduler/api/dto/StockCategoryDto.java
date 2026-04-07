package com.staffscheduler.api.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockCategoryDto {
    private UUID id;
    private String nameEn;
    private String nameFr;
    private UUID parentId;
    private Integer sortOrder;
    private Boolean isActive;
    private List<StockCategoryDto> children;
}
