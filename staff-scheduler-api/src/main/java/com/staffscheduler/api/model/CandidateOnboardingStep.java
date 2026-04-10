package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_onboarding_steps", indexes = {
    @Index(name = "idx_cos_candidate", columnList = "candidate_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uq_candidate_step", columnNames = {"candidate_id", "step_def_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateOnboardingStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "step_def_id", nullable = false)
    private Integer stepDefId;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "pending";

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "step_def_id", insertable = false, updatable = false)
    private OnboardingStepDefinition stepDefinition;
}
