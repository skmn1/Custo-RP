package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_experience",
       indexes = @Index(name = "idx_experience_employee", columnList = "employee_id,sort_order"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeExperience {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "position_title", nullable = false, length = 200)
    private String positionTitle;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = false;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

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
