package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_batches", indexes = {
    @Index(name = "idx_stock_batches_item", columnList = "item_id"),
    @Index(name = "idx_stock_batches_expiry", columnList = "expiry_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(name = "lot_number", length = 100)
    private String lotNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "qty_received", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal qtyReceived = BigDecimal.ZERO;

    @Column(name = "qty_remaining", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal qtyRemaining = BigDecimal.ZERO;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) {
            receivedAt = LocalDateTime.now();
        }
    }
}
