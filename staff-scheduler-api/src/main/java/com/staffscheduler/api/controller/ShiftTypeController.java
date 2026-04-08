package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.ShiftTypeDto;
import com.staffscheduler.api.service.ShiftTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shift-types")
@RequiredArgsConstructor
@Tag(name = "Shift Types", description = "Shift type management")
public class ShiftTypeController {

    private final ShiftTypeService shiftTypeService;

    @GetMapping
    @Operation(summary = "List all shift types")
    public ResponseEntity<List<ShiftTypeDto>> getAll() {
        return ResponseEntity.ok(shiftTypeService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a new shift type")
    public ResponseEntity<ShiftTypeDto> create(@RequestBody ShiftTypeDto dto) {
        return ResponseEntity.ok(shiftTypeService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update an existing shift type")
    public ResponseEntity<ShiftTypeDto> update(@PathVariable UUID id, @RequestBody ShiftTypeDto dto) {
        return ResponseEntity.ok(shiftTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Delete a shift type")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        shiftTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
