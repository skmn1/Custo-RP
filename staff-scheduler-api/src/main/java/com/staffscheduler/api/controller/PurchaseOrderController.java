package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.PurchaseOrderDto;
import com.staffscheduler.api.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Purchase order management")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "List all purchase orders")
    public ResponseEntity<List<PurchaseOrderDto>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping(params = "status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "List purchase orders by status")
    public ResponseEntity<List<PurchaseOrderDto>> listByStatus(@RequestParam String status) {
        return ResponseEntity.ok(service.findByStatus(status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Get purchase order by ID (with lines)")
    public ResponseEntity<PurchaseOrderDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Create purchase order")
    public ResponseEntity<PurchaseOrderDto> create(
            Authentication authentication,
            @RequestBody PurchaseOrderDto dto) {
        UUID createdBy = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto, createdBy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Update purchase order (draft only)")
    public ResponseEntity<PurchaseOrderDto> update(@PathVariable UUID id, @RequestBody PurchaseOrderDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Submit purchase order")
    public ResponseEntity<PurchaseOrderDto> submit(@PathVariable UUID id) {
        return ResponseEntity.ok(service.submit(id));
    }

    @PatchMapping("/{id}/lines/{lineId}/receive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Receive items against a PO line")
    public ResponseEntity<PurchaseOrderDto> receiveLine(
            Authentication authentication,
            @PathVariable UUID id,
            @PathVariable UUID lineId,
            @RequestParam BigDecimal qtyReceived,
            @RequestParam(required = false) String batchNumber,
            @RequestParam(required = false) String lotNumber) {
        UUID performedBy = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(service.receiveLine(id, lineId, qtyReceived, batchNumber, lotNumber, performedBy));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Cancel purchase order")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable UUID id) {
        service.cancel(id);
        return ResponseEntity.ok(Map.of("message", "Purchase order cancelled"));
    }
}
