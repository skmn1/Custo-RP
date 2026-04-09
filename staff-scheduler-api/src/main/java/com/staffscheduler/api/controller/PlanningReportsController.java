package com.staffscheduler.api.controller;

import com.staffscheduler.api.service.ShiftService;
import com.staffscheduler.api.dto.ShiftDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/planning/reports")
@RequiredArgsConstructor
@Tag(name = "Planning Reports", description = "Planning KPI and analytics endpoints")
public class PlanningReportsController {

    private final ShiftService shiftService;

    @GetMapping("/coverage")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER')")
    @Operation(summary = "Weekly coverage",
            description = "Returns headcount-per-day data for weekly coverage chart.")
    public ResponseEntity<List<Map<String, Object>>> getCoverage(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<ShiftDto> shifts = shiftService.findAll(startDate, endDate, null, null, null);
        Map<Integer, Long> countByDay = shifts.stream()
                .filter(s -> s.getDay() != null)
                .collect(Collectors.groupingBy(ShiftDto::getDay, Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (int i = 0; i < 7; i++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("day", i);
            entry.put("label", dayNames[i]);
            entry.put("count", countByDay.getOrDefault(i, 0L));
            entry.put("target", 5);
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/overtime")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PLANNER')")
    @Operation(summary = "Overtime summary",
            description = "Returns employees exceeding the weekly hours threshold.")
    public ResponseEntity<List<Map<String, Object>>> getOvertime(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "40") int threshold) {
        List<ShiftDto> shifts = shiftService.findAll(startDate, endDate, null, null, null);
        Map<String, Double> hoursPerEmployee = shifts.stream()
                .filter(s -> s.getEmployeeId() != null)
                .collect(Collectors.groupingBy(
                        ShiftDto::getEmployeeId,
                        Collectors.summingDouble(s -> s.getDuration() != null ? s.getDuration() : 0.0)));

        List<Map<String, Object>> result = hoursPerEmployee.entrySet().stream()
                .filter(e -> e.getValue() > threshold)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("employeeId", e.getKey());
                    entry.put("hours", e.getValue());
                    return entry;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
