package com.staffscheduler.api.controller;

import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import com.staffscheduler.api.repository.UserRepository;
import com.staffscheduler.api.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @GetMapping("/schedule")
    @Operation(summary = "Get own upcoming shifts (next 4 weeks)")
    public ResponseEntity<List<Map<String, Object>>> getMySchedule(Authentication authentication) {
        String employeeId = resolveEmployeeId(authentication);
        LocalDate today = LocalDate.now();
        LocalDate until = today.plusWeeks(4);

        List<Map<String, Object>> shifts = shiftRepository
                .findByEmployeeIdAndDateBetween(employeeId, today, until)
                .stream()
                .sorted(Comparator.comparing(s -> s.getDate()))
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("date", s.getDate().toString());
                    m.put("startTime", s.getStartTime());
                    m.put("endTime", s.getEndTime());
                    m.put("duration", s.getDuration());
                    m.put("type", s.getType());
                    m.put("department", s.getDepartment());
                    m.put("notes", s.getNotes());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(shifts);
    }

    // ─── /api/ess/payslips ──────────────────────────────────────

    @GetMapping("/payslips")
    @Operation(summary = "Get own payslips")
    public ResponseEntity<List<Map<String, Object>>> getMyPayslips(Authentication authentication) {
        // Payslip data will be implemented in task 50.
        // Returning an empty list here so the frontend renders gracefully.
        resolveEmployeeId(authentication); // enforce scoping check
        return ResponseEntity.ok(Collections.emptyList());
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
