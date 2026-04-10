package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Records the outcome of each offline-sync replay attempt.
 * Written by POST /api/ess/sync/replay and read by GET /api/ess/sync/status.
 */
@Entity
@Table(name = "offline_sync_log",
       indexes = {
           @Index(name = "idx_sync_log_employee", columnList = "employee_id, synced_at DESC")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfflineSyncLog {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "operation_type", nullable = false, length = 50)
    private String operationType;

    @Column(name = "endpoint", length = 200)
    private String endpoint;

    @Column(name = "method", length = 10)
    private String method;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "queued_at")
    private LocalDateTime queuedAt;

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @Column(name = "error_detail", columnDefinition = "TEXT")
    private String errorDetail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (status == null) status = "synced";
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (syncedAt == null) syncedAt = LocalDateTime.now();
    }
}
