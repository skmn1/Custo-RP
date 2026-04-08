package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.StockLocationDto;
import com.staffscheduler.api.service.StockLocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock/locations")
@RequiredArgsConstructor
@Tag(name = "Stock Locations", description = "Stock location management")
public class StockLocationController {

    private final StockLocationService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "List locations")
    public ResponseEntity<List<StockLocationDto>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Get location by ID")
    public ResponseEntity<StockLocationDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Create location")
    public ResponseEntity<StockLocationDto> create(@RequestBody StockLocationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Update location")
    public ResponseEntity<StockLocationDto> update(@PathVariable UUID id, @RequestBody StockLocationDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Soft-delete location")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Location deleted successfully"));
    }
}
