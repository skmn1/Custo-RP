package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Pay slip entity — one row per employee per pay period.
 *
 * Generated during a pay run (task 37). The ESS portal (task 50)
 * provides scoped read-only access so employees can view their own slip history.
 *
 * Line items (earnings + deductions) are stored as JSON in the `lines_json` column
 * rather than a separate table — this keeps the schema simple and the data
 * self-contained (a payslip is a historical snapshot, not a live calculation).
 */
@Entity
@Table(name = "pay_slips", indexes = {
    @Index(name = "idx_payslip_employee", columnList = "employee_id"),
    @Index(name = "idx_payslip_period", columnList = "period_end DESC"),
    @Index(name = "idx_payslip_employee_year", columnList = "employee_id,period_year")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaySlip {

    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "employee_name", length = 120)
    private String employeeName;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    /** Human-readable period label, e.g. "March 2026" */
    @Column(name = "period_label", length = 60)
    private String periodLabel;

    /** Year extracted from periodEnd for year-based filtering. */
    @Column(name = "period_year", nullable = false)
    private Integer periodYear;

    @Column(name = "worked_hours", precision = 10, scale = 2)
    private BigDecimal workedHours;

    @Column(name = "gross_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossPay;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal netPay;

    @Column(name = "employer_contributions", precision = 12, scale = 2)
    private BigDecimal employerContributions;

    /**
     * JSON string storing line items. Structure:
     * {
     *   "earnings":   [{ "label": "Base Salary", "amount": 3200.00 }, ...],
     *   "deductions":  [{ "label": "Income Tax (IR)", "amount": -385.00 }, ...]
     * }
     */
    @Column(name = "lines_json", columnDefinition = "TEXT")
    private String linesJson;

    /** "paid" | "processing" | "draft" */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /** "direct_deposit" | "cheque" | "cash" */
    @Column(name = "payment_method", length = 30)
    private String paymentMethod;

    @Column(length = 10)
    private String currency;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (periodYear == null && periodEnd != null) {
            periodYear = periodEnd.getYear();
        }
    }
}
