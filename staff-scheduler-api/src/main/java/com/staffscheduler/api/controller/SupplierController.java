package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.SupplierDto;
import com.staffscheduler.api.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Supplier management")
public class SupplierController {

    private final SupplierService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "List active suppliers")
    public ResponseEntity<List<SupplierDto>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<SupplierDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Create supplier")
    public ResponseEntity<SupplierDto> create(@RequestBody SupplierDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Update supplier")
    public ResponseEntity<SupplierDto> update(@PathVariable UUID id, @RequestBody SupplierDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Soft-delete supplier")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Supplier deleted successfully"));
    }
}
