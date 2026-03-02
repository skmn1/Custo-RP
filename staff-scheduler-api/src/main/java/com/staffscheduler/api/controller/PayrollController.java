package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.PayrollDto;
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
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll calculations and export")
public class PayrollController {

    private final PayrollService service;

    @GetMapping
    @Operation(
            summary = "Get payroll summary",
            description = "Returns an aggregated payroll summary for the given date range. "
                    + "Includes total employees, hours, gross/net pay, and period-over-period change percentages.")
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
    @Operation(
            summary = "Get per-employee payroll",
            description = "Returns detailed payroll for each employee in the date range. "
                    + "Includes regular/overtime/double-time hours, tax breakdown, deductions, "
                    + "shift differentials, individual shift details, and pay stub information.")
    @ApiResponse(responseCode = "200", description = "Employee payroll list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PayrollDto.EmployeePayroll.class))))
    public ResponseEntity<List<PayrollDto.EmployeePayroll>> employeePayrolls(
            @Parameter(description = "Period start date (ISO 8601)", example = "2025-06-01", required = true)
            @RequestParam String startDate,
            @Parameter(description = "Period end date (ISO 8601)", example = "2025-06-30", required = true)
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateEmployeePayrolls(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/departments")
    @Operation(
            summary = "Get department payroll breakdown",
            description = "Returns payroll totals grouped by department for the given date range.")
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
    @Operation(
            summary = "Get payroll statistics",
            description = "Returns comprehensive payroll statistics including totals for taxes (federal, state, "
                    + "social security, medicare), benefits, employer costs, overtime analysis, "
                    + "and labor cost ratios.")
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
    @Operation(
            summary = "Export payroll as CSV",
            description = "Generates and downloads a CSV file with per-employee payroll data. "
                    + "The file includes name, role, department, hours breakdown, gross/net pay, and taxes.")
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
}
