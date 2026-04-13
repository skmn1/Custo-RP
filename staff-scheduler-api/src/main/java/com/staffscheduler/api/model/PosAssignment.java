package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pos_assignments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_pos_assignments_user_terminal",
                      columnNames = {"user_id", "pos_terminal_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "pos_terminal_id", nullable = false)
    private Long posTerminalId;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) assignedAt = LocalDateTime.now();
    }

    /**
     * Getter for backward compatibility with new naming (posLocationId).
     * Maps to the database column pos_terminal_id.
     */
    public Long getPosLocationId() {
        return this.posTerminalId;
    }

    /**
     * Setter for backward compatibility with new naming (posLocationId).
     * Maps to the database column pos_terminal_id.
     */
    public void setPosLocationId(Long posLocationId) {
        this.posTerminalId = posLocationId;
    }
}
