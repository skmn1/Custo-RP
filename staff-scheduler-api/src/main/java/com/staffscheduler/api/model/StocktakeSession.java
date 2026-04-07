package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stocktake_sessions", indexes = {
    @Index(name = "idx_stocktake_location", columnList = "location_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StocktakeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "stocktake_date", nullable = false)
    private LocalDate stocktakeDate;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "open";

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "finalised_at")
    private LocalDateTime finalisedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
