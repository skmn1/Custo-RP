package com.staffscheduler.api.controller;

import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.AbsenceReport;
import com.staffscheduler.api.model.LeaveRequest;
import com.staffscheduler.api.model.Shift;
import com.staffscheduler.api.model.ShiftSwapRequest;
import com.staffscheduler.api.repository.AbsenceReportRepository;
import com.staffscheduler.api.repository.LeaveRequestRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import com.staffscheduler.api.repository.ShiftSwapRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * HR Request Management — Task 87
 *
 * Manager-facing endpoints for reviewing leave requests, absence reports, and shift swaps.
 * All endpoints require HR_MANAGER or SUPER_ADMIN role.
 */
@RestController
@RequestMapping("/api/hr/requests")
@RequiredArgsConstructor
@Tag(name = "HR Requests", description = "Manager request review — leave, absence, swap")
public class HrRequestController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final AbsenceReportRepository absenceReportRepository;
    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final ShiftRepository shiftRepository;

    // ── Unified list ────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List all requests with type/status filters")
    public ResponseEntity<Map<String, Object>> getRequests(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        List<Map<String, Object>> results = new ArrayList<>();

        boolean includeLeave   = type == null || "leave".equalsIgnoreCase(type);
        boolean includeAbsence = type == null || "absence".equalsIgnoreCase(type);
        boolean includeSwap    = type == null || "swap".equalsIgnoreCase(type);

        if (includeLeave) {
            List<LeaveRequest> leaves = (status != null)
                    ? leaveRequestRepository.findByStatusInOrderByCreatedAtDesc(List.of(status))
                    : leaveRequestRepository.findAllByOrderByCreatedAtDesc();
            for (LeaveRequest lr : leaves) {
                Map<String, Object> item = toLeaveItem(lr);
                item.put("requestType", "leave");
                results.add(item);
            }
        }

        if (includeAbsence) {
            List<AbsenceReport> absences = (status != null)
                    ? absenceReportRepository.findByStatusInOrderByCreatedAtDesc(List.of(status))
                    : absenceReportRepository.findOpenReports();
            if (status != null) {
                // use filtered list as-is
            } else {
                // include all for the combined view
                absences = absenceReportRepository.findByStatusInOrderByCreatedAtDesc(
                        List.of("reported", "acknowledged", "disputed", "cancelled"));
            }
            for (AbsenceReport a : absences) {
                Map<String, Object> item = toAbsenceItem(a);
                item.put("requestType", "absence");
                results.add(item);
            }
        }

        if (includeSwap) {
            List<ShiftSwapRequest> swaps = (status != null)
                    ? shiftSwapRequestRepository.findByStatusInOrderByCreatedAtDesc(List.of(status))
                    : shiftSwapRequestRepository.findAllByOrderByCreatedAtDesc();
            for (ShiftSwapRequest s : swaps) {
                Map<String, Object> item = toSwapItem(s);
                item.put("requestType", "swap");
                results.add(item);
            }
        }

        // Sort by createdAt descending
        results.sort((a, b) -> {
            String ca = (String) a.getOrDefault("createdAt", "");
            String cb = (String) b.getOrDefault("createdAt", "");
            return cb.compareTo(ca);
        });

        return ResponseEntity.ok(Map.of("data", results));
    }

    // ── CSV export ──────────────────────────────────────────────

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Export requests as CSV")
    public ResponseEntity<String> exportCsv(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        StringWriter sw = new StringWriter();
        sw.write("type,id,employeeId,status,detail,createdAt\n");

        boolean includeLeave   = type == null || "leave".equalsIgnoreCase(type);
        boolean includeAbsence = type == null || "absence".equalsIgnoreCase(type);
        boolean includeSwap    = type == null || "swap".equalsIgnoreCase(type);

        if (includeLeave) {
            List<LeaveRequest> leaves = (status != null)
                    ? leaveRequestRepository.findByStatusInOrderByCreatedAtDesc(List.of(status))
                    : leaveRequestRepository.findAllByOrderByCreatedAtDesc();
            for (LeaveRequest lr : leaves) {
                sw.write(String.format("leave,%s,%s,%s,%s %s–%s,%s\n",
                        escapeCsv(lr.getId()),
                        escapeCsv(lr.getEmployeeId()),
                        escapeCsv(lr.getStatus()),
                        escapeCsv(lr.getLeaveType()),
                        lr.getStartDate(), lr.getEndDate(),
                        lr.getCreatedAt()));
            }
        }

        if (includeAbsence) {
            List<AbsenceReport> absences = allAbsenceReports(status);
            for (AbsenceReport a : absences) {
                sw.write(String.format("absence,%s,%s,%s,%s %s,%s\n",
                        a.getId(),
                        a.getEmployeeId(),
                        escapeCsv(a.getStatus()),
                        escapeCsv(a.getAbsenceType()),
                        a.getAbsenceDate(),
                        a.getCreatedAt()));
            }
        }

        if (includeSwap) {
            List<ShiftSwapRequest> swaps = (status != null)
                    ? shiftSwapRequestRepository.findByStatusInOrderByCreatedAtDesc(List.of(status))
                    : shiftSwapRequestRepository.findAllByOrderByCreatedAtDesc();
            for (ShiftSwapRequest s : swaps) {
                sw.write(String.format("swap,%s,%s,%s,%s↔%s,%s\n",
                        s.getId(),
                        escapeCsv(s.getRequesterId()),
                        escapeCsv(s.getStatus()),
                        escapeCsv(s.getRequesterShiftId()),
                        escapeCsv(s.getRecipientShiftId()),
                        s.getCreatedAt()));
            }
        }

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=requests-export.csv")
                .body(sw.toString());
    }

    // ── Leave — Approve ─────────────────────────────────────────

    @PutMapping("/leave/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Approve a leave request")
    public ResponseEntity<Map<String, Object>> approveLeave(
            Authentication auth,
            @PathVariable String id) {

        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));

        if (!"submitted".equals(lr.getStatus()) && !"pending".equals(lr.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "Only submitted/pending requests can be approved")));
        }

        lr.setStatus("approved");
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(toLeaveItem(lr));
    }

    // ── Leave — Reject ──────────────────────────────────────────

    @PutMapping("/leave/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Reject a leave request")
    public ResponseEntity<Map<String, Object>> rejectLeave(
            Authentication auth,
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body) {

        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));

        if (!"submitted".equals(lr.getStatus()) && !"pending".equals(lr.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "Only submitted/pending requests can be rejected")));
        }

        lr.setStatus("rejected");
        if (body != null && body.get("reason") instanceof String reason) {
            lr.setNotes(lr.getNotes() != null ? lr.getNotes() + " | Rejected: " + reason : "Rejected: " + reason);
        }
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(toLeaveItem(lr));
    }

    // ── Absence — Acknowledge ───────────────────────────────────

    @PatchMapping("/absence/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Acknowledge an absence report")
    public ResponseEntity<Map<String, Object>> acknowledgeAbsence(
            Authentication auth,
            @PathVariable UUID id) {

        UUID reviewerId = UUID.fromString(auth.getName());
        AbsenceReport report = absenceReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AbsenceReport", id.toString()));

        if (!"reported".equals(report.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "Only reported absences can be acknowledged")));
        }

        report.setStatus("acknowledged");
        report.setAcknowledgedBy(reviewerId);
        report.setAcknowledgedAt(OffsetDateTime.now());
        absenceReportRepository.save(report);
        return ResponseEntity.ok(toAbsenceItem(report));
    }

    // ── Absence — Dispute ───────────────────────────────────────

    @PatchMapping("/absence/{id}/dispute")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Dispute an absence report")
    public ResponseEntity<Map<String, Object>> disputeAbsence(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        UUID reviewerId = UUID.fromString(auth.getName());
        String disputeReason = body != null ? (String) body.get("reason") : null;
        if (disputeReason == null || disputeReason.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "reason is required when disputing")));
        }

        AbsenceReport report = absenceReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AbsenceReport", id.toString()));

        if (!"reported".equals(report.getStatus()) && !"acknowledged".equals(report.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "Cannot dispute an absence with status: " + report.getStatus())));
        }

        report.setStatus("disputed");
        report.setDisputedBy(reviewerId);
        report.setDisputedAt(OffsetDateTime.now());
        report.setDisputeReason(disputeReason);
        absenceReportRepository.save(report);
        return ResponseEntity.ok(toAbsenceItem(report));
    }

    // ── Absence — Set cert required ─────────────────────────────

    @PatchMapping("/absence/{id}/cert-required")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Manually toggle cert_required flag")
    public ResponseEntity<Map<String, Object>> setAbsenceCertRequired(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        AbsenceReport report = absenceReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AbsenceReport", id.toString()));

        Boolean certRequired = body != null ? (Boolean) body.get("certRequired") : null;
        if (certRequired == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "certRequired boolean is required")));
        }

        report.setCertRequired(certRequired);
        absenceReportRepository.save(report);
        return ResponseEntity.ok(toAbsenceItem(report));
    }

    // ── Swap — Approve ──────────────────────────────────────────

    @PutMapping("/swap/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Approve a swap request — atomically reassigns shifts")
    public ResponseEntity<Map<String, Object>> approveSwap(
            Authentication auth,
            @PathVariable UUID id) {

        UUID reviewerId = UUID.fromString(auth.getName());
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", id.toString()));

        if (!"pending_manager".equals(swap.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "Swap must be in pending_manager status to approve")));
        }

        // Atomic shift reassignment
        Shift requesterShift = shiftRepository.findById(swap.getRequesterShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift", swap.getRequesterShiftId()));
        Shift recipientShift = shiftRepository.findById(swap.getRecipientShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift", swap.getRecipientShiftId()));

        String tempEmpId = requesterShift.getEmployeeId();
        requesterShift.setEmployeeId(recipientShift.getEmployeeId());
        recipientShift.setEmployeeId(tempEmpId);
        shiftRepository.save(requesterShift);
        shiftRepository.save(recipientShift);

        swap.setStatus("approved");
        swap.setReviewedBy(reviewerId);
        swap.setReviewedAt(OffsetDateTime.now());
        shiftSwapRequestRepository.save(swap);

        return ResponseEntity.ok(toSwapItem(swap));
    }

    // ── Swap — Reject ───────────────────────────────────────────

    @PutMapping("/swap/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Reject a swap request")
    public ResponseEntity<Map<String, Object>> rejectSwap(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {

        UUID reviewerId = UUID.fromString(auth.getName());
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", id.toString()));

        if (!"pending_manager".equals(swap.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", Map.of("message", "Swap must be in pending_manager status to reject")));
        }

        swap.setStatus("rejected");
        swap.setReviewedBy(reviewerId);
        swap.setReviewedAt(OffsetDateTime.now());
        if (body != null && body.get("reason") instanceof String r) {
            swap.setReason(swap.getReason() != null ? swap.getReason() + " | Rejected: " + r : "Rejected: " + r);
        }
        shiftSwapRequestRepository.save(swap);

        return ResponseEntity.ok(toSwapItem(swap));
    }

    // ── Helpers ──────────────────────────────────────────────────

    private List<AbsenceReport> allAbsenceReports(String status) {
        if (status != null) {
            return absenceReportRepository.findByStatusInOrderByCreatedAtDesc(List.of(status));
        }
        return absenceReportRepository.findByStatusInOrderByCreatedAtDesc(
                List.of("reported", "acknowledged", "disputed", "cancelled"));
    }

    private Map<String, Object> toLeaveItem(LeaveRequest lr) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",         lr.getId());
        m.put("employeeId", lr.getEmployeeId());
        m.put("startDate",  lr.getStartDate().toString());
        m.put("endDate",    lr.getEndDate().toString());
        m.put("totalDays",  lr.getTotalDays());
        m.put("leaveType",  lr.getLeaveType());
        m.put("status",     lr.getStatus());
        m.put("reason",     lr.getNotes());
        m.put("createdAt",  lr.getCreatedAt() != null ? lr.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toAbsenceItem(AbsenceReport r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",           r.getId().toString());
        m.put("employeeId",   r.getEmployeeId().toString());
        m.put("absenceDate",  r.getAbsenceDate().toString());
        m.put("absenceType",  r.getAbsenceType());
        m.put("reason",       r.getReason());
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

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
