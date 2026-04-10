package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Per-employee, per-category notification preferences.
 * Controls in-app feed visibility and web-push delivery per category.
 *
 * Task 60 — Web Push Notifications
 */
@Entity
@Table(name = "notification_preferences",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_notif_pref_employee_category",
           columnNames = {"employee_id", "category"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {

    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "in_app_enabled", nullable = false)
    private boolean inAppEnabled = true;

    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled = true;

    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
