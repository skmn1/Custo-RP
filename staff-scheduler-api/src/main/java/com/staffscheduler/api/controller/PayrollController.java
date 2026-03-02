package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.PayrollDto;
import com.staffscheduler.api.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "Get payroll summary for a date range")
    public ResponseEntity<PayrollDto.Summary> summary(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateSummary(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/employees")
    @Operation(summary = "Get per-employee payroll for a date range")
    public ResponseEntity<List<PayrollDto.EmployeePayroll>> employeePayrolls(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateEmployeePayrolls(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/departments")
    @Operation(summary = "Get department payroll breakdown")
    public ResponseEntity<List<PayrollDto.DepartmentSummary>> departmentPayroll(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateDepartmentPayroll(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get payroll statistics")
    public ResponseEntity<PayrollDto.Statistics> statistics(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(service.calculateStatistics(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export payroll as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam String startDate,
            @RequestParam String endDate) throws IOException {
        String csv = service.exportCsv(LocalDate.parse(startDate), LocalDate.parse(endDate));
        String filename = "payroll-" + startDate + "-to-" + endDate + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }
}
