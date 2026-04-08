package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pos_terminal_incidents", indexes = {
    @Index(name = "idx_terminal_incidents_terminal", columnList = "terminal_id"),
    @Index(name = "idx_terminal_incidents_status", columnList = "terminal_id, status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosTerminalIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "terminal_id", nullable = false)
    private Long terminalId;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String category;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String severity = "medium";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "open";

    @Column(name = "declared_by", nullable = false)
    private Long declaredBy;

    @Column(name = "declared_by_name", length = 100)
    private String declaredByName;

    @Column(name = "declared_at")
    @Builder.Default
    private Instant declaredAt = Instant.now();

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "assigned_to_name", length = 100)
    private String assignedToName;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "resolved_by_name", length = 100)
    private String resolvedByName;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    private void onCreate() {
        if (declaredAt == null) declaredAt = Instant.now();
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = Instant.now();
    }

    public static final String[] VALID_CATEGORIES = {
        "hardware", "software", "connectivity", "payment", "power", "safety", "other"
    };

    public static final String[] VALID_SEVERITIES = {"low", "medium", "high", "critical"};

    public static final String[] VALID_STATUSES = {"open", "in_progress", "resolved", "closed"};
}
