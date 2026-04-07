package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.StockCategoryDto;
import com.staffscheduler.api.service.StockCategoryService;
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
@RequestMapping("/api/stock/categories")
@RequiredArgsConstructor
@Tag(name = "Stock Categories", description = "Stock category management")
public class StockCategoryController {

    private final StockCategoryService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @Operation(summary = "List categories as nested tree")
    public ResponseEntity<List<StockCategoryDto>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/flat")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @Operation(summary = "List categories as flat list")
    public ResponseEntity<List<StockCategoryDto>> listFlat() {
        return ResponseEntity.ok(service.findFlat());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<StockCategoryDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create category")
    public ResponseEntity<StockCategoryDto> create(@RequestBody StockCategoryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update category")
    public ResponseEntity<StockCategoryDto> update(@PathVariable UUID id, @RequestBody StockCategoryDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete category")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
