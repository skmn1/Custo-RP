package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks field-level change requests submitted by employees.
 * Bank detail fields use the 'bank_' prefix; all others target the employees table.
 */
@Entity
@Table(name = "profile_edit_requests",
       indexes = {
           @Index(name = "idx_editreq_employee", columnList = "employee_id"),
           @Index(name = "idx_editreq_status", columnList = "status")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileEditRequest {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "field_label", length = 200)
    private String fieldLabel;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    /** pending | approved | rejected */
    @Column(nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "reviewed_by", length = 50)
    private String reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
