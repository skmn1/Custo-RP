package com.staffscheduler.api.controller;

import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.AbsenceReport;
import com.staffscheduler.api.model.LeaveRequest;
import com.staffscheduler.api.model.ShiftSwapRequest;
import com.staffscheduler.api.repository.AbsenceReportRepository;
import com.staffscheduler.api.repository.AppSettingRepository;
import com.staffscheduler.api.repository.LeaveRequestRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import com.staffscheduler.api.repository.ShiftSwapRequestRepository;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ESS Request Workflows — Task 87
 *
 * Employee-facing endpoints for leave requests, absence reports, and shift swaps.
 * All endpoints are scoped to the authenticated employee (employee_id from JWT).
 */
@RestController
@RequestMapping("/api/ess/requests")
@RequiredArgsConstructor
@Tag(name = "ESS Requests", description = "Employee request workflows — leave, absence, swap")
public class EssRequestController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final AbsenceReportRepository absenceReportRepository;
    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final AppSettingRepository appSettingRepository;

    // ── Leave — Balance ─────────────────────────────────────────

    @GetMapping("/leave/balance")
    @Operation(summary = "Get own leave balances for current year")
    public ResponseEntity<Map<String, Object>> getLeaveBalance(Authentication auth) {
        String empId = resolveEmployeeId(auth);

        // Task 44 service would provide full balances. For now, compute from leave_requests.
        int currentYear = LocalDate.now().getYear();
        List<LeaveRequest> all = leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(empId);

        int usedAnnual = 0, usedSick = 0;
        int pendingAnnual = 0, pendingSick = 0;
        for (LeaveRequest lr : all) {
            if (lr.getStartDate().getYear() != currentYear) continue;
            int days = lr.getTotalDays() != null ? lr.getTotalDays() : 1;
            String type = lr.getLeaveType() != null ? lr.getLeaveType().toLowerCase() : "";
            boolean approved = "approved".equals(lr.getStatus());
            boolean pending = "submitted".equals(lr.getStatus()) || "pending".equals(lr.getStatus());

            if (type.contains("annual")) {
                if (approved) usedAnnual += days;
                if (pending) pendingAnnual += days;
            } else if (type.contains("sick")) {
                if (approved) usedSick += days;
                if (pending) pendingSick += days;
            }
        }

        Map<String, Object> annual = Map.of("total", 25, "used", usedAnnual, "pending", pendingAnnual,
                "available", 25 - usedAnnual - pendingAnnual);
        Map<String, Object> sick = Map.of("total", 10, "used", usedSick, "pending", pendingSick,
                "available", 10 - usedSick - pendingSick);

        return ResponseEntity.ok(Map.of("data", Map.of("annual", annual, "sick", sick)));
    }

    // ── Leave — Types ───────────────────────────────────────────

    @GetMapping("/leave/types")
    @Operation(summary = "Get active leave types")
    public ResponseEntity<Map<String, Object>> getLeaveTypes(Authentication auth) {
        resolveEmployeeId(auth);
        List<Map<String, Object>> types = List.of(
            Map.of("id", 1, "name", "Annual Leave", "color", "#3B82F6"),
            Map.of("id", 2, "name", "Sick Leave", "color", "#EF4444"),
            Map.of("id", 3, "name", "Personal Leave", "color", "#8B5CF6"),
            Map.of("id", 4, "name", "Unpaid Leave", "color", "#6B7280")
        );
        return ResponseEntity.ok(Map.of("data", types));
    }

    // ── Leave — List ────────────────────────────────────────────

    @GetMapping("/leave")
    @Operation(summary = "List own leave requests")
    public ResponseEntity<Map<String, Object>> getLeaveRequests(
            Authentication auth,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status) {

        String empId = resolveEmployeeId(auth);
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(empId);

        List<Map<String, Object>> items = requests.stream()
                .filter(lr -> year == null || lr.getStartDate().getYear() == year)
                .filter(lr -> status == null || status.equalsIgnoreCase(lr.getStatus()))
                .map(this::toLeaveItem)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", items));
    }

    // ── Leave — Submit ──────────────────────────────────────────

    @PostMapping("/leave")
    @Operation(summary = "Submit a new leave request")
    public ResponseEntity<Map<String, Object>> submitLeaveRequest(
            Authentication auth,
            @RequestBody Map<String, Object> body) {

        String empId = resolveEmployeeId(auth);

        String startStr = (String) body.get("startDate");
        String endStr   = (String) body.get("endDate");
        String reason   = (String) body.get("reason");
        Object leaveTypeObj = body.get("leaveTypeId");
        int leaveTypeId = leaveTypeObj instanceof Number ? ((Number) leaveTypeObj).intValue() : 1;

        if (startStr == null || endStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "startDate and endDate are required"));
        }

        LocalDate start = LocalDate.parse(startStr);
        LocalDate end   = LocalDate.parse(endStr);

        if (end.isBefore(start)) {
            return ResponseEntity.badRequest().body(Map.of("error", "endDate must be on or after startDate"));
        }
        if (start.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "startDate must be today or in the future"));
        }

        // Calculate working days (exclude weekends)
        int totalDays = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            if (d.getDayOfWeek().getValue() <= 5) totalDays++;
        }

        // Leave type name
        String leaveTypeName = switch (leaveTypeId) {
            case 2  -> "Sick Leave";
            case 3  -> "Personal Leave";
            case 4  -> "Unpaid Leave";
            default -> "Annual Leave";
        };
        String color = switch (leaveTypeId) {
            case 2  -> "#EF4444";
            case 3  -> "#8B5CF6";
            case 4  -> "#6B7280";
            default -> "#3B82F6";
        };

        // Balance check (non-blocking warning)
        boolean balanceWarning = false;
        if (leaveTypeId == 1) { // Annual
            int usedDays = leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(empId).stream()
                    .filter(lr -> lr.getStartDate().getYear() == start.getYear())
                    .filter(lr -> "approved".equals(lr.getStatus()) || "submitted".equals(lr.getStatus())
                               || "pending".equals(lr.getStatus()))
                    .filter(lr -> lr.getLeaveType() != null && lr.getLeaveType().toLowerCase().contains("annual"))
                    .mapToInt(lr -> lr.getTotalDays() != null ? lr.getTotalDays() : 1)
                    .sum();
            if (usedDays + totalDays > 25) balanceWarning = true;
        }

        LeaveRequest lr = LeaveRequest.builder()
                .id(UUID.randomUUID().toString())
                .employeeId(empId)
                .startDate(start)
                .endDate(end)
                .totalDays(totalDays)
                .leaveType(leaveTypeName)
                .color(color)
                .status("submitted")
                .notes(reason)
                .build();
        leaveRequestRepository.save(lr);

        Map<String, Object> result = toLeaveItem(lr);
        result.put("balanceWarning", balanceWarning);
        return ResponseEntity.status(201).body(result);
    }

    // ── Leave — Cancel ──────────────────────────────────────────

    @DeleteMapping("/leave/{id}")
    @Operation(summary = "Cancel own submitted leave request")
    public ResponseEntity<Map<String, Object>> cancelLeaveRequest(
            Authentication auth,
            @PathVariable String id) {

        String empId = resolveEmployeeId(auth);
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .filter(r -> r.getEmployeeId().equals(empId))
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));

        if (!"submitted".equals(lr.getStatus()) && !"pending".equals(lr.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only submitted requests can be cancelled"));
        }
        lr.setStatus("cancelled");
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(Map.of("message", "Leave request cancelled"));
    }

    // ── Absence — Report ────────────────────────────────────────

    @PostMapping("/absence")
    @Operation(summary = "Report an unplanned absence")
    public ResponseEntity<Map<String, Object>> reportAbsence(
            Authentication auth,
            @RequestBody Map<String, Object> body) {

        String empIdStr = resolveEmployeeId(auth);
        UUID empId;
        try {
            empId = UUID.fromString(empIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid employee ID format"));
        }

        String dateStr     = (String) body.get("absenceDate");
        String absenceType = (String) body.get("absenceType");
        String reason      = (String) body.get("reason");

        if (dateStr == null || absenceType == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "absenceDate and absenceType are required"));
        }

        Set<String> validTypes = Set.of("sick", "late_arrival", "emergency", "personal", "other");
        if (!validTypes.contains(absenceType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid absenceType"));
        }

        LocalDate absenceDate = LocalDate.parse(dateStr);
        if (absenceDate.isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot report a future absence"));
        }

        // Duplicate check
        if (absenceReportRepository.existsByEmployeeIdAndAbsenceDate(empId, absenceDate)) {
            return ResponseEntity.status(409).body(
                    Map.of("error", "An absence report already exists for this date"));
        }

        // cert_required policy: rolling 30-day sick threshold
        boolean certRequired = false;
        if ("sick".equals(absenceType)) {
            int threshold = appSettingRepository
                    .findByCategoryAndSettingKey("hr", "sickCertThreshold")
                    .map(s -> {
                        try { return Integer.parseInt(s.getSettingValue()); }
                        catch (NumberFormatException e) { return 3; }
                    })
                    .orElse(3);
            long sickCount = absenceReportRepository.countSickInWindow(empId, LocalDate.now().minusDays(30));
            if (sickCount >= threshold) certRequired = true;
        }

        AbsenceReport report = AbsenceReport.builder()
                .employeeId(empId)
                .absenceDate(absenceDate)
                .absenceType(absenceType)
                .reason(reason)
                .certRequired(certRequired)
                .certUploaded(false)
                .status("reported")
                .build();

        // Optional late_arrival fields
        if (body.get("expectedStart") instanceof String es) {
            report.setExpectedStart(java.time.LocalTime.parse(es));
        }
        if (body.get("actualStart") instanceof String as) {
            report.setActualStart(java.time.LocalTime.parse(as));
        }

        absenceReportRepository.save(report);

        Map<String, Object> result = toAbsenceItem(report);
        result.put("certRequired", certRequired);
        return ResponseEntity.status(201).body(result);
    }

    // ── Absence — List ──────────────────────────────────────────

    @GetMapping("/absence")
    @Operation(summary = "List own absence reports")
    public ResponseEntity<Map<String, Object>> getAbsenceReports(
            Authentication auth,
            @RequestParam(required = false) Integer year) {

        String empIdStr = resolveEmployeeId(auth);
        UUID empId;
        try { empId = UUID.fromString(empIdStr); }
        catch (IllegalArgumentException e) {
            return ResponseEntity.ok(Map.of("data", List.of()));
        }

        List<AbsenceReport> reports;
        if (year != null) {
            LocalDate from = LocalDate.of(year, 1, 1);
            LocalDate to = LocalDate.of(year, 12, 31);
            reports = absenceReportRepository.findByEmployeeIdAndAbsenceDateBetweenOrderByAbsenceDateDesc(empId, from, to);
        } else {
            reports = absenceReportRepository.findByEmployeeIdOrderByAbsenceDateDesc(empId);
        }

        List<Map<String, Object>> items = reports.stream()
                .map(this::toAbsenceItem)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", items));
    }

    // ── Absence — Cancel ────────────────────────────────────────

    @PatchMapping("/absence/{id}/cancel")
    @Operation(summary = "Cancel own same-day absence report")
    public ResponseEntity<Map<String, Object>> cancelAbsenceReport(
            Authentication auth,
            @PathVariable UUID id) {

        String empIdStr = resolveEmployeeId(auth);
        UUID empId;
        try { empId = UUID.fromString(empIdStr); }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid employee ID"));
        }

        AbsenceReport report = absenceReportRepository.findById(id)
                .filter(r -> r.getEmployeeId().equals(empId))
                .orElseThrow(() -> new ResourceNotFoundException("AbsenceReport", id.toString()));

        if (!"reported".equals(report.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only 'reported' absences can be cancelled"));
        }
        if (!report.getAbsenceDate().equals(LocalDate.now())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Can only cancel same-day absence reports"));
        }

        report.setStatus("cancelled");
        absenceReportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Absence report cancelled"));
    }

    // ── Swap — List ─────────────────────────────────────────────

    @GetMapping("/swap")
    @Operation(summary = "List own swap requests (sent and received)")
    public ResponseEntity<Map<String, Object>> getSwapRequests(Authentication auth) {
        String empId = resolveEmployeeId(auth);
        List<ShiftSwapRequest> swaps = shiftSwapRequestRepository.findByRequesterOrRecipient(empId);

        List<Map<String, Object>> items = swaps.stream()
                .map(this::toSwapItem)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", items));
    }

    // ── Swap — Submit ───────────────────────────────────────────

    @PostMapping("/swap")
    @Operation(summary = "Initiate a shift swap with a colleague")
    public ResponseEntity<Map<String, Object>> submitSwapRequest(
            Authentication auth,
            @RequestBody Map<String, Object> body) {

        String empId = resolveEmployeeId(auth);

        String requesterShiftId = (String) body.get("requesterShiftId");
        String recipientId      = (String) body.get("recipientId");
        String recipientShiftId = (String) body.get("recipientShiftId");
        String reason           = (String) body.get("reason");

        if (requesterShiftId == null || recipientId == null || recipientShiftId == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "requesterShiftId, recipientId, and recipientShiftId are required"));
        }

        // Verify requester owns the shift
        var requesterShift = shiftRepository.findById(requesterShiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", requesterShiftId));
        if (!requesterShift.getEmployeeId().equals(empId)) {
            return ResponseEntity.status(403).body(
                    Map.of("error", "You can only swap your own shifts"));
        }

        // Verify recipient exists
        if (!employeeRepository.existsById(recipientId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient employee not found"));
        }

        // Verify recipient owns their shift
        var recipientShift = shiftRepository.findById(recipientShiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", recipientShiftId));
        if (!recipientShift.getEmployeeId().equals(recipientId)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "recipientShiftId does not belong to the recipient"));
        }

        // Check no active swap exists for either shift
        if (shiftSwapRequestRepository.existsActiveSwapForShift(requesterShiftId)
         || shiftSwapRequestRepository.existsActiveSwapForShift(recipientShiftId)) {
            return ResponseEntity.status(409).body(
                    Map.of("error", "An active swap already exists for one of the selected shifts"));
        }

        ShiftSwapRequest swap = ShiftSwapRequest.builder()
                .requesterId(empId)
                .requesterShiftId(requesterShiftId)
                .recipientId(recipientId)
                .recipientShiftId(recipientShiftId)
                .swapType("direct")
                .status("pending_peer")
                .reason(reason)
                .build();
        shiftSwapRequestRepository.save(swap);

        return ResponseEntity.status(201).body(toSwapItem(swap));
    }

    // ── Swap — Peer Accept ──────────────────────────────────────

    @PatchMapping("/swap/{id}/peer-accept")
    @Operation(summary = "Target employee accepts the proposed swap")
    public ResponseEntity<Map<String, Object>> peerAcceptSwap(
            Authentication auth,
            @PathVariable UUID id) {

        String empId = resolveEmployeeId(auth);
        ShiftSwapRequest swap = shiftSwapRequestRepository.findByIdAndRecipientId(id, empId)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", id.toString()));

        if (!"pending_peer".equals(swap.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Swap is not awaiting peer approval"));
        }

        swap.setStatus("pending_manager");
        swap.setAcceptedAt(OffsetDateTime.now());
        shiftSwapRequestRepository.save(swap);

        return ResponseEntity.ok(toSwapItem(swap));
    }

    // ── Swap — Peer Decline ─────────────────────────────────────

    @PatchMapping("/swap/{id}/peer-decline")
    @Operation(summary = "Target employee declines the proposed swap")
    public ResponseEntity<Map<String, Object>> peerDeclineSwap(
            Authentication auth,
            @PathVariable UUID id) {

        String empId = resolveEmployeeId(auth);
        ShiftSwapRequest swap = shiftSwapRequestRepository.findByIdAndRecipientId(id, empId)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", id.toString()));

        if (!"pending_peer".equals(swap.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Swap is not awaiting peer approval"));
        }

        swap.setStatus("peer_declined");
        shiftSwapRequestRepository.save(swap);

        return ResponseEntity.ok(toSwapItem(swap));
    }

    // ── Swap — Cancel ───────────────────────────────────────────

    @PatchMapping("/swap/{id}/cancel")
    @Operation(summary = "Requester cancels an open swap request")
    public ResponseEntity<Map<String, Object>> cancelSwapRequest(
            Authentication auth,
            @PathVariable UUID id) {

        String empId = resolveEmployeeId(auth);
        ShiftSwapRequest swap = shiftSwapRequestRepository.findByIdAndRequesterId(id, empId)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", id.toString()));

        if (!"pending_peer".equals(swap.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only pending_peer swaps can be cancelled by the requester"));
        }

        swap.setStatus("cancelled");
        shiftSwapRequestRepository.save(swap);

        return ResponseEntity.ok(Map.of("message", "Swap request cancelled"));
    }

    // ── Summary badge ───────────────────────────────────────────

    @GetMapping("/summary")
    @Operation(summary = "Get own pending request counts by type")
    public ResponseEntity<Map<String, Object>> getRequestsSummary(Authentication auth) {
        String empId = resolveEmployeeId(auth);

        long pendingLeave = leaveRequestRepository.findByEmployeeIdOrderByStartDateDesc(empId).stream()
                .filter(lr -> "submitted".equals(lr.getStatus()) || "pending".equals(lr.getStatus()))
                .count();

        UUID empUuid;
        long reportedAbsence = 0;
        try {
            empUuid = UUID.fromString(empId);
            reportedAbsence = absenceReportRepository.findByEmployeeIdOrderByAbsenceDateDesc(empUuid).stream()
                    .filter(a -> "reported".equals(a.getStatus()))
                    .count();
        } catch (IllegalArgumentException ignored) {}

        List<ShiftSwapRequest> swaps = shiftSwapRequestRepository.findByRequesterOrRecipient(empId);
        long pendingPeer = swaps.stream().filter(s -> "pending_peer".equals(s.getStatus())).count();
        long pendingManager = swaps.stream().filter(s -> "pending_manager".equals(s.getStatus())).count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leave",   Map.of("pending", pendingLeave));
        data.put("absence", Map.of("reported", reportedAbsence));
        data.put("swap",    Map.of("pendingPeer", pendingPeer, "pendingManager", pendingManager));

        return ResponseEntity.ok(Map.of("data", data));
    }

    // ── Helpers ──────────────────────────────────────────────────

    private Map<String, Object> toLeaveItem(LeaveRequest lr) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",        lr.getId());
        m.put("startDate", lr.getStartDate().toString());
        m.put("endDate",   lr.getEndDate().toString());
        m.put("totalDays", lr.getTotalDays());
        m.put("leaveType", lr.getLeaveType());
        m.put("color",     lr.getColor());
        m.put("status",    lr.getStatus());
        m.put("reason",    lr.getNotes());
        m.put("createdAt", lr.getCreatedAt() != null ? lr.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toAbsenceItem(AbsenceReport r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",           r.getId().toString());
        m.put("absenceDate",  r.getAbsenceDate().toString());
        m.put("absenceType",  r.getAbsenceType());
        m.put("reason",       r.getReason());
        m.put("expectedStart", r.getExpectedStart() != null ? r.getExpectedStart().toString() : null);
        m.put("actualStart",  r.getActualStart() != null ? r.getActualStart().toString() : null);
        m.put("certRequired", r.isCertRequired());
        m.put("certUploaded", r.isCertUploaded());
        m.put("status",       r.getStatus());
        m.put("createdAt",    r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toSwapItem(ShiftSwapRequest s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",               s.getId().toString());
        m.put("requesterId",      s.getRequesterId());
        m.put("requesterShiftId", s.getRequesterShiftId());
        m.put("recipientId",      s.getRecipientId());
        m.put("recipientShiftId", s.getRecipientShiftId());
        m.put("swapType",         s.getSwapType());
        m.put("status",           s.getStatus());
        m.put("reason",           s.getReason());
        m.put("createdAt",        s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
        return m;
    }

    private String resolveEmployeeId(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        String empId = employeeService.getEmployeeIdByUserId(userId);
        if (empId == null || empId.isBlank()) {
            throw new ResourceNotFoundException("Employee", "linked to user " + userId);
        }
        return empId;
    }
}
