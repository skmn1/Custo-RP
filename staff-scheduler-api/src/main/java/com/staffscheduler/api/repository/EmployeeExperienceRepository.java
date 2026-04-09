package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.EmployeeExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeExperienceRepository extends JpaRepository<EmployeeExperience, String> {

    List<EmployeeExperience> findByEmployeeIdOrderBySortOrderAsc(String employeeId);

    Optional<EmployeeExperience> findByIdAndEmployeeId(String id, String employeeId);

    long countByEmployeeId(String employeeId);

    void deleteByIdAndEmployeeId(String id, String employeeId);
}
