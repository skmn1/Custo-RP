package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.ShiftDto;
import com.staffscheduler.api.dto.ShiftMoveDto;
import com.staffscheduler.api.service.ShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@Tag(name = "Shifts", description = "Shift scheduling operations")
public class ShiftController {

    private final ShiftService service;

    @GetMapping
    @Operation(summary = "List shifts", description = "Returns shifts. Supports date range, employee, department and type filters.")
    public ResponseEntity<List<ShiftDto>> list(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(service.findAll(startDate, endDate, employeeId, department, type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shift by ID")
    public ResponseEntity<ShiftDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create shift")
    public ResponseEntity<ShiftDto> create(@Valid @RequestBody ShiftDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update shift")
    public ResponseEntity<ShiftDto> update(@PathVariable String id, @RequestBody ShiftDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move shift (drag-and-drop)", description = "Updates employeeId and/or date for a shift")
    public ResponseEntity<ShiftDto> move(@PathVariable String id, @RequestBody ShiftMoveDto moveDto) {
        return ResponseEntity.ok(service.moveShift(id, moveDto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete shift")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Shift deleted successfully"));
    }
}
