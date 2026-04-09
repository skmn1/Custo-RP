package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_qualifications",
       indexes = {
           @Index(name = "idx_qualifications_employee", columnList = "employee_id"),
           @Index(name = "idx_qualifications_expiry", columnList = "expiry_date")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeQualification {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "issuing_body", length = 200)
    private String issuingBody;

    @Column(name = "date_obtained")
    private LocalDate dateObtained;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "credential_number", length = 100)
    private String credentialNumber;

    @Column(name = "document_key", length = 500)
    private String documentKey;

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
