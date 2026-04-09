package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.ShiftDto;
import com.staffscheduler.api.dto.ShiftMoveDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Shift;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;

    private static final Map<String, String> SHIFT_COLORS = Map.of(
            "Morning", "bg-blue-100 border-blue-300 text-blue-800",
            "Day", "bg-green-100 border-green-300 text-green-800",
            "Evening", "bg-orange-100 border-orange-300 text-orange-800",
            "Night", "bg-purple-100 border-purple-300 text-purple-800",
            "Admin", "bg-pink-100 border-pink-300 text-pink-800",
            "Regular", "bg-blue-100 border-blue-300 text-blue-800",
            "Overtime", "bg-red-100 border-red-300 text-red-800",
            "Training", "bg-green-100 border-green-300 text-green-800",
            "Meeting", "bg-yellow-100 border-yellow-300 text-yellow-800",
            "Break", "bg-gray-100 border-gray-300 text-gray-800"
    );

    // ── Queries ──

    public List<ShiftDto> findAll(String startDate, String endDate,
                                   String employeeId, String department, String type) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;

        List<Shift> shifts = shiftRepository.findFiltered(start, end,
                blankToNull(employeeId), blankToNull(department), blankToNull(type));

        return shifts.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ShiftDto> findByWeek(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        return shiftRepository.findByDateBetween(weekStart, weekEnd)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ShiftDto findById(String id) {
        return toDto(getEntity(id));
    }

    // ── Mutations ──

    @Transactional
    public ShiftDto create(ShiftDto dto) {
        // Validate employee exists
        if (!employeeRepository.existsById(dto.getEmployeeId())) {
            throw new ResourceNotFoundException("Employee", dto.getEmployeeId());
        }

        Shift shift = new Shift();
        shift.setId("shift" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6));

        // Derive date when not explicitly provided.
        // Frontend sends `day` (0=Mon … 6=Sun); map it to the current week's actual date.
        if (dto.getDate() == null) {
            if (dto.getDay() != null) {
                LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                shift.setDate(monday.plusDays(dto.getDay()));
            } else {
                shift.setDate(LocalDate.now());
            }
        }

        applyDto(shift, dto);

        return toDto(shiftRepository.save(shift));
    }

    @Transactional
    public ShiftDto update(String id, ShiftDto dto) {
        Shift shift = getEntity(id);
        applyDto(shift, dto);
        return toDto(shiftRepository.save(shift));
    }

    @Transactional
    public ShiftDto moveShift(String id, ShiftMoveDto moveDto) {
        Shift shift = getEntity(id);

        if (moveDto.getEmployeeId() != null) {
            if (!employeeRepository.existsById(moveDto.getEmployeeId())) {
                throw new ResourceNotFoundException("Employee", moveDto.getEmployeeId());
            }
            shift.setEmployeeId(moveDto.getEmployeeId());
        }

        if (moveDto.getDate() != null) {
            shift.setDate(LocalDate.parse(moveDto.getDate()));
        } else if (moveDto.getDay() != null) {
            // Convert day index to actual date using the same week as the current shift
            LocalDate monday = shift.getDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            shift.setDate(monday.plusDays(moveDto.getDay()));
        }

        return toDto(shiftRepository.save(shift));
    }

    @Transactional
    public void delete(String id) {
        if (!shiftRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shift", id);
        }
        shiftRepository.deleteById(id);
    }

    // ── Helpers ──

    private Shift getEntity(String id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", id));
    }

    private void applyDto(Shift entity, ShiftDto dto) {
        if (dto.getEmployeeId() != null) entity.setEmployeeId(dto.getEmployeeId());

        if (dto.getDate() != null) {
            entity.setDate(LocalDate.parse(dto.getDate()));
        }

        if (dto.getStartTime() != null) entity.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) entity.setEndTime(dto.getEndTime());

        // Compute duration
        if (entity.getStartTime() != null && entity.getEndTime() != null) {
            entity.setDuration(dto.getDuration() != null ? dto.getDuration()
                    : Shift.calculateDuration(entity.getStartTime(), entity.getEndTime()));
        }

        if (dto.getType() != null) entity.setType(dto.getType());
        if (dto.getDepartment() != null) entity.setDepartment(dto.getDepartment());

        // Set color from type if not explicitly set
        String type = entity.getType() != null ? entity.getType() : "Regular";
        entity.setColor(dto.getColor() != null ? dto.getColor()
                : SHIFT_COLORS.getOrDefault(type, "bg-blue-100 border-blue-300 text-blue-800"));
    }

    private ShiftDto toDto(Shift s) {
        return ShiftDto.builder()
                .id(s.getId())
                .employeeId(s.getEmployeeId())
                .date(s.getDate() != null ? s.getDate().toString() : null)
                .day(s.getDayIndex())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .duration(s.getDuration())
                .type(s.getType())
                .color(s.getColor())
                .department(s.getDepartment())
                .build();
    }

    private String blankToNull(String value) {
        return (value != null && value.isBlank()) ? null : value;
    }
}
