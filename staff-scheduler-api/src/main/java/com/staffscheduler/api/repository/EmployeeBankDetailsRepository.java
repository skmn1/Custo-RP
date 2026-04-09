package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.EmployeeBankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeBankDetailsRepository extends JpaRepository<EmployeeBankDetails, String> {

    Optional<EmployeeBankDetails> findByEmployeeId(String employeeId);

    void deleteByEmployeeId(String employeeId);
}
