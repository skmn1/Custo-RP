package com.staffscheduler.api.controller;

import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.AttendanceRecord;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.model.LeaveRequest;
import com.staffscheduler.api.model.PaySlip;
import com.staffscheduler.api.repository.AppSettingRepository;
import com.staffscheduler.api.repository.AttendanceRecordRepository;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.LeaveRequestRepository;
import com.staffscheduler.api.repository.PaySlipRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import com.staffscheduler.api.repository.UserRepository;
import com.staffscheduler.api.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Employee Self-Service (ESS) API.
 *
 * All endpoints are scoped to the authenticated user's own employee record.
 * The `employee_id` is always resolved from the JWT — never from request parameters —
 * to prevent horizontal privilege escalation.
 *
 * Security: /api/ess/** is protected by:
 *   1. JWT authentication (SecurityConfig)
 *   2. app_permissions row (ess / employee = full) checked by AppAccessService / AppGuard
 *   3. Own-data scoping enforced in each handler via resolveEmployeeId()
 */
@RestController
@RequestMapping("/api/ess")
@RequiredArgsConstructor
@Tag(name = "ESS", description = "Employee Self-Service — own data only")
public class EssController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PaySlipRepository paySlipRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AppSettingRepository appSettingRepository;
    private final EmployeeService employeeService;

    // ─── /api/ess/me ────────────────────────────────────────────

    @GetMapping("/me")
    @Operation(summary = "Get authenticated employee's basic profile info")
    public ResponseEntity<Map<String, Object>> getMe(Authentication authentication) {
        String employeeId = resolveEmployeeId(authentication);
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("employeeId", emp.getId());
        result.put("firstName", splitFirstName(emp.getName()));
        result.put("lastName", splitLastName(emp.getName()));
        result.put("name", emp.getName());
        result.put("email", emp.getEmail());
        result.put("phone", emp.getPhone());
        result.put("jobTitle", emp.getJobTitle());
        result.put("department", emp.getDepartment());
        result.put("hireDate", emp.getHireDate() != null ? emp.getHireDate().toString() : null);
        result.put("avatar", emp.getAvatar());
        result.put("role", emp.getRole());
        return ResponseEntity.ok(result);
    }

    // ─── /api/ess/schedule ──────────────────────────────────────

    /**
     * Returns own shifts for the given date range.
     *
     * Defaults to the current ISO week (Monday–Sunday) when no params are provided.
     * The employee_id is ALWAYS resolved from the JWT — the caller cannot override it.
     *
     * @param from  inclusive start date (ISO-8601, default = Monday of current week)
     * @param to    inclusive end date   (ISO-8601, default = Sunday of current week)
     */
    @GetMapping("/schedule")
    @Operation(summary = "Get own shifts for a date range (defaults to current week)")
    public ResponseEntity<Map<String, Object>> getMySchedule(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        String employeeId = resolveEmployeeId(authentication);

        // Default to current ISO week (Monday–Sunday)
        if (from == null) {
            LocalDate today = LocalDate.now();
            from = today.with(DayOfWeek.MONDAY);
        }
        if (to == null) {
            to = from.with(DayOfWeek.SUNDAY);
        }
        final LocalDate fromFinal = from;
        final LocalDate toFinal   = to;

        List<Map<String, Object>> shifts = shiftRepository
                .findByEmployeeIdAndDateBetween(employeeId, fromFinal, toFinal)
                .stream()
                .sorted(Comparator.comparing(s -> s.getDate()))
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("date", s.getDate().toString());
                    m.put("startTime", s.getStartTime());
                    m.put("endTime", s.getEndTime());
                    m.put("duration", s.getDuration());
                    m.put("shiftType", s.getType());
                    m.put("department", s.getDepartment());
                    m.put("color", s.getColor());
                    m.put("notes", s.getNotes());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> period = Map.of("from", fromFinal.toString(), "to", toFinal.toString());
        Map<String, Object> data   = Map.of("shifts", shifts, "period", period);
        return ResponseEntity.ok(Map.of("data", data));
    }

    /**
     * Returns the next 5 upcoming shifts from today onwards.
     * Used by the ESS Dashboard widget.
     */
    @GetMapping("/schedule/upcoming")
    @Operation(summary = "Get next 5 upcoming shifts from today")
    public ResponseEntity<Map<String, Object>> getUpcomingShifts(Authentication authentication) {
        String employeeId = resolveEmployeeId(authentication);
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> upcoming = shiftRepository
                .findByEmployeeIdAndDateBetween(employeeId, today, today.plusDays(365))
                .stream()
                .filter(s -> !s.getDate().isBefore(today))
                .sorted(Comparator.comparing(s -> s.getDate()))
                .limit(5)
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("date", s.getDate().toString());
                    m.put("startTime", s.getStartTime());
                    m.put("endTime", s.getEndTime());
                    m.put("duration", s.getDuration());
                    m.put("shiftType", s.getType());
                    m.put("department", s.getDepartment());
                    m.put("color", s.getColor());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", upcoming));
    }

    /**
     * Returns own approved leave entries that overlap the given date range.
     * Used as an overlay on the ESS schedule calendar.
     *
     * Full leave management (apply/approve workflow) is delivered in task 44.
     * This endpoint is read-only and surfaces already-approved records only.
     */
    @GetMapping("/schedule/leave")
    @Operation(summary = "Get own approved leave for a date range")
    public ResponseEntity<Map<String, Object>> getMyLeave(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        String employeeId = resolveEmployeeId(authentication);

        if (from == null) {
            LocalDate today = LocalDate.now();
            from = today.with(DayOfWeek.MONDAY);
        }
        if (to == null) {
            to = from.with(DayOfWeek.SUNDAY);
        }

        List<Map<String, Object>> leave = leaveRequestRepository
                .findApprovedForEmployee(employeeId, from, to)
                .stream()
                .map(l -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", l.getId());
                    m.put("startDate", l.getStartDate().toString());
                    m.put("endDate", l.getEndDate().toString());
                    m.put("totalDays", l.getTotalDays());
                    m.put("leaveType", l.getLeaveType());
                    m.put("color", l.getColor());
                    m.put("status", l.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", leave));
    }

    // ─── /api/ess/payslips ──────────────────────────────────────

    /**
     * List own payslips (paginated, filterable by year).
     *
     * If the organisation setting `show_salary_to_employee` is false, returns
     * { data: [], restricted: true, message: "..." } with HTTP 200.
     */
    @GetMapping("/payslips")
    @Operation(summary = "List own payslips (paginated, year-filterable)")
    public ResponseEntity<Map<String, Object>> getMyPayslips(
            Authentication authentication,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize) {

        String employeeId = resolveEmployeeId(authentication);

        if (!isSalaryVisibleToEmployee()) {
            return ResponseEntity.ok(Map.of(
                    "data", Collections.emptyList(),
                    "restricted", true,
                    "message", "Payslip access is currently disabled by your organisation."
            ));
        }

        PageRequest pageable = PageRequest.of(Math.max(0, page - 1), Math.min(pageSize, 100));
        Page<PaySlip> result;
        if (year != null) {
            result = paySlipRepository.findByEmployeeIdAndPeriodYearOrderByPeriodEndDesc(employeeId, year, pageable);
        } else {
            result = paySlipRepository.findByEmployeeIdOrderByPeriodEndDesc(employeeId, pageable);
        }

        List<Map<String, Object>> data = result.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("pageSize", pageSize);
        pagination.put("total", result.getTotalElements());
        pagination.put("hasNextPage", result.hasNext());

        return ResponseEntity.ok(Map.of("data", data, "pagination", pagination));
    }

    /**
     * Latest payslip summary (used by dashboard widget).
     */
    @GetMapping("/payslips/latest")
    @Operation(summary = "Get latest payslip summary")
    public ResponseEntity<Map<String, Object>> getLatestPayslip(Authentication authentication) {
        String employeeId = resolveEmployeeId(authentication);

        if (!isSalaryVisibleToEmployee()) {
            return ResponseEntity.ok(Map.of("data", Collections.emptyMap()));
        }

        Map<String, Object> data = paySlipRepository.findFirstByEmployeeIdOrderByPeriodEndDesc(employeeId)
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("periodLabel", p.getPeriodLabel());
                    m.put("netPay", p.getNetPay());
                    m.put("paidAt", p.getPaidAt() != null ? p.getPaidAt().toString() : null);
                    m.put("currency", p.getCurrency());
                    return m;
                })
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    /**
     * Full payslip detail with line items.
     *
     * Returns 404 if the payslip does not belong to the authenticated employee
     * (prevents ID enumeration — never returns 403 for a foreign payslip).
     */
    @GetMapping("/payslips/{id}")
    @Operation(summary = "Get payslip detail with breakdown")
    public ResponseEntity<Map<String, Object>> getPayslipDetail(
            Authentication authentication,
            @PathVariable String id) {

        String employeeId = resolveEmployeeId(authentication);

        if (!isSalaryVisibleToEmployee()) {
            return ResponseEntity.ok(Map.of(
                    "data", Collections.emptyMap(),
                    "restricted", true
            ));
        }

        PaySlip p = paySlipRepository.findByIdAndEmployeeId(id, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("PaySlip", id));

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", p.getId());
        detail.put("periodStart", p.getPeriodStart().toString());
        detail.put("periodEnd", p.getPeriodEnd().toString());
        detail.put("periodLabel", p.getPeriodLabel());
        detail.put("workedHours", p.getWorkedHours());
        detail.put("grossPay", p.getGrossPay());
        detail.put("totalDeductions", p.getTotalDeductions());
        detail.put("netPay", p.getNetPay());
        detail.put("employerContributions", p.getEmployerContributions());
        detail.put("status", p.getStatus());
        detail.put("paidAt", p.getPaidAt() != null ? p.getPaidAt().toString() : null);
        detail.put("paymentMethod", p.getPaymentMethod());
        detail.put("currency", p.getCurrency());
        detail.put("employeeName", p.getEmployeeName());

        // Parse lines JSON
        if (p.getLinesJson() != null && !p.getLinesJson().isBlank()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> lines = new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(p.getLinesJson(), Map.class);
                detail.put("lines", lines);
            } catch (Exception e) {
                detail.put("lines", Map.of("earnings", List.of(), "deductions", List.of()));
            }
        } else {
            detail.put("lines", Map.of("earnings", List.of(), "deductions", List.of()));
        }

        // Compute totals from lines if not already set
        detail.put("totalEarnings", p.getGrossPay());

        return ResponseEntity.ok(Map.of("data", detail));
    }

    // ─── /api/ess/attendance ────────────────────────────────────

    /**
     * List own attendance records for a date range (defaults to current month).
     * Optionally filter by status (present, absent, late, half_day, on_leave, holiday).
     */
    @GetMapping("/attendance")
    @Operation(summary = "List own attendance records for a date range")
    public ResponseEntity<Map<String, Object>> getMyAttendance(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String status) {

        String employeeId = resolveEmployeeId(authentication);

        if (from == null) {
            YearMonth current = YearMonth.now();
            from = current.atDay(1);
        }
        if (to == null) {
            to = YearMonth.from(from).atEndOfMonth();
        }

        List<AttendanceRecord> records;
        if (status != null && !status.isBlank()) {
            records = attendanceRecordRepository
                    .findByEmployeeIdAndDateBetweenAndStatusOrderByDateDesc(employeeId, from, to, status);
        } else {
            records = attendanceRecordRepository
                    .findByEmployeeIdAndDateBetweenOrderByDateDesc(employeeId, from, to);
        }

        List<Map<String, Object>> data = records.stream()
                .map(this::toAttendanceItem)
                .collect(Collectors.toList());

        Map<String, Object> period = Map.of("from", from.toString(), "to", to.toString());
        return ResponseEntity.ok(Map.of("data", data, "period", period));
    }

    /**
     * Aggregate attendance summary for a date range.
     * Returns counts by status, total hours, overtime, and attendance rate.
     */
    @GetMapping("/attendance/summary")
    @Operation(summary = "Get attendance summary stats for a date range")
    public ResponseEntity<Map<String, Object>> getAttendanceSummary(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        String employeeId = resolveEmployeeId(authentication);

        if (from == null) {
            YearMonth current = YearMonth.now();
            from = current.atDay(1);
        }
        if (to == null) {
            to = YearMonth.from(from).atEndOfMonth();
        }

        // Status counts
        List<Object[]> statusCounts = attendanceRecordRepository.countByStatusForEmployee(employeeId, from, to);
        Map<String, Long> breakdown = new LinkedHashMap<>();
        long totalRecords = 0;
        for (Object[] row : statusCounts) {
            String s = (String) row[0];
            Long count = (Long) row[1];
            breakdown.put(s, count);
            totalRecords += count;
        }

        long daysPresent = breakdown.getOrDefault("present", 0L);
        long daysLate = breakdown.getOrDefault("late", 0L);
        long daysAbsent = breakdown.getOrDefault("absent", 0L);
        long daysHalfDay = breakdown.getOrDefault("half_day", 0L);
        long daysOnLeave = breakdown.getOrDefault("on_leave", 0L);
        long daysHoliday = breakdown.getOrDefault("holiday", 0L);

        // Hours
        Object[] hours = attendanceRecordRepository.sumHoursForEmployee(employeeId, from, to);
        double totalActualHours = hours[0] != null ? ((Number) hours[0]).doubleValue() : 0;
        double totalOvertimeHours = hours[1] != null ? ((Number) hours[1]).doubleValue() : 0;

        // Attendance rate: (present + late) / (total - on_leave - holiday) × 100
        long effectiveWorkdays = totalRecords - daysOnLeave - daysHoliday;
        double attendanceRate = effectiveWorkdays > 0
                ? Math.round(((daysPresent + daysLate) * 10000.0) / effectiveWorkdays) / 100.0
                : 0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRecords", totalRecords);
        summary.put("daysPresent", daysPresent);
        summary.put("daysLate", daysLate);
        summary.put("daysAbsent", daysAbsent);
        summary.put("daysHalfDay", daysHalfDay);
        summary.put("daysOnLeave", daysOnLeave);
        summary.put("daysHoliday", daysHoliday);
        summary.put("totalHours", totalActualHours);
        summary.put("overtimeHours", totalOvertimeHours);
        summary.put("attendanceRate", attendanceRate);
        summary.put("breakdown", breakdown);

        Map<String, Object> period = Map.of("from", from.toString(), "to", to.toString());
        return ResponseEntity.ok(Map.of("data", summary, "period", period));
    }

    /**
     * Export own attendance records as CSV for a date range.
     */
    @GetMapping("/attendance/export")
    @Operation(summary = "Export own attendance as CSV")
    public void exportAttendanceCsv(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletResponse response) throws Exception {

        String employeeId = resolveEmployeeId(authentication);
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        if (from == null) {
            YearMonth current = YearMonth.now();
            from = current.atDay(1);
        }
        if (to == null) {
            to = YearMonth.from(from).atEndOfMonth();
        }

        List<AttendanceRecord> records = attendanceRecordRepository
                .findByEmployeeIdAndDateBetweenOrderByDateDesc(employeeId, from, to);

        String safeName = emp.getName().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String filename = "attendance-" + from.format(DateTimeFormatter.ofPattern("yyyy-MM"))
                        + "-" + safeName + ".csv";

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        PrintWriter writer = response.getWriter();
        writer.println("Date,Status,Scheduled Start,Scheduled End,Actual Start,Actual End,Scheduled Hours,Actual Hours,Overtime,Notes");
        for (AttendanceRecord r : records) {
            writer.printf("%s,%s,%s,%s,%s,%s,%.1f,%.1f,%.1f,%s%n",
                    r.getDate(),
                    r.getStatus(),
                    r.getScheduledStart() != null ? r.getScheduledStart() : "",
                    r.getScheduledEnd() != null ? r.getScheduledEnd() : "",
                    r.getActualStart() != null ? r.getActualStart() : "",
                    r.getActualEnd() != null ? r.getActualEnd() : "",
                    r.getScheduledHours() != null ? r.getScheduledHours() : 0,
                    r.getActualHours() != null ? r.getActualHours() : 0,
                    r.getOvertimeHours() != null ? r.getOvertimeHours() : 0,
                    csvEscape(r.getNotes()));
        }
        writer.flush();
    }

    private Map<String, Object> toAttendanceItem(AttendanceRecord r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("date", r.getDate().toString());
        m.put("status", r.getStatus());
        m.put("scheduledStart", r.getScheduledStart() != null ? r.getScheduledStart().toString() : null);
        m.put("scheduledEnd", r.getScheduledEnd() != null ? r.getScheduledEnd().toString() : null);
        m.put("actualStart", r.getActualStart() != null ? r.getActualStart().toString() : null);
        m.put("actualEnd", r.getActualEnd() != null ? r.getActualEnd().toString() : null);
        m.put("scheduledHours", r.getScheduledHours());
        m.put("actualHours", r.getActualHours());
        m.put("overtimeHours", r.getOvertimeHours());
        m.put("notes", r.getNotes());
        return m;
    }

    private static String csvEscape(String value) {
        if (value == null || value.isEmpty()) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    // ─── Setting gate ───────────────────────────────────────────

    /**
     * Checks the `show_salary_to_employee` app setting.
     * Defaults to true if the setting does not exist.
     */
    private boolean isSalaryVisibleToEmployee() {
        return appSettingRepository.findByCategoryAndSettingKey("payroll", "showSalaryToEmployee")
                .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                .orElse(true);
    }

    private Map<String, Object> toListItem(PaySlip p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("periodStart", p.getPeriodStart().toString());
        m.put("periodEnd", p.getPeriodEnd().toString());
        m.put("periodLabel", p.getPeriodLabel());
        m.put("grossPay", p.getGrossPay());
        m.put("totalDeductions", p.getTotalDeductions());
        m.put("netPay", p.getNetPay());
        m.put("status", p.getStatus());
        m.put("paidAt", p.getPaidAt() != null ? p.getPaidAt().toString() : null);
        m.put("currency", p.getCurrency());
        return m;
    }

    // ─── Own-data scoping ───────────────────────────────────────

    /**
     * Resolves the employee_id for the authenticated user from the user store.
     * Throws 403 (via ResourceNotFoundException → 404 is rethrown as 403 for
     * HR-safe messaging) if no employee record is linked to this user account.
     *
     * This is the single point of own-data enforcement — all ESS handlers must
     * call this method and use the returned ID exclusively.
     */
    private String resolveEmployeeId(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        String empId = employeeService.getEmployeeIdByUserId(userId);
        if (empId == null || empId.isBlank()) {
            throw new EssNoEmployeeRecordException();
        }
        return empId;
    }

    private static String splitFirstName(String fullName) {
        if (fullName == null) return "";
        int idx = fullName.indexOf(' ');
        return idx > 0 ? fullName.substring(0, idx) : fullName;
    }

    private static String splitLastName(String fullName) {
        if (fullName == null) return "";
        int idx = fullName.indexOf(' ');
        return idx > 0 ? fullName.substring(idx + 1) : "";
    }

    // ─── Inner exception ────────────────────────────────────────

    @org.springframework.web.bind.annotation.ExceptionHandler(EssNoEmployeeRecordException.class)
    public ResponseEntity<Map<String, Object>> handleNoEmployeeRecord(EssNoEmployeeRecordException ex) {
        return ResponseEntity.status(403).body(Map.of(
                "error", Map.of(
                        "code", "NO_EMPLOYEE_RECORD",
                        "message", "No employee record linked to this account."
                )
        ));
    }

    static class EssNoEmployeeRecordException extends RuntimeException {
        EssNoEmployeeRecordException() {
            super("No employee record linked to this account.");
        }
    }
}
