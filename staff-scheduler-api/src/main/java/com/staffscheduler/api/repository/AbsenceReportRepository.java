package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.AbsenceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AbsenceReportRepository extends JpaRepository<AbsenceReport, UUID> {

    List<AbsenceReport> findByEmployeeIdOrderByAbsenceDateDesc(UUID employeeId);

    List<AbsenceReport> findByEmployeeIdAndAbsenceDateBetweenOrderByAbsenceDateDesc(
            UUID employeeId, LocalDate from, LocalDate to);

    boolean existsByEmployeeIdAndAbsenceDate(UUID employeeId, LocalDate absenceDate);

    /** Count sick absences in a rolling window for cert_required policy */
    @Query("SELECT COUNT(a) FROM AbsenceReport a WHERE a.employeeId = :empId "
         + "AND a.absenceType = 'sick' AND a.absenceDate >= :since AND a.status <> 'cancelled'")
    long countSickInWindow(UUID empId, LocalDate since);

    /** All reported/disputed — for HR inbox */
    @Query("SELECT a FROM AbsenceReport a WHERE a.status IN ('reported', 'disputed') ORDER BY a.createdAt DESC")
    List<AbsenceReport> findOpenReports();

    /** All absence reports (paginated support via list) */
    List<AbsenceReport> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
}
