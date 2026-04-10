package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.OnboardingStepDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnboardingStepDefinitionRepository extends JpaRepository<OnboardingStepDefinition, Integer> {

    List<OnboardingStepDefinition> findAllByOrderBySortOrderAsc();
}
