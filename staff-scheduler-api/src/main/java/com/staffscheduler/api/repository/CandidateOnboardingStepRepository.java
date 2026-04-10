package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.CandidateOnboardingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateOnboardingStepRepository extends JpaRepository<CandidateOnboardingStep, UUID> {

    List<CandidateOnboardingStep> findByCandidateIdOrderByStepDefinitionSortOrderAsc(UUID candidateId);

    void deleteByCandidateId(UUID candidateId);
}
