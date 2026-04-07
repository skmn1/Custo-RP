package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.StockMovementDto;
import com.staffscheduler.api.model.StockItem;
import com.staffscheduler.api.model.StockMovement;
import com.staffscheduler.api.repository.StockItemRepository;
import com.staffscheduler.api.repository.StockLocationRepository;
import com.staffscheduler.api.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository movementRepo;
    private final StockItemRepository itemRepo;
    private final StockLocationRepository locationRepo;

    // ── Queries ──

    public List<StockMovementDto> findByItem(UUID itemId) {
        return movementRepo.findByItemIdOrderByPerformedAtDesc(itemId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<StockMovementDto> findFiltered(UUID itemId, String movementType,
                                                LocalDateTime startDate, LocalDateTime endDate) {
        return movementRepo.findFiltered(itemId, movementType, startDate, endDate)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public BigDecimal getCurrentQty(UUID itemId) {
        return movementRepo.sumQtyByItemId(itemId);
    }

    public BigDecimal getQtyAtLocation(UUID itemId, UUID locationId) {
        return movementRepo.sumQtyByItemIdAndLocationId(itemId, locationId);
    }

    // ── Mutations ──

    @Transactional
    public StockMovementDto createMovement(StockMovementDto dto, UUID performedBy) {
        StockMovement movement = StockMovement.builder()
                .itemId(dto.getItemId())
                .locationId(dto.getLocationId())
                .batchId(dto.getBatchId())
                .movementType(dto.getMovementType())
                .qtyChange(dto.getQtyChange())
                .unitCost(dto.getUnitCost())
                .referenceType(dto.getReferenceType())
                .referenceId(dto.getReferenceId())
                .note(dto.getNote())
                .performedBy(performedBy)
                .performedAt(LocalDateTime.now())
                .build();

        StockMovement saved = movementRepo.save(movement);

        // Update weighted average cost on receive
        if ("received".equals(dto.getMovementType()) && dto.getQtyChange().compareTo(BigDecimal.ZERO) > 0
                && dto.getUnitCost() != null) {
            updateAvgCost(dto.getItemId(), dto.getQtyChange(), dto.getUnitCost());
        }

        return toDto(saved);
    }

    @Transactional
    public void createTransfer(UUID itemId, UUID fromLocationId, UUID toLocationId,
                                BigDecimal qty, String note, UUID performedBy) {
        UUID refId = UUID.randomUUID();

        // Outbound from source
        StockMovement outbound = StockMovement.builder()
                .itemId(itemId)
                .locationId(fromLocationId)
                .movementType("transfer_out")
                .qtyChange(qty.negate())
                .referenceType("transfer")
                .referenceId(refId)
                .note(note)
                .performedBy(performedBy)
                .performedAt(LocalDateTime.now())
                .build();
        movementRepo.save(outbound);

        // Inbound to destination
        StockMovement inbound = StockMovement.builder()
                .itemId(itemId)
                .locationId(toLocationId)
                .movementType("transfer_in")
                .qtyChange(qty)
                .referenceType("transfer")
                .referenceId(refId)
                .note(note)
                .performedBy(performedBy)
                .performedAt(LocalDateTime.now())
                .build();
        movementRepo.save(inbound);
    }

    // ── Helpers ──

    private void updateAvgCost(UUID itemId, BigDecimal newQty, BigDecimal newCost) {
        itemRepo.findById(itemId).ifPresent(item -> {
            BigDecimal currentQty = movementRepo.sumQtyByItemId(itemId).subtract(newQty);
            BigDecimal currentValue = currentQty.multiply(item.getAvgCost());
            BigDecimal newValue = newQty.multiply(newCost);
            BigDecimal totalQty = currentQty.add(newQty);
            if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal avgCost = currentValue.add(newValue)
                        .divide(totalQty, 4, RoundingMode.HALF_UP);
                item.setAvgCost(avgCost);
                itemRepo.save(item);
            }
        });
    }

    private StockMovementDto toDto(StockMovement m) {
        String itemName = null;
        String itemSku = null;
        if (m.getItemId() != null) {
            StockItem item = itemRepo.findById(m.getItemId()).orElse(null);
            if (item != null) {
                itemName = item.getNameEn();
                itemSku = item.getSku();
            }
        }

        String locationName = null;
        if (m.getLocationId() != null) {
            locationName = locationRepo.findById(m.getLocationId())
                    .map(l -> l.getName()).orElse(null);
        }

        return StockMovementDto.builder()
                .id(m.getId())
                .itemId(m.getItemId())
                .itemName(itemName)
                .itemSku(itemSku)
                .locationId(m.getLocationId())
                .locationName(locationName)
                .batchId(m.getBatchId())
                .movementType(m.getMovementType())
                .qtyChange(m.getQtyChange())
                .unitCost(m.getUnitCost())
                .referenceType(m.getReferenceType())
                .referenceId(m.getReferenceId())
                .note(m.getNote())
                .performedBy(m.getPerformedBy())
                .performedAt(m.getPerformedAt())
                .build();
    }
}
