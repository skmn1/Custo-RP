package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * ShiftSwapRequest — Task 87
 *
 * Represents a 1-to-1 direct shift swap between two employees.
 * Flow: pending_peer → pending_manager (peer accepted) → approved/rejected (manager)
 *       pending_peer → peer_declined   (terminal)
 *       pending_peer → cancelled       (requester cancelled)
 */
@Entity
@Table(name = "shift_swap_requests", indexes = {
    @Index(name = "idx_swap_requester", columnList = "requester_id"),
    @Index(name = "idx_swap_recipient", columnList = "recipient_id"),
    @Index(name = "idx_swap_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShiftSwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "requester_id", nullable = false, length = 50)
    private String requesterId;

    @Column(name = "requester_shift_id", nullable = false, length = 80)
    private String requesterShiftId;

    @Column(name = "recipient_id", nullable = false, length = 50)
    private String recipientId;

    @Column(name = "recipient_shift_id", nullable = false, length = 80)
    private String recipientShiftId;

    @Column(name = "swap_type", nullable = false, length = 20)
    private String swapType = "direct";

    @Column(nullable = false, length = 20)
    private String status = "pending_peer";

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "accepted_by")
    private UUID acceptedBy;

    @Column(name = "accepted_at")
    private OffsetDateTime acceptedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
