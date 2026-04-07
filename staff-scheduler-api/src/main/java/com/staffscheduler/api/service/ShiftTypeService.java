package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.ShiftTypeDto;
import com.staffscheduler.api.model.ShiftType;
import com.staffscheduler.api.repository.ShiftTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftTypeService {

    private final ShiftTypeRepository shiftTypeRepository;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public List<ShiftTypeDto> getAll() {
        return shiftTypeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ShiftTypeDto> getActive() {
        return shiftTypeRepository.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ShiftTypeDto create(ShiftTypeDto dto) {
        ShiftType st = ShiftType.builder()
            .nameEn(dto.getNameEn())
            .nameFr(dto.getNameFr())
            .defaultStart(dto.getDefaultStart() != null ? LocalTime.parse(dto.getDefaultStart(), TIME_FMT) : null)
            .durationHours(dto.getDurationHours())
            .color(dto.getColor())
            .active(dto.getActive() != null ? dto.getActive() : true)
            .build();
        return toDto(shiftTypeRepository.save(st));
    }

    @Transactional
    public ShiftTypeDto update(UUID id, ShiftTypeDto dto) {
        ShiftType st = shiftTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shift type not found: " + id));
        if (dto.getNameEn() != null) st.setNameEn(dto.getNameEn());
        if (dto.getNameFr() != null) st.setNameFr(dto.getNameFr());
        if (dto.getDefaultStart() != null) st.setDefaultStart(LocalTime.parse(dto.getDefaultStart(), TIME_FMT));
        if (dto.getDurationHours() != null) st.setDurationHours(dto.getDurationHours());
        if (dto.getColor() != null) st.setColor(dto.getColor());
        if (dto.getActive() != null) st.setActive(dto.getActive());
        return toDto(shiftTypeRepository.save(st));
    }

    @Transactional
    public void delete(UUID id) {
        shiftTypeRepository.deleteById(id);
    }

    private ShiftTypeDto toDto(ShiftType st) {
        return ShiftTypeDto.builder()
            .id(st.getId())
            .nameEn(st.getNameEn())
            .nameFr(st.getNameFr())
            .defaultStart(st.getDefaultStart() != null ? st.getDefaultStart().format(TIME_FMT) : null)
            .durationHours(st.getDurationHours())
            .color(st.getColor())
            .active(st.getActive())
            .build();
    }
}
