package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.IncidentDto;
import com.staffscheduler.api.model.PosTerminalIncident;
import com.staffscheduler.api.repository.PosTerminalIncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final PosTerminalIncidentRepository repo;

    public List<IncidentDto> findByTerminal(Long terminalId, String status, String category, String severity) {
        return repo.findFiltered(terminalId, status, category, severity)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public IncidentDto findById(UUID id) {
        return toDto(repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found")));
    }

    public IncidentDto create(Long terminalId, IncidentDto dto, Long userId, String userName) {
        validateCategory(dto.getCategory());
        String sev = dto.getSeverity() != null ? dto.getSeverity() : "medium";
        validateSeverity(sev);

        PosTerminalIncident incident = PosTerminalIncident.builder()
                .terminalId(terminalId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .severity(sev)
                .status("open")
                .declaredBy(userId)
                .declaredByName(userName)
                .declaredAt(Instant.now())
                .build();
        return toDto(repo.save(incident));
    }

    public IncidentDto update(UUID id, IncidentDto dto) {
        PosTerminalIncident incident = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        if (dto.getTitle() != null) incident.setTitle(dto.getTitle());
        if (dto.getDescription() != null) incident.setDescription(dto.getDescription());
        if (dto.getCategory() != null) { validateCategory(dto.getCategory()); incident.setCategory(dto.getCategory()); }
        if (dto.getSeverity() != null) { validateSeverity(dto.getSeverity()); incident.setSeverity(dto.getSeverity()); }

        // Auto-status transitions
        if (dto.getAssignedTo() != null) {
            incident.setAssignedTo(dto.getAssignedTo());
            incident.setAssignedToName(dto.getAssignedToName());
            if ("open".equals(incident.getStatus())) {
                incident.setStatus("in_progress");
            }
        }

        if (dto.getResolutionNote() != null) {
            incident.setResolutionNote(dto.getResolutionNote());
        }

        if (dto.getResolvedAt() != null || "resolved".equals(dto.getStatus())) {
            incident.setResolvedAt(Instant.now());
            incident.setResolvedBy(dto.getResolvedBy());
            incident.setResolvedByName(dto.getResolvedByName());
            incident.setStatus("resolved");
        }

        if ("closed".equals(dto.getStatus())) {
            incident.setStatus("closed");
        }

        if (dto.getStatus() != null && !"resolved".equals(dto.getStatus()) && !"closed".equals(dto.getStatus())) {
            validateStatus(dto.getStatus());
            incident.setStatus(dto.getStatus());
        }

        return toDto(repo.save(incident));
    }

    public long countOpen(Long terminalId) {
        return repo.countByTerminalIdAndStatus(terminalId, "open")
                + repo.countByTerminalIdAndStatus(terminalId, "in_progress");
    }

    public long countCriticalOpen(Long terminalId) {
        return repo.countByTerminalIdAndStatusAndSeverity(terminalId, "open", "critical")
                + repo.countByTerminalIdAndStatusAndSeverity(terminalId, "in_progress", "critical");
    }

    public List<IncidentDto> findAll(String status) {
        List<PosTerminalIncident> incidents = status != null
                ? repo.findByStatusOrderByDeclaredAtDesc(status)
                : repo.findAllOrderByDeclaredAtDesc();
        return incidents.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── mapping ──

    private IncidentDto toDto(PosTerminalIncident i) {
        return IncidentDto.builder()
                .id(i.getId() != null ? i.getId().toString() : null)
                .terminalId(i.getTerminalId())
                .title(i.getTitle())
                .description(i.getDescription())
                .category(i.getCategory())
                .severity(i.getSeverity())
                .status(i.getStatus())
                .declaredBy(i.getDeclaredBy())
                .declaredByName(i.getDeclaredByName())
                .declaredAt(i.getDeclaredAt() != null ? i.getDeclaredAt().toString() : null)
                .assignedTo(i.getAssignedTo())
                .assignedToName(i.getAssignedToName())
                .resolvedBy(i.getResolvedBy())
                .resolvedByName(i.getResolvedByName())
                .resolvedAt(i.getResolvedAt() != null ? i.getResolvedAt().toString() : null)
                .resolutionNote(i.getResolutionNote())
                .updatedAt(i.getUpdatedAt() != null ? i.getUpdatedAt().toString() : null)
                .build();
    }

    private void validateCategory(String cat) {
        if (!Arrays.asList(PosTerminalIncident.VALID_CATEGORIES).contains(cat)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category: " + cat);
        }
    }

    private void validateSeverity(String sev) {
        if (!Arrays.asList(PosTerminalIncident.VALID_SEVERITIES).contains(sev)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid severity: " + sev);
        }
    }

    private void validateStatus(String st) {
        if (!Arrays.asList(PosTerminalIncident.VALID_STATUSES).contains(st)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + st);
        }
    }
}
