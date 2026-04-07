package com.staffscheduler.api.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StocktakeDto {
    private UUID id;
    private UUID locationId;
    private String locationName;
    private LocalDate stocktakeDate;
    private String status;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime finalisedAt;
    private List<CountDto> counts;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CountDto {
        private UUID id;
        private UUID itemId;
        private String itemName;
        private String itemSku;
        private BigDecimal systemQty;
        private BigDecimal countedQty;
        private BigDecimal adjustmentQty;
    }
}
