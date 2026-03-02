package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, String> {

    List<Shift> findByEmployeeId(String employeeId);

    List<Shift> findByDate(LocalDate date);

    List<Shift> findByDateBetween(LocalDate start, LocalDate end);

    List<Shift> findByEmployeeIdAndDateBetween(String employeeId, LocalDate start, LocalDate end);

    @Query("SELECT s FROM Shift s WHERE " +
           "(:startDate IS NULL OR s.date >= :startDate) " +
           "AND (:endDate IS NULL OR s.date <= :endDate) " +
           "AND (:employeeId IS NULL OR s.employeeId = :employeeId) " +
           "AND (:department IS NULL OR s.department = :department) " +
           "AND (:type IS NULL OR s.type = :type)")
    List<Shift> findFiltered(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("employeeId") String employeeId,
            @Param("department") String department,
            @Param("type") String type);

    void deleteByEmployeeId(String employeeId);
}
