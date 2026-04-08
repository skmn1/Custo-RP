package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.StockKpiDto;
import com.staffscheduler.api.service.DashboardKpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stock/kpi")
@RequiredArgsConstructor
@Tag(name = "Stock KPI", description = "Stock dashboard KPI aggregation")
public class StockKpiController {

    private final DashboardKpiService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Get all stock KPI metrics for dashboard")
    public ResponseEntity<StockKpiDto> getKpis() {
        return ResponseEntity.ok(service.getKpis());
    }
}
