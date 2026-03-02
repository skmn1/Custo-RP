package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.service.EmployeeService;
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
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management operations")
public class EmployeeController {

    private final EmployeeService service;

    @GetMapping
    @Operation(summary = "List employees", description = "Returns all employees. Supports search, filter by department/role, sort and order.")
    public ResponseEntity<List<EmployeeDto>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String role,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "asc") String order) {
        return ResponseEntity.ok(service.findAll(search, department, role, sort, order));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<EmployeeDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create employee")
    public ResponseEntity<EmployeeDto> create(@Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee")
    public ResponseEntity<EmployeeDto> update(@PathVariable String id, @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }

    @GetMapping("/departments")
    @Operation(summary = "List all departments")
    public ResponseEntity<List<String>> departments() {
        return ResponseEntity.ok(service.getDepartments());
    }

    @GetMapping("/roles")
    @Operation(summary = "List all roles")
    public ResponseEntity<List<String>> roles() {
        return ResponseEntity.ok(service.getRoles());
    }
}
