package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.StockLocationDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.StockLocation;
import com.staffscheduler.api.repository.StockLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockLocationService {

    private final StockLocationRepository repository;

    // ── Queries ──

    public List<StockLocationDto> findAll() {
        return repository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public StockLocationDto findById(UUID id) {
        return toDto(getEntity(id));
    }

    // ── Mutations ──

    @Transactional
    public StockLocationDto create(StockLocationDto dto) {
        StockLocation entity = new StockLocation();
        applyDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public StockLocationDto update(UUID id, StockLocationDto dto) {
        StockLocation entity = getEntity(id);
        applyDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        StockLocation entity = getEntity(id);
        entity.setIsActive(false);
        repository.save(entity);
    }

    // ── Helpers ──

    StockLocation getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockLocation", id.toString()));
    }

    private void applyDto(StockLocation entity, StockLocationDto dto) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) entity.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
    }

    private StockLocationDto toDto(StockLocation l) {
        return StockLocationDto.builder()
                .id(l.getId())
                .name(l.getName())
                .description(l.getDescription())
                .isActive(l.getIsActive())
                .sortOrder(l.getSortOrder())
                .build();
    }
}
