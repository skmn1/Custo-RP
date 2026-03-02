package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.EmployeeDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;

    private static final String[] COLORS = {
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
        "bg-pink-500", "bg-indigo-500", "bg-red-500", "bg-yellow-500",
        "bg-teal-500", "bg-cyan-500", "bg-rose-500", "bg-amber-500", "bg-violet-500"
    };

    // ── Queries ──

    public List<EmployeeDto> findAll(String search, String department, String role, String sort, String order) {
        List<Employee> employees = new ArrayList<>(repository.findFiltered(
                (search != null && search.isBlank()) ? null : search,
                (department != null && department.isBlank()) ? null : department,
                (role != null && role.isBlank()) ? null : role));

        // Sort in Java for flexibility
        Comparator<Employee> comparator = getComparator(sort != null ? sort : "name");
        if ("desc".equalsIgnoreCase(order)) comparator = comparator.reversed();
        employees.sort(comparator);

        return employees.stream().map(this::toDto).collect(Collectors.toList());
    }

    public EmployeeDto findById(String id) {
        return toDto(getEntity(id));
    }

    public List<EmployeeDto> findByPosId(Long posId) {
        return repository.findByPosId(posId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EmployeeDto> findManagers() {
        return repository.findByIsManagerTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EmployeeDto> findAvailableForPos(Long posId) {
        return repository.findAll().stream()
                .filter(e -> e.getPosId() == null || !e.getPosId().equals(posId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<String> getDepartments() {
        return repository.findAll().stream()
                .map(Employee::getDepartment)
                .distinct().sorted()
                .collect(Collectors.toList());
    }

    public List<String> getRoles() {
        return repository.findAll().stream()
                .map(Employee::getRole)
                .distinct().sorted()
                .collect(Collectors.toList());
    }

    // ── Mutations ──

    @Transactional
    public EmployeeDto create(EmployeeDto dto) {
        // Check email uniqueness
        repository.findByEmail(dto.getEmail()).ifPresent(existing -> {
            throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
        });

        Employee employee = new Employee();
        employee.setId("emp" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6));
        applyDto(employee, dto);
        employee.setAvatar(generateAvatar(dto.getName()));
        employee.setColor(dto.getColor() != null ? dto.getColor() : randomColor());
        if (employee.getIsManager() == null) employee.setIsManager(false);

        return toDto(repository.save(employee));
    }

    @Transactional
    public EmployeeDto update(String id, EmployeeDto dto) {
        Employee employee = getEntity(id);

        // Check email uniqueness if changed
        if (dto.getEmail() != null && !dto.getEmail().equals(employee.getEmail())) {
            if (repository.existsByEmailAndIdNot(dto.getEmail(), id)) {
                throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
            }
        }

        applyDto(employee, dto);
        if (dto.getName() != null) {
            employee.setAvatar(generateAvatar(dto.getName()));
        }

        return toDto(repository.save(employee));
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Employee", id);
        }
        repository.deleteById(id);
    }

    // ── Helpers ──

    public Employee getEntity(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
    }

    private void applyDto(Employee entity, EmployeeDto dto) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getRole() != null) entity.setRole(dto.getRole());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getMaxHours() != null) entity.setMaxHours(dto.getMaxHours());
        if (dto.getDepartment() != null) entity.setDepartment(dto.getDepartment());
        if (dto.getPosId() != null) entity.setPosId(dto.getPosId());
        if (dto.getIsManager() != null) entity.setIsManager(dto.getIsManager());
        if (dto.getColor() != null) entity.setColor(dto.getColor());
    }

    private EmployeeDto toDto(Employee e) {
        return EmployeeDto.builder()
                .id(e.getId())
                .name(e.getName())
                .role(e.getRole())
                .avatar(e.getAvatar())
                .color(e.getColor())
                .email(e.getEmail())
                .maxHours(e.getMaxHours())
                .department(e.getDepartment())
                .posId(e.getPosId())
                .isManager(e.getIsManager())
                .build();
    }

    private String generateAvatar(String name) {
        if (name == null) return "??";
        return Arrays.stream(name.split("\\s+"))
                .map(part -> String.valueOf(part.charAt(0)))
                .collect(Collectors.joining())
                .toUpperCase();
    }

    private String randomColor() {
        return COLORS[new Random().nextInt(COLORS.length)];
    }

    private Comparator<Employee> getComparator(String field) {
        return switch (field.toLowerCase()) {
            case "department" -> Comparator.comparing(Employee::getDepartment, String.CASE_INSENSITIVE_ORDER);
            case "role" -> Comparator.comparing(Employee::getRole, String.CASE_INSENSITIVE_ORDER);
            case "email" -> Comparator.comparing(Employee::getEmail, String.CASE_INSENSITIVE_ORDER);
            case "maxhours", "hours" -> Comparator.comparingInt(Employee::getMaxHours);
            default -> Comparator.comparing(Employee::getName, String.CASE_INSENSITIVE_ORDER);
        };
    }
}
