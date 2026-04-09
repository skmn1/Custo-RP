package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.PaySlip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaySlipRepository extends JpaRepository<PaySlip, String> {

    /** Paginated list for a single employee, newest first. */
    Page<PaySlip> findByEmployeeIdOrderByPeriodEndDesc(String employeeId, Pageable pageable);

    /** Paginated list filtered by employee + year, newest first. */
    Page<PaySlip> findByEmployeeIdAndPeriodYearOrderByPeriodEndDesc(
            String employeeId, Integer periodYear, Pageable pageable);

    /** Most recent payslip for an employee. */
    Optional<PaySlip> findFirstByEmployeeIdOrderByPeriodEndDesc(String employeeId);

    /** Find a specific payslip ensuring it belongs to the given employee. */
    Optional<PaySlip> findByIdAndEmployeeId(String id, String employeeId);
}
