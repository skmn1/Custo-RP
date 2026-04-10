package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "onboarding_step_definitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OnboardingStepDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = true;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
