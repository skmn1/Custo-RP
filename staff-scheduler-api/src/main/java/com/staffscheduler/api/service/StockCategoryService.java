package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.StockCategoryDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.StockCategory;
import com.staffscheduler.api.repository.StockCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockCategoryService {

    private final StockCategoryRepository repository;

    // ── Queries ──

    public List<StockCategoryDto> findAll() {
        List<StockCategory> all = repository.findByIsActiveTrueOrderBySortOrderAsc();
        return buildTree(all);
    }

    public List<StockCategoryDto> findFlat() {
        return repository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public StockCategoryDto findById(UUID id) {
        return toDto(getEntity(id));
    }

    // ── Mutations ──

    @Transactional
    public StockCategoryDto create(StockCategoryDto dto) {
        StockCategory entity = new StockCategory();
        applyDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public StockCategoryDto update(UUID id, StockCategoryDto dto) {
        StockCategory entity = getEntity(id);
        applyDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        StockCategory entity = getEntity(id);
        entity.setIsActive(false);
        repository.save(entity);
    }

    // ── Helpers ──

    private StockCategory getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockCategory", id.toString()));
    }

    private void applyDto(StockCategory entity, StockCategoryDto dto) {
        if (dto.getNameEn() != null) entity.setNameEn(dto.getNameEn());
        if (dto.getNameFr() != null) entity.setNameFr(dto.getNameFr());
        if (dto.getParentId() != null) entity.setParentId(dto.getParentId());
        if (dto.getSortOrder() != null) entity.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
    }

    private StockCategoryDto toDto(StockCategory c) {
        return StockCategoryDto.builder()
                .id(c.getId())
                .nameEn(c.getNameEn())
                .nameFr(c.getNameFr())
                .parentId(c.getParentId())
                .sortOrder(c.getSortOrder())
                .isActive(c.getIsActive())
                .build();
    }

    private List<StockCategoryDto> buildTree(List<StockCategory> all) {
        Map<UUID, StockCategoryDto> map = new LinkedHashMap<>();
        all.forEach(c -> map.put(c.getId(), toDto(c)));

        List<StockCategoryDto> roots = new ArrayList<>();
        map.values().forEach(dto -> {
            if (dto.getParentId() == null) {
                roots.add(dto);
            } else {
                StockCategoryDto parent = map.get(dto.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
                    parent.getChildren().add(dto);
                } else {
                    roots.add(dto);
                }
            }
        });
        return roots;
    }
}
