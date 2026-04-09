package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.EmployeeQualification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeQualificationRepository extends JpaRepository<EmployeeQualification, String> {

    List<EmployeeQualification> findByEmployeeIdOrderByDateObtainedDesc(String employeeId);

    Optional<EmployeeQualification> findByIdAndEmployeeId(String id, String employeeId);

    long countByEmployeeId(String employeeId);

    void deleteByIdAndEmployeeId(String id, String employeeId);
}
