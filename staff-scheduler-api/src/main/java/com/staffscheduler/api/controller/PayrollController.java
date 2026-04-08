package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.PayrollDto;
import com.staffscheduler.api.service.EmployeeService;
import com.staffscheduler.api.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll calculations and export")
public class PayrollController {

    private final PayrollService service;
    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTING_AGENT', 'EMPLOYEE')")
    @Operation(summary = "Get payroll summary")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payroll summary",
                    content = @Content(schema = @Schema(implementation = PayrollDto.Summary.class))),
            @ApiResponse(responseCode = "400", description = "Invalid date format")
    })
    public ResponseEntity<PayrollDto.Summary> summary(
            @Parameter(description = "Period start date (ISO 8601)", example = "2025-06-01", required = true)
            @RequestParam String startDate,
            @Parameter(description = "Period end date (ISO 8601)", example = "2025-06-30", required = true)
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateSummary(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTING_AGENT', 'EMPLOYEE')")
    @Operation(summary = "Get per-employee payroll")
    @ApiResponse(responseCode = "200", description = "Employee payroll list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PayrollDto.EmployeePayroll.class))))
    public ResponseEntity<List<PayrollDto.EmployeePayroll>> employeePayrolls(
            Authentication authentication,
            @Parameter(description = "Period start date (ISO 8601)", example = "2025-06-01", required = true)
            @RequestParam String startDate,
            @Parameter(description = "Period end date (ISO 8601)", example = "2025-06-30", required = true)
            @RequestParam String endDate) {
        List<PayrollDto.EmployeePayroll> payrolls = service.calculateEmployeePayrolls(
                LocalDate.parse(startDate), LocalDate.parse(endDate));
        // Employee role: filter to own record only
        if (hasRole(authentication, "ROLE_EMPLOYEE")) {
            String ownId = getEmployeeId(authentication);
            if (ownId != null) {
                payrolls = payrolls.stream()
                        .filter(p -> ownId.equals(p.getId()))
                        .toList();
            }
        }
        return ResponseEntity.ok(payrolls);
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Get department payroll breakdown")
    @ApiResponse(responseCode = "200", description = "Department payroll breakdown",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PayrollDto.DepartmentSummary.class))))
    public ResponseEntity<List<PayrollDto.DepartmentSummary>> departmentPayroll(
            @Parameter(description = "Period start date (ISO 8601)", example = "2025-06-01", required = true)
            @RequestParam String startDate,
            @Parameter(description = "Period end date (ISO 8601)", example = "2025-06-30", required = true)
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateDepartmentPayroll(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Get payroll statistics")
    @ApiResponse(responseCode = "200", description = "Payroll statistics",
            content = @Content(schema = @Schema(implementation = PayrollDto.Statistics.class)))
    public ResponseEntity<PayrollDto.Statistics> statistics(
            @Parameter(description = "Period start date (ISO 8601)", example = "2025-06-01", required = true)
            @RequestParam String startDate,
            @Parameter(description = "Period end date (ISO 8601)", example = "2025-06-30", required = true)
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateStatistics(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Export payroll as CSV")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CSV file download",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "500", description = "CSV generation error")
    })
    public ResponseEntity<byte[]> exportCsv(
            @Parameter(description = "Period start date (ISO 8601)", example = "2025-06-01", required = true)
            @RequestParam String startDate,
            @Parameter(description = "Period end date (ISO 8601)", example = "2025-06-30", required = true)
            @RequestParam String endDate) throws IOException {
        String csv = service.exportCsv(LocalDate.parse(startDate), LocalDate.parse(endDate));
        String filename = "payroll-" + startDate + "-to-" + endDate + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    // ── Helpers ──

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }

    private String getEmployeeId(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return employeeService.getEmployeeIdByUserId(userId);
    }
}
