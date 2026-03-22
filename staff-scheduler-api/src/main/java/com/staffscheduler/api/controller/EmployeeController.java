package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.dto.ErrorResponse;
import com.staffscheduler.api.service.EmployeeService;
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
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management operations")
public class EmployeeController {

    private final EmployeeService service;

    @GetMapping
    @Operation(
            summary = "List employees",
            description = "Returns all employees with optional search, role filtering, and sorting. "
                    + "When no filters are applied, returns all employees sorted by name ascending.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee list returned successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = EmployeeDto.class))))
    })
    public ResponseEntity<List<EmployeeDto>> list(
            @Parameter(description = "Search by name or email (case-insensitive partial match)", example = "john")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filter by role", example = "Chef")
            @RequestParam(required = false) String role,
            @Parameter(description = "Sort field", schema = @Schema(allowableValues = {"name", "role", "maxHours"}))
            @RequestParam(required = false, defaultValue = "name") String sort,
            @Parameter(description = "Sort direction", schema = @Schema(allowableValues = {"asc", "desc"}))
            @RequestParam(required = false, defaultValue = "asc") String order) {
        return ResponseEntity.ok(service.findAll(search, role, sort, order));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID", description = "Returns a single employee by their unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee found",
                    content = @Content(schema = @Schema(implementation = EmployeeDto.class))),
            @ApiResponse(responseCode = "404", description = "Employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EmployeeDto> getById(
            @Parameter(description = "Employee ID", example = "emp-1", required = true)
            @PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create employee",
            description = "Creates a new employee. Avatar initials and color are auto-generated if not provided.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Employee created successfully",
                    content = @Content(schema = @Schema(implementation = EmployeeDto.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Duplicate email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EmployeeDto> create(@Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee", description = "Updates an existing employee's details.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee updated",
                    content = @Content(schema = @Schema(implementation = EmployeeDto.class))),
            @ApiResponse(responseCode = "404", description = "Employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Duplicate email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EmployeeDto> update(
            @Parameter(description = "Employee ID", example = "emp-1", required = true)
            @PathVariable String id, @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee", description = "Permanently deletes an employee and disassociates them from shifts and PoS locations.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee deleted",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"Employee deleted successfully\"}"))),
            @ApiResponse(responseCode = "404", description = "Employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> delete(
            @Parameter(description = "Employee ID", example = "emp-1", required = true)
            @PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }

    @GetMapping("/roles")
    @Operation(summary = "List all roles",
            description = "Returns a distinct list of role names across all employees.")
    @ApiResponse(responseCode = "200", description = "Role list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = String.class)),
                    examples = @ExampleObject(value = "[\"Chef\", \"Waiter\", \"Bartender\", \"Manager\"]")))
    public ResponseEntity<List<String>> roles() {
        return ResponseEntity.ok(service.getRoles());
    }
}
