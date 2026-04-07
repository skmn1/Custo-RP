package com.staffscheduler.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovementDto {
    private UUID id;
    private UUID itemId;
    private String itemName;
    private String itemSku;
    private UUID locationId;
    private String locationName;
    private UUID batchId;
    private String movementType;
    private BigDecimal qtyChange;
    private BigDecimal unitCost;
    private String referenceType;
    private UUID referenceId;
    private String note;
    private UUID performedBy;
    private String performedByName;
    private LocalDateTime performedAt;
}
