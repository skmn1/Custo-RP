package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.ErrorResponse;
import com.staffscheduler.api.dto.ShiftDto;
import com.staffscheduler.api.dto.ShiftMoveDto;
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
    @Operation(
            summary = "List shifts",
            description = "Returns shifts with optional filters. Use `startDate`/`endDate` for date-range queries "
                    + "(ISO 8601 format: YYYY-MM-DD). Additional filters for employee, department, and shift type.")
    @ApiResponse(responseCode = "200", description = "Shift list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ShiftDto.class))))
    public ResponseEntity<List<ShiftDto>> list(
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
        return ResponseEntity.ok(service.findAll(startDate, endDate, employeeId, department, type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shift by ID", description = "Returns a single shift by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift found",
                    content = @Content(schema = @Schema(implementation = ShiftDto.class))),
            @ApiResponse(responseCode = "404", description = "Shift not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ShiftDto> getById(
            @Parameter(description = "Shift ID", example = "shift-1", required = true)
            @PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create shift",
            description = "Creates a new shift. Duration is calculated automatically from start/end times. "
                    + "Color is mapped from employee department. Provide either `date` (ISO) or `day` (0=Mon..6=Sun).")
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
    @Operation(
            summary = "Move shift (drag-and-drop)",
            description = "Partially updates a shift's `employeeId` and/or `date`/`day`. "
                    + "Designed for drag-and-drop operations on the scheduler calendar. "
                    + "Only the supplied fields are updated; others remain unchanged.")
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
}
