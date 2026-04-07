package com.staffscheduler.api.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrderDto {
    private UUID id;
    private String poNumber;
    private UUID supplierId;
    private String supplierName;
    private String status;
    private LocalDate expectedDelivery;
    private String currency;
    private String notes;
    private BigDecimal totalAmount;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private List<LineDto> lines;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LineDto {
        private UUID id;
        private UUID itemId;
        private String itemName;
        private String itemSku;
        private String description;
        private BigDecimal qtyOrdered;
        private BigDecimal unitCost;
        private BigDecimal qtyReceived;
        private BigDecimal lineTotal;
    }
}
