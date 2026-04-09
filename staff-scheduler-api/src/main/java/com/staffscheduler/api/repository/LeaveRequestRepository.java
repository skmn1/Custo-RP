package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {

    /** Returns all approved leave entries that overlap the given date range. */
    @Query("SELECT l FROM LeaveRequest l WHERE l.employeeId = :employeeId " +
           "AND l.status = 'approved' " +
           "AND l.endDate >= :from " +
           "AND l.startDate <= :to " +
           "ORDER BY l.startDate ASC")
    List<LeaveRequest> findApprovedForEmployee(
            @Param("employeeId") String employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
