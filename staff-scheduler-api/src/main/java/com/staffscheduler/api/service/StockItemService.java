package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.StockItemDto;
import com.staffscheduler.api.exception.DuplicateResourceException;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.StockItem;
import com.staffscheduler.api.model.StockLocation;
import com.staffscheduler.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockItemService {

    private final StockItemRepository itemRepo;
    private final StockMovementRepository movementRepo;
    private final StockCategoryRepository categoryRepo;
    private final StockLocationRepository locationRepo;
    private final SupplierRepository supplierRepo;

    // ── Queries ──

    public List<StockItemDto> findAll(String search, UUID categoryId, UUID locationId) {
        List<StockItem> items = itemRepo.findFiltered(
                (search != null && search.isBlank()) ? null : search,
                categoryId, locationId);
        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    public StockItemDto findById(UUID id) {
        return toDto(getEntity(id));
    }

    public StockItemDto findBySku(String sku) {
        return itemRepo.findBySku(sku)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem", sku));
    }

    public StockItemDto findByBarcode(String barcode) {
        return itemRepo.findByBarcode(barcode)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem", barcode));
    }

    public List<StockItemDto> findLowStock() {
        return itemRepo.findByIsActiveTrueOrderByNameEnAsc().stream()
                .map(this::toDto)
                .filter(dto -> "warn".equals(dto.getStockStatus()) || "critical".equals(dto.getStockStatus()))
                .collect(Collectors.toList());
    }

    public List<StockItemDto> findReorderQueue() {
        return itemRepo.findByIsActiveTrueOrderByNameEnAsc().stream()
                .map(this::toDto)
                .filter(dto -> dto.getCurrentQty().compareTo(dto.getReorderPoint()) <= 0)
                .collect(Collectors.toList());
    }

    // ── Mutations ──

    @Transactional
    public StockItemDto create(StockItemDto dto) {
        // Auto-generate SKU if not provided
        if (dto.getSku() == null || dto.getSku().isBlank()) {
            dto.setSku(generateSku());
        }

        if (itemRepo.existsBySku(dto.getSku())) {
            throw new DuplicateResourceException("SKU already exists: " + dto.getSku());
        }

        StockItem entity = new StockItem();
        applyDto(entity, dto);
        return toDto(itemRepo.save(entity));
    }

    @Transactional
    public StockItemDto update(UUID id, StockItemDto dto) {
        StockItem entity = getEntity(id);

        if (dto.getSku() != null && !dto.getSku().equals(entity.getSku())) {
            if (itemRepo.existsBySkuAndIdNot(dto.getSku(), id)) {
                throw new DuplicateResourceException("SKU already exists: " + dto.getSku());
            }
        }

        applyDto(entity, dto);
        return toDto(itemRepo.save(entity));
    }

    @Transactional
    public void deactivate(UUID id) {
        StockItem entity = getEntity(id);
        entity.setIsActive(false);
        itemRepo.save(entity);
    }

    @Transactional
    public void reactivate(UUID id) {
        StockItem entity = getEntity(id);
        entity.setIsActive(true);
        itemRepo.save(entity);
    }

    // ── Helpers ──

    private StockItem getEntity(UUID id) {
        return itemRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem", id.toString()));
    }

    private void applyDto(StockItem entity, StockItemDto dto) {
        if (dto.getSku() != null) entity.setSku(dto.getSku());
        if (dto.getNameEn() != null) entity.setNameEn(dto.getNameEn());
        if (dto.getNameFr() != null) entity.setNameFr(dto.getNameFr());
        entity.setCategoryId(dto.getCategoryId());
        if (dto.getUom() != null) entity.setUom(dto.getUom());
        if (dto.getBarcode() != null) entity.setBarcode(dto.getBarcode());
        if (dto.getReorderPoint() != null) entity.setReorderPoint(dto.getReorderPoint());
        if (dto.getMinLevel() != null) entity.setMinLevel(dto.getMinLevel());
        if (dto.getAvgCost() != null) entity.setAvgCost(dto.getAvgCost());
        if (dto.getSalePrice() != null) entity.setSalePrice(dto.getSalePrice());
        entity.setPreferredSupplierId(dto.getPreferredSupplierId());
        entity.setLocationId(dto.getLocationId());
        if (dto.getImageUrl() != null) entity.setImageUrl(dto.getImageUrl());
        if (dto.getIsBatchTracked() != null) entity.setIsBatchTracked(dto.getIsBatchTracked());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
    }

    private StockItemDto toDto(StockItem item) {
        BigDecimal currentQty = movementRepo.sumQtyByItemId(item.getId());

        // Compute stock status
        String stockStatus = "normal";
        if (currentQty.compareTo(item.getMinLevel()) <= 0) {
            stockStatus = "critical";
        } else if (currentQty.compareTo(item.getReorderPoint()) <= 0) {
            stockStatus = "warn";
        }

        // Category name
        String categoryNameEn = null;
        String categoryNameFr = null;
        if (item.getCategoryId() != null) {
            var catOpt = categoryRepo.findById(item.getCategoryId());
            if (catOpt.isPresent()) {
                categoryNameEn = catOpt.get().getNameEn();
                categoryNameFr = catOpt.get().getNameFr();
            }
        }

        // Supplier name
        String supplierName = null;
        if (item.getPreferredSupplierId() != null) {
            supplierName = supplierRepo.findById(item.getPreferredSupplierId())
                    .map(s -> s.getName()).orElse(null);
        }

        // Location name
        String locationName = null;
        if (item.getLocationId() != null) {
            locationName = locationRepo.findById(item.getLocationId())
                    .map(l -> l.getName()).orElse(null);
        }

        // Location breakdown
        List<StockItemDto.LocationQty> locationBreakdown = new ArrayList<>();
        List<StockLocation> locations = locationRepo.findByIsActiveTrueOrderBySortOrderAsc();
        for (StockLocation loc : locations) {
            BigDecimal locQty = movementRepo.sumQtyByItemIdAndLocationId(item.getId(), loc.getId());
            if (locQty.compareTo(BigDecimal.ZERO) != 0) {
                locationBreakdown.add(StockItemDto.LocationQty.builder()
                        .locationId(loc.getId())
                        .locationName(loc.getName())
                        .qty(locQty)
                        .build());
            }
        }

        return StockItemDto.builder()
                .id(item.getId())
                .sku(item.getSku())
                .nameEn(item.getNameEn())
                .nameFr(item.getNameFr())
                .categoryId(item.getCategoryId())
                .categoryNameEn(categoryNameEn)
                .categoryNameFr(categoryNameFr)
                .uom(item.getUom())
                .barcode(item.getBarcode())
                .reorderPoint(item.getReorderPoint())
                .minLevel(item.getMinLevel())
                .avgCost(item.getAvgCost())
                .salePrice(item.getSalePrice())
                .preferredSupplierId(item.getPreferredSupplierId())
                .supplierName(supplierName)
                .locationId(item.getLocationId())
                .locationName(locationName)
                .imageUrl(item.getImageUrl())
                .isBatchTracked(item.getIsBatchTracked())
                .isActive(item.getIsActive())
                .currentQty(currentQty)
                .stockStatus(stockStatus)
                .locationBreakdown(locationBreakdown)
                .build();
    }

    private String generateSku() {
        long count = itemRepo.countActive() + 1;
        return String.format("SKU-%05d", count);
    }
}
