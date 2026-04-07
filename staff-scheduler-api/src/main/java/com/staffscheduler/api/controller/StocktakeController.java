package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.StocktakeDto;
import com.staffscheduler.api.service.StocktakeService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/stock/stocktakes")
@RequiredArgsConstructor
@Tag(name = "Stocktakes", description = "Physical stocktake sessions")
public class StocktakeController {

    private final StocktakeService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @Operation(summary = "List all stocktake sessions")
    public ResponseEntity<List<StocktakeDto>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @Operation(summary = "Get stocktake session with counts")
    public ResponseEntity<StocktakeDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Start a new stocktake session")
    public ResponseEntity<StocktakeDto> start(
            Authentication authentication,
            @RequestBody StocktakeDto dto) {
        UUID createdBy = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.startSession(dto, createdBy));
    }

    @PatchMapping("/{id}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Submit a count for an item in the session")
    public ResponseEntity<StocktakeDto> submitCount(
            @PathVariable UUID id,
            @RequestParam UUID itemId,
            @RequestParam BigDecimal countedQty) {
        return ResponseEntity.ok(service.submitCount(id, itemId, countedQty));
    }

    @PatchMapping("/{id}/finalise")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Finalise stocktake session and post adjustments")
    public ResponseEntity<StocktakeDto> finalise(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID performedBy = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(service.finalise(id, performedBy));
    }
}
