package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.dto.ErrorResponse;
import com.staffscheduler.api.dto.IncidentDto;
import com.staffscheduler.api.dto.PosDetailDto;
import com.staffscheduler.api.dto.PosDto;
import com.staffscheduler.api.dto.PosProfileDto;
import com.staffscheduler.api.service.EmployeeService;
import com.staffscheduler.api.service.IncidentService;
import com.staffscheduler.api.service.PosService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'POS_MANAGER')")
@Tag(name = "Point of Sale", description = "PoS location management")
public class PosController {

    private final PosService posService;
    private final EmployeeService employeeService;
    private final IncidentService incidentService;

    // ── PoS Location-scoped endpoints ──

    @GetMapping("/my-pos-locations")
    @Operation(summary = "List PoS locations assigned to the current user",
            description = "Returns PoS locations the authenticated user has access to. "
                    + "SUPER_ADMIN sees all active locations; POS_MANAGER sees only assigned ones.")
    @ApiResponse(responseCode = "200", description = "User's PoS locations",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PosDto.class))))
    public ResponseEntity<List<PosDto>> myPosLocations(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        String role = authentication.getAuthorities().iterator().next()
                .getAuthority().replace("ROLE_", "");
        return ResponseEntity.ok(posService.findMyPosLocations(userId, role));
    }

    /** @deprecated Use GET /my-pos-locations instead. Kept for backwards compatibility. */
    @GetMapping("/my-terminals")
    @Operation(summary = "List terminals assigned to the current user (deprecated)",
            description = "Deprecated — use /my-pos-locations. Returns PoS locations assigned to the user.")
    public ResponseEntity<List<PosDto>> myTerminals(Authentication authentication) {
        return myPosLocations(authentication);
    }

    @GetMapping("/{posLocationId}/dashboard-kpis")
    @Operation(summary = "Get expanded dashboard KPIs for a PoS location",
            description = "Returns Sales, Operations and People KPI rows for the PoS location.")
    public ResponseEntity<Map<String, Object>> dashboardKpis(
            Authentication authentication,
            @PathVariable Long posLocationId) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(posService.getPosLocationDashboardKpis(posLocationId));
    }

    @GetMapping("/{posLocationId}/reports/daily-sales")
    @Operation(summary = "Get daily sales report for a PoS location")
    public ResponseEntity<Map<String, Object>> dailySales(
            Authentication authentication,
            @PathVariable Long posLocationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        enforceAccess(authentication, posLocationId);
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(posService.getDailySales(posLocationId, date));
    }

    @GetMapping("/{posLocationId}/reports/period-summary")
    @Operation(summary = "Get period summary report for a PoS location")
    public ResponseEntity<Map<String, Object>> periodSummary(
            Authentication authentication,
            @PathVariable Long posLocationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(posService.getPeriodSummary(posLocationId, from, to));
    }

    @GetMapping("/{posLocationId}/hr/staff")
    @Operation(summary = "Get staff list for a PoS location")
    public ResponseEntity<List<EmployeeDto>> hrStaff(
            Authentication authentication,
            @PathVariable Long posLocationId) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(employeeService.findByPosId(posLocationId));
    }

    @GetMapping("/{posLocationId}/schedule")
    @Operation(summary = "Get shifts for a PoS location scoped to a date range")
    public ResponseEntity<Map<String, Object>> schedule(
            Authentication authentication,
            @PathVariable Long posLocationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(Map.of(
                "posLocationId", posLocationId,
                "from", from != null ? from.toString() : LocalDate.now().toString(),
                "to", to != null ? to.toString() : LocalDate.now().plusDays(6).toString(),
                "shifts", List.of()
        ));
    }

    @GetMapping("/{posLocationId}/payroll/summary")
    @Operation(summary = "Get payroll summary for a PoS location")
    public ResponseEntity<Map<String, Object>> payrollSummary(
            Authentication authentication,
            @PathVariable Long posLocationId) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(Map.of(
                "posLocationId", posLocationId,
                "periodLabel", "Current Period",
                "status", "open",
                "employeeCount", employeeService.findByPosId(posLocationId).size(),
                "totalCost", 0
        ));
    }

    @GetMapping("/{posLocationId}/accounting/summary")
    @Operation(summary = "Get accounting summary for a PoS location")
    public ResponseEntity<Map<String, Object>> accountingSummary(
            Authentication authentication,
            @PathVariable Long posLocationId) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(Map.of(
                "posLocationId", posLocationId,
                "revenue", 0,
                "expenses", 0
        ));
    }

    @GetMapping("/{posLocationId}/purchases")
    @Operation(summary = "Get purchase orders for a PoS location")
    public ResponseEntity<List<Map<String, Object>>> purchases(
            Authentication authentication,
            @PathVariable Long posLocationId) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/{posLocationId}/purchases")
    @Operation(summary = "Create a purchase order for a PoS location")
    public ResponseEntity<Map<String, Object>> createPurchase(
            Authentication authentication,
            @PathVariable Long posLocationId,
            @RequestBody Map<String, Object> body) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.status(201).body(Map.of("posLocationId", posLocationId, "status", "created"));
    }

    @GetMapping("/{posLocationId}/reports/staff-hours")
    @Operation(summary = "Get staff hours report for a PoS location")
    public ResponseEntity<Map<String, Object>> staffHoursReport(
            Authentication authentication,
            @PathVariable Long posLocationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(Map.of(
                "posLocationId", posLocationId,
                "from", from != null ? from.toString() : "",
                "to", to != null ? to.toString() : "",
                "rows", List.of()
        ));
    }

    @GetMapping("/{posLocationId}/reports/stock-summary")
    @Operation(summary = "Get stock summary report for a PoS location")
    public ResponseEntity<Map<String, Object>> stockSummaryReport(
            Authentication authentication,
            @PathVariable Long posLocationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        enforceAccess(authentication, posLocationId);
        return ResponseEntity.ok(Map.of(
                "posLocationId", posLocationId,
                "from", from != null ? from.toString() : "",
                "to", to != null ? to.toString() : "",
                "rows", List.of()
        ));
    }

    // ── PoS CRUD ──

    @GetMapping
    @Operation(summary = "List PoS locations",
            description = "Returns all PoS locations. By default only active locations are returned; "
                    + "set `includeInactive=true` to include deactivated ones.")
    @ApiResponse(responseCode = "200", description = "PoS list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PosDto.class))))
    public ResponseEntity<List<PosDto>> list(
            @Parameter(description = "Include deactivated PoS locations")
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(posService.findAll(includeInactive));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get PoS detail",
            description = "Returns a single PoS with its assigned employees and dashboard metrics "
                    + "(employee count, shifts today, last inventory date, low stock alerts).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PoS detail",
                    content = @Content(schema = @Schema(implementation = PosDetailDto.class))),
            @ApiResponse(responseCode = "404", description = "PoS not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PosDetailDto> getById(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(posService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create PoS location",
            description = "Creates a new Point of Sale location. Opening hours are stored as a JSON map "
                    + "with day names as keys and `{open, close, closed}` objects as values.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "PoS created",
                    content = @Content(schema = @Schema(implementation = PosDto.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PosDto> create(@Valid @RequestBody PosDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(posService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update PoS location", description = "Updates an existing PoS location's details.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PoS updated",
                    content = @Content(schema = @Schema(implementation = PosDto.class))),
            @ApiResponse(responseCode = "404", description = "PoS not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PosDto> update(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long id, @RequestBody PosDto dto) {
        return ResponseEntity.ok(posService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete PoS location",
            description = "Deactivates (soft-deletes) a PoS location. The record is kept but marked inactive.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PoS deactivated",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"PoS deactivated successfully\"}"))),
            @ApiResponse(responseCode = "404", description = "PoS not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> delete(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long id) {
        posService.delete(id);
        return ResponseEntity.ok(Map.of("message", "PoS deactivated successfully"));
    }

    // ── Manager list ──

    @GetMapping("/managers")
    @Operation(summary = "List all managers",
            description = "Returns all employees flagged as managers. Useful for the manager dropdown in PoS forms.")
    @ApiResponse(responseCode = "200", description = "Manager list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = EmployeeDto.class))))
    public ResponseEntity<List<EmployeeDto>> managers() {
        return ResponseEntity.ok(employeeService.findManagers());
    }

    // ── Employee operations scoped to a PoS ──

    @GetMapping("/{posId}/employees")
    @Operation(summary = "List employees in a PoS",
            description = "Returns all employees currently assigned to the specified PoS location.")
    @ApiResponse(responseCode = "200", description = "Employee list for PoS",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = EmployeeDto.class))))
    public ResponseEntity<List<EmployeeDto>> listEmployees(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId) {
        return ResponseEntity.ok(employeeService.findByPosId(posId));
    }

    @GetMapping("/{posId}/available-employees")
    @Operation(summary = "List available employees for swap",
            description = "Returns employees that are NOT assigned to this PoS, making them eligible for a swap operation.")
    @ApiResponse(responseCode = "200", description = "Available employees",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = EmployeeDto.class))))
    public ResponseEntity<List<EmployeeDto>> availableEmployees(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId) {
        return ResponseEntity.ok(employeeService.findAvailableForPos(posId));
    }

    @PostMapping("/{posId}/employees")
    @Operation(summary = "Add employee to a PoS",
            description = "Creates a new employee and assigns them to the specified PoS location.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Employee added to PoS",
                    content = @Content(schema = @Schema(implementation = EmployeeDto.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "PoS not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EmployeeDto> addEmployee(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId, @Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(posService.addEmployee(posId, dto));
    }

    @PutMapping("/{posId}/employees/{empId}/assign")
    @Operation(summary = "Assign existing employee to a PoS",
            description = "Assigns an existing employee to the specified PoS location by updating their posId.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee assigned to PoS",
                    content = @Content(schema = @Schema(implementation = EmployeeDto.class))),
            @ApiResponse(responseCode = "404", description = "PoS or employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EmployeeDto> assignEmployee(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId,
            @Parameter(description = "Employee ID", example = "emp-1", required = true)
            @PathVariable String empId) {
        return ResponseEntity.ok(posService.assignEmployee(posId, empId));
    }

    @PutMapping("/{posId}/employees/{empId}")
    @Operation(summary = "Update employee in a PoS",
            description = "Updates the details of an employee within the context of a PoS location.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee updated",
                    content = @Content(schema = @Schema(implementation = EmployeeDto.class))),
            @ApiResponse(responseCode = "404", description = "PoS or employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EmployeeDto> updateEmployee(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId,
            @Parameter(description = "Employee ID", example = "emp-1", required = true)
            @PathVariable String empId, @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(posService.updateEmployee(posId, empId, dto));
    }

    @DeleteMapping("/{posId}/employees/{empId}")
    @Operation(summary = "Remove employee from a PoS",
            description = "Removes the employee's PoS assignment (sets posId to null). The employee record is not deleted.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee removed from PoS",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"Employee removed successfully\"}"))),
            @ApiResponse(responseCode = "404", description = "PoS or employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> removeEmployee(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId,
            @Parameter(description = "Employee ID", example = "emp-1", required = true)
            @PathVariable String empId) {
        posService.removeEmployee(posId, empId);
        return ResponseEntity.ok(Map.of("message", "Employee removed successfully"));
    }

    @PutMapping("/{posId}/employees/{currentEmpId}/swap")
    @Operation(summary = "Swap employee between PoS locations",
            description = "Swaps an employee in this PoS with another employee. "
                    + "The current employee is removed and the new employee is assigned to this PoS.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employees swapped",
                    content = @Content(schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"removedEmployee\": {...}, \"addedEmployee\": {...}}"))),
            @ApiResponse(responseCode = "404", description = "PoS or employee not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, Object>> swapEmployee(
            @Parameter(description = "PoS ID", example = "1", required = true)
            @PathVariable Long posId,
            @Parameter(description = "Current employee ID to remove", example = "emp-1", required = true)
            @PathVariable String currentEmpId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Body containing the new employee ID",
                    content = @Content(examples = @ExampleObject(value = "{\"newEmpId\": \"emp-5\"}")))
            @RequestBody Map<String, String> body) {
        String newEmpId = body.get("newEmpId");
        return ResponseEntity.ok(posService.swapEmployee(posId, currentEmpId, newEmpId));
    }

    // ── Profile endpoints ──

    @GetMapping("/{id}/profile")
    @Operation(summary = "Get terminal profile", description = "Returns extended profile with identity, fiscal, and Google review data.")
    public ResponseEntity<PosProfileDto> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(posService.getProfile(id));
    }

    @PutMapping("/{id}/profile")
    @Operation(summary = "Update terminal profile", description = "Updates identity and fiscal fields.")
    public ResponseEntity<PosProfileDto> updateProfile(@PathVariable Long id, @RequestBody PosProfileDto dto) {
        return ResponseEntity.ok(posService.updateProfile(id, dto));
    }

    @PutMapping("/{id}/photo")
    @Operation(summary = "Update terminal photo", description = "Updates the terminal photo key.")
    public ResponseEntity<PosProfileDto> updatePhoto(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String photoKey = body.get("photoKey");
        return ResponseEntity.ok(posService.updatePhoto(id, photoKey));
    }

    @PutMapping("/{id}/google-reviews")
    @Operation(summary = "Update Google reviews", description = "Updates Google Place ID, rating, reviews data.")
    public ResponseEntity<PosProfileDto> updateGoogleReviews(@PathVariable Long id, @RequestBody PosProfileDto dto) {
        return ResponseEntity.ok(posService.updateGoogleReviews(id, dto));
    }

    // ── Incident endpoints ──

    @GetMapping("/{posId}/incidents")
    @Operation(summary = "List incidents for a terminal")
    public ResponseEntity<List<IncidentDto>> listIncidents(
            @PathVariable Long posId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity) {
        return ResponseEntity.ok(incidentService.findByTerminal(posId, status, category, severity));
    }

    @PostMapping("/{posId}/incidents")
    @Operation(summary = "Declare a new incident")
    public ResponseEntity<IncidentDto> createIncident(
            @PathVariable Long posId,
            @Valid @RequestBody IncidentDto dto) {
        Long userId = dto.getDeclaredBy() != null ? dto.getDeclaredBy() : 1L;
        String userName = dto.getDeclaredByName() != null ? dto.getDeclaredByName() : "System";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.create(posId, dto, userId, userName));
    }

    @GetMapping("/{posId}/incidents/{incidentId}")
    @Operation(summary = "Get incident detail")
    public ResponseEntity<IncidentDto> getIncident(
            @PathVariable Long posId,
            @PathVariable UUID incidentId) {
        return ResponseEntity.ok(incidentService.findById(incidentId));
    }

    @PutMapping("/{posId}/incidents/{incidentId}")
    @Operation(summary = "Update an incident")
    public ResponseEntity<IncidentDto> updateIncident(
            @PathVariable Long posId,
            @PathVariable UUID incidentId,
            @RequestBody IncidentDto dto) {
        return ResponseEntity.ok(incidentService.update(incidentId, dto));
    }

    // ── Admin cross-terminal incidents ──

    @GetMapping("/admin/incidents")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List all incidents across terminals (admin)")
    public ResponseEntity<List<IncidentDto>> listAllIncidents(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(incidentService.findAll(status));
    }

    // ── Helpers ──

    private void enforceAccess(Authentication authentication, Long posLocationId) {
        UUID userId = UUID.fromString(authentication.getName());
        String role = authentication.getAuthorities().iterator().next()
                .getAuthority().replace("ROLE_", "");
        posService.enforcePosLocationAccess(userId, role, posLocationId);
    }
}
