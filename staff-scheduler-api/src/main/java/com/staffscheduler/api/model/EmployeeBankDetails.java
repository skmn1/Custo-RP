package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_bank_details",
       uniqueConstraints = @UniqueConstraint(name = "uk_bank_employee",
                                             columnNames = "employee_id"),
       indexes = @Index(name = "idx_bank_employee", columnList = "employee_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeBankDetails {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "bank_name", nullable = false, length = 200)
    private String bankName;

    @Column(nullable = false, length = 34)
    private String iban;

    @Column(length = 11)
    private String bic;

    @Column(name = "account_holder", nullable = false, length = 200)
    private String accountHolder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

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
