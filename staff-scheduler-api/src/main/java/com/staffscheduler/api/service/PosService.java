package com.staffscheduler.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.dto.PosDetailDto;
import com.staffscheduler.api.dto.PosDto;
import com.staffscheduler.api.dto.PosProfileDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.model.PointOfSale;
import com.staffscheduler.api.model.PosAssignment;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.PosAssignmentRepository;
import com.staffscheduler.api.repository.PosRepository;
import com.staffscheduler.api.security.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosService {

    private final PosRepository posRepository;
    private final PosAssignmentRepository posAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final IncidentService incidentService;
    private final ObjectMapper objectMapper;

    // ── Queries ──

    public List<PosDto> findAll(boolean includeInactive) {
        List<PointOfSale> list = includeInactive
                ? posRepository.findAll()
                : posRepository.findByIsActiveTrue();
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public PosDetailDto findById(Long id) {
        PointOfSale pos = posRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(id)));

        List<EmployeeDto> employees = employeeService.findByPosId(id);

        return PosDetailDto.builder()
                .id(pos.getId())
                .name(pos.getName())
                .address(pos.getAddress())
                .type(pos.getType())
                .phone(pos.getPhone())
                .managerId(pos.getManagerId())
                .managerName(pos.getManagerName())
                .openingHours(parseOpeningHours(pos.getOpeningHoursJson()))
                .isActive(pos.getIsActive())
                .createdAt(pos.getCreatedAt() != null ? pos.getCreatedAt().toString() : null)
                .updatedAt(pos.getUpdatedAt() != null ? pos.getUpdatedAt().toString() : null)
                .employees(employees)
                .dashboard(PosDetailDto.Dashboard.builder()
                        .employeeCount(employees.size())
                        .shiftsToday(0)
                        .lastInventoryDate(null)
                        .lowStockAlerts(0)
                        .build())
                .build();
    }
    // ── PoS Location-scoped queries ──

    /**
     * Returns PoS locations the current user has access to.
     * SUPER_ADMIN sees all active locations; POS_MANAGER sees only assigned ones.
     */
    public List<PosDto> findMyPosLocations(UUID userId, String role) {
        String normalised = RoleConstants.normalise(role);
        if (RoleConstants.SUPER_ADMIN.equals(normalised)) {
            return findAll(false);
        }
        List<PosAssignment> assignments = posAssignmentRepository.findByUserId(userId);
        List<Long> locationIds = assignments.stream()
                .map(PosAssignment::getPosLocationId)
                .toList();
        if (locationIds.isEmpty()) return List.of();
        return posRepository.findByIdInAndIsActiveTrue(locationIds).stream()
                .map(this::toDto)
                .toList();
    }

    /** @deprecated Use {@link #findMyPosLocations(UUID, String)} instead. */
    @Deprecated
    public List<PosDto> findMyTerminals(UUID userId, String role) {
        return findMyPosLocations(userId, role);
    }

    /**
     * Checks that the given user has access to a specific PoS location.
     * Throws AccessDeniedException if not.
     */
    public void enforcePosLocationAccess(UUID userId, String role, Long posLocationId) {
        String normalised = RoleConstants.normalise(role);
        if (RoleConstants.SUPER_ADMIN.equals(normalised)) return;
        if (!posAssignmentRepository.existsByUserIdAndPosLocationId(userId, posLocationId)) {
            throw new AccessDeniedException("You do not have access to this PoS location");
        }
    }

    /** @deprecated Use {@link #enforcePosLocationAccess(UUID, String, Long)} instead. */
    @Deprecated
    public void enforceTerminalAccess(UUID userId, String role, Long terminalId) {
        enforcePosLocationAccess(userId, role, terminalId);
    }

    /**
     * Returns expanded dashboard KPIs for a PoS location — Sales, Operations and People rows.
     */
    public Map<String, Object> getPosLocationDashboardKpis(Long posLocationId) {
        PointOfSale pos = posRepository.findByIdAndIsActiveTrue(posLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(posLocationId)));

        List<EmployeeDto> employees = employeeService.findByPosId(posLocationId);
        long openIncidents = incidentService.countOpen(posLocationId);

        // Build a LinkedHashMap to support more than 10 entries (Map.of limit)
        java.util.Map<String, Object> kpis = new java.util.LinkedHashMap<>();
        kpis.put("posLocationId", pos.getId());
        kpis.put("posLocationName", pos.getName());
        // Row 1 — Sales
        kpis.put("sessionOpen", false);
        kpis.put("sessionOpenedAt", null);
        kpis.put("salesToday", 0);
        kpis.put("transactionCount", 0);
        kpis.put("avgBasket", 0);
        // Row 2 — Operations
        kpis.put("openPurchaseOrders", 0);
        kpis.put("lowStockAlerts", 0);
        kpis.put("openApInvoices", 0);
        kpis.put("openArInvoices", 0);
        // Row 3 — People
        kpis.put("staffOnShift", 0);
        kpis.put("upcomingShifts", 0);
        kpis.put("pendingLeave", 0);
        kpis.put("nextPayrollDate", null);
        // Legacy fields kept for backwards compatibility
        kpis.put("employeeCount", employees.size());
        kpis.put("openIncidents", openIncidents);
        return kpis;
    }

    /** @deprecated Use {@link #getPosLocationDashboardKpis(Long)} instead. */
    @Deprecated
    public Map<String, Object> getTerminalDashboardKpis(Long terminalId) {
        return getPosLocationDashboardKpis(terminalId);
    }

    /**
     * Returns a daily sales report (placeholder with structure).
     */
    public Map<String, Object> getDailySales(Long posLocationId, LocalDate date) {
        posRepository.findByIdAndIsActiveTrue(posLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(posLocationId)));

        return Map.of(
                "posLocationId", posLocationId,
                "date", date.toString(),
                "totalSales", 0,
                "transactionCount", 0,
                "hourlySales", List.of()
        );
    }

    /**
     * Returns a period summary report (placeholder with structure).
     */
    public Map<String, Object> getPeriodSummary(Long posLocationId, LocalDate from, LocalDate to) {
        posRepository.findByIdAndIsActiveTrue(posLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(posLocationId)));

        return Map.of(
                "posLocationId", posLocationId,
                "from", from.toString(),
                "to", to.toString(),
                "totalSales", 0,
                "totalTransactions", 0,
                "avgDailySales", 0,
                "topItems", List.of()
        );
    }
    // ── Mutations ──

    @Transactional
    public PosDto create(PosDto dto) {
        validateType(dto.getType());

        if (posRepository.existsByNameIgnoreCaseAndIsActiveTrue(dto.getName())) {
            throw new DuplicateResourceException("A PoS with the name \"" + dto.getName() + "\" already exists");
        }

        PointOfSale pos = new PointOfSale();
        applyDto(pos, dto);
        pos.setIsActive(true);
        pos.setCreatedAt(Instant.now());

        return toDto(posRepository.save(pos));
    }

    @Transactional
    public PosDto update(Long id, PosDto dto) {
        PointOfSale pos = posRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(id)));

        if (dto.getName() != null && posRepository.existsByNameIgnoreCaseAndIsActiveTrueAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("A PoS with the name \"" + dto.getName() + "\" already exists");
        }

        // Handle manager change
        String oldManagerId = pos.getManagerId();
        String newManagerId = dto.getManagerId() != null ? dto.getManagerId() : oldManagerId;

        if (!Objects.equals(oldManagerId, newManagerId)) {
            if (oldManagerId != null) {
                employeeRepository.findById(oldManagerId).ifPresent(emp -> {
                    if (Objects.equals(emp.getPosId(), id)) {
                        emp.setPosId(null);
                        employeeRepository.save(emp);
                    }
                });
            }
            if (newManagerId != null) {
                employeeRepository.findById(newManagerId).ifPresent(emp -> {
                    emp.setIsManager(true);
                    emp.setPosId(id);
                    employeeRepository.save(emp);
                });
            }
        }

        applyDto(pos, dto);
        pos.setUpdatedAt(Instant.now());

        return toDto(posRepository.save(pos));
    }

    @Transactional
    public void delete(Long id) {
        PointOfSale pos = posRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS not found or already inactive"));
        pos.setIsActive(false);
        pos.setUpdatedAt(Instant.now());
        posRepository.save(pos);
    }

    // ── Employee operations scoped to PoS ──

    @Transactional
    public EmployeeDto addEmployee(Long posId, EmployeeDto dto) {
        posRepository.findByIdAndIsActiveTrue(posId)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(posId)));

        dto.setPosId(posId);
        return employeeService.create(dto);
    }

    @Transactional
    public EmployeeDto assignEmployee(Long posId, String empId) {
        posRepository.findByIdAndIsActiveTrue(posId)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(posId)));

        Employee emp = employeeService.getEntity(empId);
        emp.setPosId(posId);
        employeeRepository.save(emp);
        return employeeService.findById(empId);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long posId, String empId, EmployeeDto dto) {
        Employee emp = employeeService.getEntity(empId);
        if (!Objects.equals(emp.getPosId(), posId)) {
            throw new ResourceNotFoundException("Employee not found in this PoS");
        }
        return employeeService.update(empId, dto);
    }

    @Transactional
    public void removeEmployee(Long posId, String empId) {
        Employee emp = employeeService.getEntity(empId);
        if (!Objects.equals(emp.getPosId(), posId)) {
            throw new ResourceNotFoundException("Employee not found in this PoS");
        }
        employeeService.delete(empId);
    }

    @Transactional
    public Map<String, Object> swapEmployee(Long posId, String currentEmpId, String newEmpId) {
        Employee current = employeeService.getEntity(currentEmpId);
        if (!Objects.equals(current.getPosId(), posId)) {
            throw new ResourceNotFoundException("Current employee not found in this PoS");
        }
        Employee replacement = employeeService.getEntity(newEmpId);

        Long currentPosId = current.getPosId();
        Long newPosId = replacement.getPosId();

        current.setPosId(newPosId);
        replacement.setPosId(currentPosId);

        employeeRepository.save(current);
        employeeRepository.save(replacement);

        return Map.of("swapped", List.of(
                employeeService.findById(currentEmpId),
                employeeService.findById(newEmpId)
        ));
    }

    // ── Profile ──

    public PosProfileDto getProfile(Long id) {
        PointOfSale pos = posRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(id)));
        return toProfileDto(pos);
    }

    @Transactional
    public PosProfileDto updateProfile(Long id, PosProfileDto dto) {
        PointOfSale pos = posRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(id)));

        if (dto.getAddressLine1() != null) pos.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) pos.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null) pos.setCity(dto.getCity());
        if (dto.getPostalCode() != null) pos.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null) pos.setCountry(dto.getCountry());
        if (dto.getSiret() != null) pos.setSiret(dto.getSiret());
        if (dto.getVatNumber() != null) pos.setVatNumber(dto.getVatNumber());
        if (dto.getNafCode() != null) pos.setNafCode(dto.getNafCode());
        if (dto.getLegalName() != null) pos.setLegalName(dto.getLegalName());
        if (dto.getLaunchedAt() != null) pos.setLaunchedAt(LocalDate.parse(dto.getLaunchedAt()));
        if (dto.getPhone() != null) pos.setPhone(dto.getPhone());

        pos.setUpdatedAt(Instant.now());
        return toProfileDto(posRepository.save(pos));
    }

    @Transactional
    public PosProfileDto updatePhoto(Long id, String photoKey) {
        PointOfSale pos = posRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(id)));
        pos.setPhotoKey(photoKey);
        pos.setUpdatedAt(Instant.now());
        return toProfileDto(posRepository.save(pos));
    }

    @Transactional
    public PosProfileDto updateGoogleReviews(Long id, PosProfileDto dto) {
        PointOfSale pos = posRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PoS", String.valueOf(id)));

        if (dto.getGooglePlaceId() != null) pos.setGooglePlaceId(dto.getGooglePlaceId());
        if (dto.getGoogleMapsUrl() != null) pos.setGoogleMapsUrl(dto.getGoogleMapsUrl());
        if (dto.getGoogleRating() != null) pos.setGoogleRating(dto.getGoogleRating());
        if (dto.getGoogleReviewCount() != null) pos.setGoogleReviewCount(dto.getGoogleReviewCount());
        if (dto.getGoogleReviewsJson() != null) {
            try {
                pos.setGoogleReviewsJson(objectMapper.writeValueAsString(dto.getGoogleReviewsJson()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid Google reviews JSON");
            }
        }
        pos.setGoogleReviewsUpdatedAt(Instant.now());
        pos.setUpdatedAt(Instant.now());
        return toProfileDto(posRepository.save(pos));
    }

    // ── Helpers ──

    private void applyDto(PointOfSale entity, PosDto dto) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getType() != null) entity.setType(dto.getType());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getManagerId() != null) entity.setManagerId(dto.getManagerId());
        if (dto.getManagerName() != null) entity.setManagerName(dto.getManagerName());
        if (dto.getOpeningHours() != null) {
            try {
                entity.setOpeningHoursJson(objectMapper.writeValueAsString(dto.getOpeningHours()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid opening hours format");
            }
        }
    }

    private PosDto toDto(PointOfSale pos) {
        PosDto dto = PosDto.builder()
                .id(pos.getId())
                .name(pos.getName())
                .address(pos.getAddress())
                .type(pos.getType())
                .phone(pos.getPhone())
                .managerId(pos.getManagerId())
                .managerName(pos.getManagerName())
                .isActive(pos.getIsActive())
                .googleRating(pos.getGoogleRating())
                .googleReviewCount(pos.getGoogleReviewCount())
                .openIncidentsCount((int) incidentService.countOpen(pos.getId()))
                .createdAt(pos.getCreatedAt() != null ? pos.getCreatedAt().toString() : null)
                .updatedAt(pos.getUpdatedAt() != null ? pos.getUpdatedAt().toString() : null)
                .build();

        dto.setOpeningHours(parseOpeningHours(pos.getOpeningHoursJson()));
        return dto;
    }

    @SuppressWarnings("unchecked")
    private Map<String, PosDto.DayHours> parseOpeningHours(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, PosDto.DayHours>>() {});
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private void validateType(String type) {
        Set<String> validTypes = Set.of("BUTCHER", "GROCERY", "FAST_FOOD", "MIXED");
        if (type == null || !validTypes.contains(type)) {
            throw new IllegalArgumentException("Invalid type. Must be one of: BUTCHER, GROCERY, FAST_FOOD, MIXED");
        }
    }

    @SuppressWarnings("unchecked")
    private PosProfileDto toProfileDto(PointOfSale pos) {
        Object reviews = null;
        if (pos.getGoogleReviewsJson() != null) {
            try {
                reviews = objectMapper.readValue(pos.getGoogleReviewsJson(), Object.class);
            } catch (JsonProcessingException ignored) {}
        }

        return PosProfileDto.builder()
                .id(pos.getId())
                .name(pos.getName())
                .address(pos.getAddress())
                .type(pos.getType())
                .phone(pos.getPhone())
                .managerId(pos.getManagerId())
                .managerName(pos.getManagerName())
                .openingHours(parseOpeningHoursGeneric(pos.getOpeningHoursJson()))
                .isActive(pos.getIsActive())
                .createdAt(pos.getCreatedAt() != null ? pos.getCreatedAt().toString() : null)
                .updatedAt(pos.getUpdatedAt() != null ? pos.getUpdatedAt().toString() : null)
                .photoUrl(pos.getPhotoKey())
                .addressLine1(pos.getAddressLine1())
                .addressLine2(pos.getAddressLine2())
                .city(pos.getCity())
                .postalCode(pos.getPostalCode())
                .country(pos.getCountry())
                .siret(pos.getSiret())
                .vatNumber(pos.getVatNumber())
                .nafCode(pos.getNafCode())
                .legalName(pos.getLegalName())
                .launchedAt(pos.getLaunchedAt() != null ? pos.getLaunchedAt().toString() : null)
                .googlePlaceId(pos.getGooglePlaceId())
                .googleMapsUrl(pos.getGoogleMapsUrl())
                .googleRating(pos.getGoogleRating())
                .googleReviewCount(pos.getGoogleReviewCount())
                .googleReviewsJson(reviews)
                .googleReviewsUpdatedAt(pos.getGoogleReviewsUpdatedAt() != null ? pos.getGoogleReviewsUpdatedAt().toString() : null)
                .openIncidentsCount(incidentService.countOpen(pos.getId()))
                .build();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseOpeningHoursGeneric(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
