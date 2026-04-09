package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Minimal leave request model to support the ESS schedule leave overlay.
 *
 * This is a stub implementation created for task 49.  The full leave
 * management feature (leave request workflow, approval process, balance
 * tracking) will be delivered in task 44.  The columns here are designed
 * to be a subset of what task 44 will produce so migrations can extend
 * rather than replace this table.
 */
@Entity
@Table(name = "leave_requests", indexes = {
    @Index(name = "idx_leave_employee_id", columnList = "employee_id"),
    @Index(name = "idx_leave_status", columnList = "status"),
    @Index(name = "idx_leave_dates", columnList = "start_date,end_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequest {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** Total calendar days — inclusive of start and end. */
    @Column(name = "total_days")
    private Integer totalDays;

    /** Human-readable label, e.g. "Annual Leave", "Sick Leave". */
    @Column(name = "leave_type", length = 80)
    private String leaveType;

    /** Display colour as a hex string, e.g. "#3B82F6". */
    @Column(length = 20)
    private String color;

    /**
     * Workflow status: "pending" | "approved" | "rejected".
     * Only "approved" records are shown on the ESS schedule.
     */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (totalDays == null && startDate != null && endDate != null) {
            totalDays = (int) (endDate.toEpochDay() - startDate.toEpochDay() + 1);
        }
    }
}
