package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pos_assignments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_pos_assignments_user_location",
                      columnNames = {"user_id", "pos_location_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "pos_location_id", nullable = false)
    private Long posLocationId;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) assignedAt = LocalDateTime.now();
    }
}
