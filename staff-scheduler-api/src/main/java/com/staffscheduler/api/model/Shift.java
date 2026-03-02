package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "shifts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shift {

    @Id
    @Column(length = 80)
    private String id;

    @NotBlank(message = "Employee ID is required")
    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;

    /** Day-of-week index (0=Monday .. 6=Sunday), derived from date */
    @Column(name = "day_index", nullable = false)
    private Integer dayIndex;

    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Start time must be in HH:mm format")
    @Column(name = "start_time", nullable = false, length = 5)
    private String startTime;

    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "End time must be in HH:mm format")
    @Column(name = "end_time", nullable = false, length = 5)
    private String endTime;

    @Column(nullable = false)
    private Double duration;

    @Column(length = 30)
    private String type;

    @Column(length = 80)
    private String color;

    @Column(length = 50)
    private String department;

    @PrePersist
    @PreUpdate
    private void computeDerivedFields() {
        if (date != null) {
            // java.time DayOfWeek: MONDAY=1 ... SUNDAY=7  →  our 0=Mon .. 6=Sun
            this.dayIndex = date.getDayOfWeek().getValue() - 1;
        }
        if (startTime != null && endTime != null && duration == null) {
            this.duration = calculateDuration(startTime, endTime);
        }
    }

    public static double calculateDuration(String start, String end) {
        int sh = Integer.parseInt(start.split(":")[0]);
        int sm = Integer.parseInt(start.split(":")[1]);
        int eh = Integer.parseInt(end.split(":")[0]);
        int em = Integer.parseInt(end.split(":")[1]);
        double startMins = sh * 60.0 + sm;
        double endMins = eh * 60.0 + em;
        double diff = endMins - startMins;
        if (diff <= 0) diff += 24 * 60; // overnight
        return diff / 60.0;
    }
}
