package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "stocktake_counts", indexes = {
    @Index(name = "idx_stocktake_counts_session", columnList = "session_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StocktakeCount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "system_qty", precision = 10, scale = 4)
    private BigDecimal systemQty;

    @Column(name = "counted_qty", precision = 10, scale = 4)
    private BigDecimal countedQty;

    @Column(name = "adjustment_qty", precision = 10, scale = 4)
    private BigDecimal adjustmentQty;
}
