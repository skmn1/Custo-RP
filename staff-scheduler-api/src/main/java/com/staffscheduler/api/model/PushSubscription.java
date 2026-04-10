package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Persists a browser Push Subscription for an ESS employee device/browser.
 * One employee may hold multiple active subscriptions (multiple devices).
 *
 * Task 60 — Web Push Notifications
 */
@Entity
@Table(name = "push_subscriptions",
       indexes = {
           @Index(name = "idx_push_subs_employee", columnList = "employee_id"),
           @Index(name = "idx_push_subs_user",     columnList = "user_id")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PushSubscription {

    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    /** Full push service URL — unique per browser/device */
    @Column(nullable = false, columnDefinition = "TEXT", unique = true)
    private String endpoint;

    /** ECDH P-256 public key (base64url, from PushSubscriptionJSON.keys.p256dh) */
    @Column(name = "p256dh_key", nullable = false, columnDefinition = "TEXT")
    private String p256dhKey;

    /** HMAC authentication secret (base64url, from PushSubscriptionJSON.keys.auth) */
    @Column(name = "auth_key", nullable = false, columnDefinition = "TEXT")
    private String authKey;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "last_used_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime lastUsedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (lastUsedAt == null) lastUsedAt = OffsetDateTime.now();
    }
}
