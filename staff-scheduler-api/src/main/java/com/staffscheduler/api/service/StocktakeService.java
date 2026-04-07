package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.StockMovementDto;
import com.staffscheduler.api.dto.StocktakeDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.StocktakeCount;
import com.staffscheduler.api.model.StocktakeSession;
import com.staffscheduler.api.model.StockItem;
import com.staffscheduler.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StocktakeService {

    private final StocktakeSessionRepository sessionRepo;
    private final StocktakeCountRepository countRepo;
    private final StockItemRepository itemRepo;
    private final StockMovementRepository movementRepo;
    private final StockLocationRepository locationRepo;
    private final StockMovementService movementService;

    // ── Queries ──

    public List<StocktakeDto> findAll() {
        return sessionRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public StocktakeDto findById(UUID id) {
        StocktakeSession session = getSession(id);
        StocktakeDto dto = toDto(session);
        dto.setCounts(countRepo.findBySessionId(id).stream()
                .map(this::toCountDto).collect(Collectors.toList()));
        return dto;
    }

    // ── Mutations ──

    @Transactional
    public StocktakeDto startSession(StocktakeDto dto, UUID createdBy) {
        StocktakeSession session = StocktakeSession.builder()
                .locationId(dto.getLocationId())
                .stocktakeDate(dto.getStocktakeDate())
                .status("open")
                .createdBy(createdBy)
                .build();
        session = sessionRepo.save(session);

        // Pre-populate counts with system quantities for items at the location
        List<StockItem> items = dto.getLocationId() != null
                ? itemRepo.findFiltered(null, null, dto.getLocationId())
                : itemRepo.findByIsActiveTrueOrderByNameEnAsc();

        for (StockItem item : items) {
            BigDecimal sysQty = dto.getLocationId() != null
                    ? movementRepo.sumQtyByItemIdAndLocationId(item.getId(), dto.getLocationId())
                    : movementRepo.sumQtyByItemId(item.getId());

            StocktakeCount count = StocktakeCount.builder()
                    .sessionId(session.getId())
                    .itemId(item.getId())
                    .systemQty(sysQty)
                    .countedQty(BigDecimal.ZERO)
                    .adjustmentQty(BigDecimal.ZERO)
                    .build();
            countRepo.save(count);
        }

        return findById(session.getId());
    }

    @Transactional
    public StocktakeDto submitCount(UUID sessionId, UUID itemId, BigDecimal countedQty) {
        StocktakeSession session = getSession(sessionId);
        if (!"open".equals(session.getStatus())) {
            throw new IllegalStateException("Session is not open");
        }

        StocktakeCount count = countRepo.findBySessionIdAndItemId(sessionId, itemId)
                .orElseGet(() -> {
                    BigDecimal sysQty = session.getLocationId() != null
                            ? movementRepo.sumQtyByItemIdAndLocationId(itemId, session.getLocationId())
                            : movementRepo.sumQtyByItemId(itemId);
                    return StocktakeCount.builder()
                            .sessionId(sessionId)
                            .itemId(itemId)
                            .systemQty(sysQty)
                            .build();
                });

        count.setCountedQty(countedQty);
        count.setAdjustmentQty(countedQty.subtract(count.getSystemQty()));
        countRepo.save(count);

        return findById(sessionId);
    }

    @Transactional
    public StocktakeDto finalise(UUID sessionId, UUID performedBy) {
        StocktakeSession session = getSession(sessionId);
        if (!"open".equals(session.getStatus())) {
            throw new IllegalStateException("Session is not open");
        }

        List<StocktakeCount> counts = countRepo.findBySessionId(sessionId);
        for (StocktakeCount count : counts) {
            if (count.getAdjustmentQty() != null && count.getAdjustmentQty().compareTo(BigDecimal.ZERO) != 0) {
                StockMovementDto moveDto = StockMovementDto.builder()
                        .itemId(count.getItemId())
                        .locationId(session.getLocationId())
                        .movementType("adjustment")
                        .qtyChange(count.getAdjustmentQty())
                        .referenceType("stocktake")
                        .referenceId(sessionId)
                        .note("Stocktake adjustment")
                        .build();
                movementService.createMovement(moveDto, performedBy);
            }
        }

        session.setStatus("finalised");
        session.setFinalisedAt(LocalDateTime.now());
        sessionRepo.save(session);

        return findById(sessionId);
    }

    // ── Helpers ──

    private StocktakeSession getSession(UUID id) {
        return sessionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StocktakeSession", id.toString()));
    }

    private StocktakeDto toDto(StocktakeSession s) {
        String locationName = null;
        if (s.getLocationId() != null) {
            locationName = locationRepo.findById(s.getLocationId())
                    .map(l -> l.getName()).orElse(null);
        }

        return StocktakeDto.builder()
                .id(s.getId())
                .locationId(s.getLocationId())
                .locationName(locationName)
                .stocktakeDate(s.getStocktakeDate())
                .status(s.getStatus())
                .createdBy(s.getCreatedBy())
                .createdAt(s.getCreatedAt())
                .finalisedAt(s.getFinalisedAt())
                .build();
    }

    private StocktakeDto.CountDto toCountDto(StocktakeCount c) {
        String itemName = null;
        String itemSku = null;
        if (c.getItemId() != null) {
            var itemOpt = itemRepo.findById(c.getItemId());
            if (itemOpt.isPresent()) {
                itemName = itemOpt.get().getNameEn();
                itemSku = itemOpt.get().getSku();
            }
        }

        return StocktakeDto.CountDto.builder()
                .id(c.getId())
                .itemId(c.getItemId())
                .itemName(itemName)
                .itemSku(itemSku)
                .systemQty(c.getSystemQty())
                .countedQty(c.getCountedQty())
                .adjustmentQty(c.getAdjustmentQty())
                .build();
    }
}
