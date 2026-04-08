package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.InvoiceKpiDto;
import com.staffscheduler.api.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard KPI endpoints")
public class DashboardController {

    private final InvoiceService invoiceService;

    @GetMapping("/ap-kpis")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all AP invoice KPI widget data")
    public ResponseEntity<InvoiceKpiDto> getApKpis() {
        return ResponseEntity.ok(invoiceService.getKpis());
    }
}
