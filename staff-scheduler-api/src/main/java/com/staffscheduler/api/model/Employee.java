package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_department", columnList = "department"),
    @Index(name = "idx_role", columnList = "role"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_name", columnList = "name")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @NotBlank(message = "Role is required")
    @Column(nullable = false, length = 50)
    private String role;

    @Column(length = 100)
    private String department;

    @DecimalMin(value = "0.00", message = "Hourly rate must be >= 0.00")
    @DecimalMax(value = "999.99", message = "Hourly rate must be <= 999.99")
    @Column(name = "hourly_rate", precision = 6, scale = 2)
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @NotNull(message = "Max hours is required")
    @Min(value = 1, message = "Max hours must be at least 1")
    @Max(value = 168, message = "Max hours cannot exceed 168")
    @Column(nullable = false)
    private Integer maxHours;

    @Column(length = 20)
    private String status = "active"; // active, inactive

    @Column(length = 5)
    private String avatar;

    @Column(length = 50)
    private String color;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "pos_id")
    private Long posId;

    @Column(name = "is_manager", nullable = false)
    private Boolean isManager = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "active";
        }
        if (isManager == null) {
            isManager = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
