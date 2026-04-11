package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * AbsenceReport — Task 87
 *
 * Records unplanned absences (sick, late arrival, emergency, personal, other).
 * Distinct from LeaveRequest which covers pre-approved planned leave.
 */
@Entity
@Table(name = "absence_reports", indexes = {
    @Index(name = "absence_reports_employee_date_idx", columnList = "employee_id,absence_date"),
    @Index(name = "absence_reports_status_idx", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AbsenceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @Column(name = "employee_id", nullable = false)
    private java.util.UUID employeeId;

    @Column(name = "absence_date", nullable = false)
    private LocalDate absenceDate;

    @Column(name = "absence_type", nullable = false, length = 30)
    private String absenceType;

    @Column(name = "expected_start")
    private LocalTime expectedStart;

    @Column(name = "actual_start")
    private LocalTime actualStart;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "cert_required", nullable = false)
    private boolean certRequired;

    @Column(name = "cert_uploaded", nullable = false)
    private boolean certUploaded;

    @Column(name = "cert_file_key", length = 500)
    private String certFileKey;

    @Column(nullable = false, length = 20)
    private String status = "reported";

    @Column(name = "acknowledged_by")
    private java.util.UUID acknowledgedBy;

    @Column(name = "acknowledged_at")
    private OffsetDateTime acknowledgedAt;

    @Column(name = "disputed_by")
    private java.util.UUID disputedBy;

    @Column(name = "disputed_at")
    private OffsetDateTime disputedAt;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

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
