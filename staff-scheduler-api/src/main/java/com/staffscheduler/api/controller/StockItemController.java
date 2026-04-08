package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.StockItemDto;
import com.staffscheduler.api.dto.StockMovementDto;
import com.staffscheduler.api.service.StockItemService;
import com.staffscheduler.api.service.StockMovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock/items")
@RequiredArgsConstructor
@Tag(name = "Stock Items", description = "Stock item management")
public class StockItemController {

    private final StockItemService itemService;
    private final StockMovementService movementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER', 'POS_MANAGER')")
    @Operation(summary = "List stock items with optional filters")
    public ResponseEntity<List<StockItemDto>> list(
            @Parameter(description = "Search by name, nameEn, nameFr, or SKU")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filter by category ID")
            @RequestParam(required = false) UUID categoryId,
            @Parameter(description = "Filter by location ID")
            @RequestParam(required = false) UUID locationId) {
        return ResponseEntity.ok(itemService.findAll(search, categoryId, locationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER', 'POS_MANAGER')")
    @Operation(summary = "Get stock item by ID")
    public ResponseEntity<StockItemDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(itemService.findById(id));
    }

    @GetMapping("/sku/{sku}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER', 'POS_MANAGER')")
    @Operation(summary = "Get stock item by SKU")
    public ResponseEntity<StockItemDto> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(itemService.findBySku(sku));
    }

    @GetMapping("/barcode/{barcode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER', 'POS_MANAGER')")
    @Operation(summary = "Get stock item by barcode")
    public ResponseEntity<StockItemDto> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(itemService.findByBarcode(barcode));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER', 'POS_MANAGER')")
    @Operation(summary = "List items with low stock (warn or critical)")
    public ResponseEntity<List<StockItemDto>> lowStock() {
        return ResponseEntity.ok(itemService.findLowStock());
    }

    @GetMapping("/reorder-queue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "List items that need reordering")
    public ResponseEntity<List<StockItemDto>> reorderQueue() {
        return ResponseEntity.ok(itemService.findReorderQueue());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Create stock item")
    public ResponseEntity<StockItemDto> create(@RequestBody StockItemDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Update stock item")
    public ResponseEntity<StockItemDto> update(@PathVariable UUID id, @RequestBody StockItemDto dto) {
        return ResponseEntity.ok(itemService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Soft-delete (deactivate) stock item")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        itemService.deactivate(id);
        return ResponseEntity.ok(Map.of("message", "Item deactivated successfully"));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Reactivate a deactivated stock item")
    public ResponseEntity<StockItemDto> reactivate(@PathVariable UUID id) {
        itemService.reactivate(id);
        return ResponseEntity.ok(itemService.findById(id));
    }

    // ── Movement endpoints scoped to item ──

    @GetMapping("/{id}/movements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Get movement ledger for an item")
    public ResponseEntity<List<StockMovementDto>> movements(@PathVariable UUID id) {
        return ResponseEntity.ok(movementService.findByItem(id));
    }

    @PostMapping("/{id}/movements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Create a stock movement for an item")
    public ResponseEntity<StockMovementDto> createMovement(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody StockMovementDto dto) {
        dto.setItemId(id);
        UUID performedBy = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movementService.createMovement(dto, performedBy));
    }
}
