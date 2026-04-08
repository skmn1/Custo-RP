package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.ErrorResponse;
import com.staffscheduler.api.dto.ShiftDto;
import com.staffscheduler.api.dto.ShiftMoveDto;
import com.staffscheduler.api.service.EmployeeService;
import com.staffscheduler.api.service.ShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@Tag(name = "Shifts", description = "Shift scheduling operations")
public class ShiftController {

    private final ShiftService service;
    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER', 'EMPLOYEE')")
    @Operation(
            summary = "List shifts",
            description = "Returns shifts with optional filters. Employee role sees only own shifts.")
    @ApiResponse(responseCode = "200", description = "Shift list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ShiftDto.class))))
    public ResponseEntity<List<ShiftDto>> list(
            Authentication authentication,
            @Parameter(description = "Start of date range (inclusive)", example = "2025-06-09")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "End of date range (inclusive)", example = "2025-06-15")
            @RequestParam(required = false) String endDate,
            @Parameter(description = "Filter by employee ID", example = "emp-1")
            @RequestParam(required = false) String employeeId,
            @Parameter(description = "Filter by department", example = "Kitchen")
            @RequestParam(required = false) String department,
            @Parameter(description = "Filter by shift type", schema = @Schema(allowableValues = {"morning", "afternoon", "evening", "night", "full"}))
            @RequestParam(required = false) String type) {
        // Employee role: force filter to own shifts
        if (hasRole(authentication, "ROLE_EMPLOYEE")) {
            String ownId = getEmployeeId(authentication);
            employeeId = ownId;
        }
        return ResponseEntity.ok(service.findAll(startDate, endDate, employeeId, department, type));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER', 'EMPLOYEE')")
    @Operation(summary = "Get shift by ID", description = "Returns a single shift by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift found",
                    content = @Content(schema = @Schema(implementation = ShiftDto.class))),
            @ApiResponse(responseCode = "404", description = "Shift not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ShiftDto> getById(
            Authentication authentication,
            @Parameter(description = "Shift ID", example = "shift-1", required = true)
            @PathVariable String id) {
        ShiftDto shift = service.findById(id);
        enforceOwnShift(authentication, shift);
        return ResponseEntity.ok(shift);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER')")
    @Operation(summary = "Create shift",
            description = "Creates a new shift. Duration is calculated automatically from start/end times.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Shift created",
                    content = @Content(schema = @Schema(implementation = ShiftDto.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ShiftDto> create(@Valid @RequestBody ShiftDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER')")
    @Operation(summary = "Update shift", description = "Replaces shift details. Duration is recalculated automatically.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift updated",
                    content = @Content(schema = @Schema(implementation = ShiftDto.class))),
            @ApiResponse(responseCode = "404", description = "Shift not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ShiftDto> update(
            @Parameter(description = "Shift ID", example = "shift-1", required = true)
            @PathVariable String id, @RequestBody ShiftDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/move")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER')")
    @Operation(summary = "Move shift (drag-and-drop)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift moved",
                    content = @Content(schema = @Schema(implementation = ShiftDto.class))),
            @ApiResponse(responseCode = "404", description = "Shift not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ShiftDto> move(
            @Parameter(description = "Shift ID to move", example = "shift-1", required = true)
            @PathVariable String id, @RequestBody ShiftMoveDto moveDto) {
        return ResponseEntity.ok(service.moveShift(id, moveDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER')")
    @Operation(summary = "Delete shift", description = "Permanently removes a shift from the schedule.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift deleted",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"Shift deleted successfully\"}"))),
            @ApiResponse(responseCode = "404", description = "Shift not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> delete(
            @Parameter(description = "Shift ID", example = "shift-1", required = true)
            @PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Shift deleted successfully"));
    }

    // ── Helpers for resource-level access control ──

    private void enforceOwnShift(Authentication auth, ShiftDto shift) {
        if (hasRole(auth, "ROLE_EMPLOYEE")) {
            String ownId = getEmployeeId(auth);
            if (ownId == null || !ownId.equals(shift.getEmployeeId())) {
                throw new SecurityException("Access denied: you can only view your own shifts");
            }
        }
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }

    private String getEmployeeId(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return employeeService.getEmployeeIdByUserId(userId);
    }
}
