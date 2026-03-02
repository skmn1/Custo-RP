package com.staffscheduler.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.dto.PosDetailDto;
import com.staffscheduler.api.dto.PosDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.model.PointOfSale;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.PosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosService {

    private final PosRepository posRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
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
}
