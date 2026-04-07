package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.DepartmentDto;
import com.staffscheduler.api.model.Department;
import com.staffscheduler.api.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAll() {
        return departmentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<DepartmentDto> getActive() {
        return departmentRepository.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto create(DepartmentDto dto) {
        Department dept = Department.builder()
            .nameEn(dto.getNameEn())
            .nameFr(dto.getNameFr())
            .color(dto.getColor())
            .managerId(dto.getManagerId())
            .active(dto.getActive() != null ? dto.getActive() : true)
            .build();
        return toDto(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentDto update(UUID id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        if (dto.getNameEn() != null) dept.setNameEn(dto.getNameEn());
        if (dto.getNameFr() != null) dept.setNameFr(dto.getNameFr());
        if (dto.getColor() != null) dept.setColor(dto.getColor());
        if (dto.getManagerId() != null) dept.setManagerId(dto.getManagerId());
        if (dto.getActive() != null) dept.setActive(dto.getActive());
        return toDto(departmentRepository.save(dept));
    }

    @Transactional
    public void delete(UUID id) {
        departmentRepository.deleteById(id);
    }

    private DepartmentDto toDto(Department d) {
        return DepartmentDto.builder()
            .id(d.getId())
            .nameEn(d.getNameEn())
            .nameFr(d.getNameFr())
            .color(d.getColor())
            .managerId(d.getManagerId())
            .active(d.getActive())
            .build();
    }
}
