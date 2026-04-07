package com.staffscheduler.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_lines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrderLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(length = 255)
    private String description;

    @Column(name = "qty_ordered", nullable = false, precision = 10, scale = 4)
    private BigDecimal qtyOrdered;

    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "qty_received", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal qtyReceived = BigDecimal.ZERO;

    @Column(name = "line_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lineTotal = BigDecimal.ZERO;
}
