package com.staffscheduler.api.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockBatchDto {
    private UUID id;
    private UUID itemId;
    private UUID locationId;
    private String locationName;
    private String batchNumber;
    private String lotNumber;
    private LocalDate expiryDate;
    private BigDecimal qtyReceived;
    private BigDecimal qtyRemaining;
    private LocalDateTime receivedAt;
}
