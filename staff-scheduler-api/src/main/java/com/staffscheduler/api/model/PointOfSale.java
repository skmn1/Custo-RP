package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "point_of_sale")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PointOfSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Address is required")
    @Column(nullable = false, length = 255)
    private String address;

    @NotBlank(message = "Type is required")
    @Column(nullable = false, length = 20)
    private String type;

    @Column(length = 20)
    private String phone;

    @Column(name = "manager_id", length = 50)
    private String managerId;

    @Column(name = "manager_name", length = 100)
    private String managerName;

    /** Opening hours stored as JSON text */
    @Column(name = "opening_hours", columnDefinition = "TEXT")
    private String openingHoursJson;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    private void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = Instant.now();
    }
}
