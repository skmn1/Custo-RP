package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_categories", indexes = {
    @Index(name = "idx_stock_categories_parent", columnList = "parent_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name_fr", nullable = false, length = 100)
    private String nameFr;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

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
