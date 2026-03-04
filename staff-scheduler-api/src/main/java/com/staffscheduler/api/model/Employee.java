package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "employees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Role is required")
    @Column(nullable = false, length = 50)
    private String role;

    @Column(length = 10)
    private String avatar;

    @Column(length = 30)
    private String color;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotNull(message = "Max hours is required")
    @Min(value = 1, message = "Max hours must be at least 1")
    @Max(value = 168, message = "Max hours cannot exceed 168")
    @Column(nullable = false)
    private Integer maxHours;

    @Column(name = "pos_id")
    private Long posId;

    @Column(name = "is_manager", nullable = false)
    private Boolean isManager = false;
}
