package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_items", indexes = {
    @Index(name = "idx_stock_items_sku", columnList = "sku", unique = true),
    @Index(name = "idx_stock_items_category", columnList = "category_id"),
    @Index(name = "idx_stock_items_barcode", columnList = "barcode")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name_en", nullable = false, length = 150)
    private String nameEn;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name_fr", nullable = false, length = 150)
    private String nameFr;

    @Column(name = "category_id")
    private UUID categoryId;

    @Size(max = 20)
    @Column(length = 20)
    @Builder.Default
    private String uom = "each";

    @Size(max = 100)
    @Column(length = 100)
    private String barcode;

    @Column(name = "reorder_point", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reorderPoint = BigDecimal.ZERO;

    @Column(name = "min_level", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minLevel = BigDecimal.ZERO;

    @Column(name = "avg_cost", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal avgCost = BigDecimal.ZERO;

    @Column(name = "sale_price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal salePrice = BigDecimal.ZERO;

    @Column(name = "preferred_supplier_id")
    private UUID preferredSupplierId;

    @Column(name = "location_id")
    private UUID locationId;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_batch_tracked")
    @Builder.Default
    private Boolean isBatchTracked = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
