package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    List<AttendanceRecord> findByEmployeeIdAndDateBetweenOrderByDateDesc(
            String employeeId, LocalDate from, LocalDate to);

    List<AttendanceRecord> findByEmployeeIdAndDateBetweenAndStatusOrderByDateDesc(
            String employeeId, LocalDate from, LocalDate to, String status);

    @Query("SELECT a.status, COUNT(a) FROM AttendanceRecord a " +
           "WHERE a.employeeId = :employeeId AND a.date BETWEEN :from AND :to " +
           "GROUP BY a.status")
    List<Object[]> countByStatusForEmployee(
            @Param("employeeId") String employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(a.actualHours), 0), COALESCE(SUM(a.overtimeHours), 0) " +
           "FROM AttendanceRecord a " +
           "WHERE a.employeeId = :employeeId AND a.date BETWEEN :from AND :to")
    List<Object[]> sumHoursForEmployee(
            @Param("employeeId") String employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
