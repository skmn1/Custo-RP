package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements", indexes = {
    @Index(name = "idx_stock_movements_item", columnList = "item_id"),
    @Index(name = "idx_stock_movements_item_date", columnList = "item_id, performed_at"),
    @Index(name = "idx_stock_movements_type", columnList = "movement_type"),
    @Index(name = "idx_stock_movements_location", columnList = "location_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "batch_id")
    private UUID batchId;

    @Column(name = "movement_type", nullable = false, length = 30)
    private String movementType;

    @Column(name = "qty_change", nullable = false, precision = 10, scale = 4)
    private BigDecimal qtyChange;

    @Column(name = "unit_cost", precision = 10, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "performed_by")
    private UUID performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @PrePersist
    protected void onCreate() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
    }
}
