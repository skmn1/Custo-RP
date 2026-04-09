package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records",
       uniqueConstraints = @UniqueConstraint(name = "uk_attendance_emp_date",
                                             columnNames = {"employee_id", "date"}),
       indexes = {
           @Index(name = "idx_attendance_employee", columnList = "employee_id"),
           @Index(name = "idx_attendance_date", columnList = "date"),
           @Index(name = "idx_attendance_status", columnList = "status"),
           @Index(name = "idx_attendance_emp_date", columnList = "employee_id,date")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRecord {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    /** present | absent | late | half_day | on_leave | holiday */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "scheduled_start")
    private LocalTime scheduledStart;

    @Column(name = "scheduled_end")
    private LocalTime scheduledEnd;

    @Column(name = "actual_start")
    private LocalTime actualStart;

    @Column(name = "actual_end")
    private LocalTime actualEnd;

    @Column(name = "scheduled_hours")
    private Double scheduledHours;

    @Column(name = "actual_hours")
    private Double actualHours;

    @Column(name = "overtime_hours")
    private Double overtimeHours;

    @Column(name = "leave_request_id", length = 80)
    private String leaveRequestId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
