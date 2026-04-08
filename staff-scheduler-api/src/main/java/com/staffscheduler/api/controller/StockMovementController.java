package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.StockMovementDto;
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
@RequestMapping("/api/stock/movements")
@RequiredArgsConstructor
@Tag(name = "Stock Movements", description = "Stock movement ledger")
public class StockMovementController {

    private final StockMovementService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "List movements with optional filters")
    public ResponseEntity<List<StockMovementDto>> list(
            @Parameter(description = "Filter by item ID")
            @RequestParam(required = false) UUID itemId,
            @Parameter(description = "Filter by movement type")
            @RequestParam(required = false) String movementType,
            @Parameter(description = "Start date filter")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "End date filter")
            @RequestParam(required = false) String endDate) {
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;
        return ResponseEntity.ok(service.findFiltered(itemId, movementType, start, end));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Create a stock movement")
    public ResponseEntity<StockMovementDto> create(
            Authentication authentication,
            @RequestBody StockMovementDto dto) {
        UUID performedBy = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createMovement(dto, performedBy));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STOCK_MANAGER')")
    @Operation(summary = "Transfer stock between locations")
    public ResponseEntity<Map<String, String>> transfer(
            Authentication authentication,
            @RequestParam UUID itemId,
            @RequestParam UUID fromLocationId,
            @RequestParam UUID toLocationId,
            @RequestParam BigDecimal qty,
            @RequestParam(required = false) String note) {
        UUID performedBy = UUID.fromString(authentication.getName());
        service.createTransfer(itemId, fromLocationId, toLocationId, qty, note, performedBy);
        return ResponseEntity.ok(Map.of("message", "Transfer completed successfully"));
    }
}
