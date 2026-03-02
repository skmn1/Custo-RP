package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.dto.PosDetailDto;
import com.staffscheduler.api.dto.PosDto;
import com.staffscheduler.api.service.EmployeeService;
import com.staffscheduler.api.service.PosService;
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
@RequestMapping("/api/pos")
@RequiredArgsConstructor
@Tag(name = "Point of Sale", description = "PoS location management")
public class PosController {

    private final PosService posService;
    private final EmployeeService employeeService;

    // ── PoS CRUD ──

    @GetMapping
    @Operation(summary = "List PoS locations")
    public ResponseEntity<List<PosDto>> list(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(posService.findAll(includeInactive));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get PoS detail with employees and dashboard")
    public ResponseEntity<PosDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(posService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create PoS location")
    public ResponseEntity<PosDto> create(@Valid @RequestBody PosDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(posService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update PoS location")
    public ResponseEntity<PosDto> update(@PathVariable Long id, @RequestBody PosDto dto) {
        return ResponseEntity.ok(posService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete PoS location")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        posService.delete(id);
        return ResponseEntity.ok(Map.of("message", "PoS deactivated successfully"));
    }

    // ── Manager list ──

    @GetMapping("/managers")
    @Operation(summary = "List all managers")
    public ResponseEntity<List<EmployeeDto>> managers() {
        return ResponseEntity.ok(employeeService.findManagers());
    }

    // ── Employee operations scoped to a PoS ──

    @GetMapping("/{posId}/employees")
    @Operation(summary = "List employees in a PoS")
    public ResponseEntity<List<EmployeeDto>> listEmployees(@PathVariable Long posId) {
        return ResponseEntity.ok(employeeService.findByPosId(posId));
    }

    @GetMapping("/{posId}/available-employees")
    @Operation(summary = "List employees NOT in this PoS (for swap)")
    public ResponseEntity<List<EmployeeDto>> availableEmployees(@PathVariable Long posId) {
        return ResponseEntity.ok(employeeService.findAvailableForPos(posId));
    }

    @PostMapping("/{posId}/employees")
    @Operation(summary = "Add employee to a PoS")
    public ResponseEntity<EmployeeDto> addEmployee(@PathVariable Long posId, @Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(posService.addEmployee(posId, dto));
    }

    @PutMapping("/{posId}/employees/{empId}")
    @Operation(summary = "Update employee in a PoS")
    public ResponseEntity<EmployeeDto> updateEmployee(
            @PathVariable Long posId, @PathVariable String empId, @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(posService.updateEmployee(posId, empId, dto));
    }

    @DeleteMapping("/{posId}/employees/{empId}")
    @Operation(summary = "Remove employee from a PoS")
    public ResponseEntity<Map<String, String>> removeEmployee(@PathVariable Long posId, @PathVariable String empId) {
        posService.removeEmployee(posId, empId);
        return ResponseEntity.ok(Map.of("message", "Employee removed successfully"));
    }

    @PutMapping("/{posId}/employees/{currentEmpId}/swap")
    @Operation(summary = "Swap employee between PoS locations")
    public ResponseEntity<Map<String, Object>> swapEmployee(
            @PathVariable Long posId,
            @PathVariable String currentEmpId,
            @RequestBody Map<String, String> body) {
        String newEmpId = body.get("newEmpId");
        return ResponseEntity.ok(posService.swapEmployee(posId, currentEmpId, newEmpId));
    }
}
