package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.PurchaseOrderDto;
import com.staffscheduler.api.dto.StockMovementDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.PurchaseOrder;
import com.staffscheduler.api.model.PurchaseOrderLine;
import com.staffscheduler.api.model.StockBatch;
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
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepo;
    private final PurchaseOrderLineRepository lineRepo;
    private final StockItemRepository itemRepo;
    private final SupplierRepository supplierRepo;
    private final StockMovementService movementService;
    private final StockBatchRepository batchRepo;

    // ── Queries ──

    public List<PurchaseOrderDto> findAll() {
        return poRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PurchaseOrderDto> findByStatus(String status) {
        return poRepo.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public PurchaseOrderDto findById(UUID id) {
        PurchaseOrder po = poRepo.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id.toString()));
        return toDto(po);
    }

    // ── Mutations ──

    @Transactional
    public PurchaseOrderDto create(PurchaseOrderDto dto, UUID createdBy) {
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePoNumber());
        po.setSupplierId(dto.getSupplierId());
        po.setStatus("draft");
        po.setExpectedDelivery(dto.getExpectedDelivery());
        po.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "CAD");
        po.setNotes(dto.getNotes());
        po.setCreatedBy(createdBy);
        po.setLines(new ArrayList<>());

        if (dto.getLines() != null) {
            for (PurchaseOrderDto.LineDto lineDto : dto.getLines()) {
                PurchaseOrderLine line = new PurchaseOrderLine();
                line.setPurchaseOrder(po);
                line.setItemId(lineDto.getItemId());
                line.setDescription(lineDto.getDescription());
                line.setQtyOrdered(lineDto.getQtyOrdered());
                line.setUnitCost(lineDto.getUnitCost());
                line.setLineTotal(lineDto.getQtyOrdered().multiply(lineDto.getUnitCost()));
                po.getLines().add(line);
            }
        }
        recalcTotal(po);
        return toDto(poRepo.save(po));
    }

    @Transactional
    public PurchaseOrderDto update(UUID id, PurchaseOrderDto dto) {
        PurchaseOrder po = poRepo.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id.toString()));

        if (!"draft".equals(po.getStatus())) {
            throw new IllegalStateException("Only draft POs can be edited");
        }

        if (dto.getSupplierId() != null) po.setSupplierId(dto.getSupplierId());
        if (dto.getExpectedDelivery() != null) po.setExpectedDelivery(dto.getExpectedDelivery());
        if (dto.getCurrency() != null) po.setCurrency(dto.getCurrency());
        if (dto.getNotes() != null) po.setNotes(dto.getNotes());

        if (dto.getLines() != null) {
            po.getLines().clear();
            for (PurchaseOrderDto.LineDto lineDto : dto.getLines()) {
                PurchaseOrderLine line = new PurchaseOrderLine();
                line.setPurchaseOrder(po);
                line.setItemId(lineDto.getItemId());
                line.setDescription(lineDto.getDescription());
                line.setQtyOrdered(lineDto.getQtyOrdered());
                line.setUnitCost(lineDto.getUnitCost());
                line.setLineTotal(lineDto.getQtyOrdered().multiply(lineDto.getUnitCost()));
                po.getLines().add(line);
            }
        }
        recalcTotal(po);
        return toDto(poRepo.save(po));
    }

    @Transactional
    public PurchaseOrderDto submit(UUID id) {
        PurchaseOrder po = getEntity(id);
        if (!"draft".equals(po.getStatus())) {
            throw new IllegalStateException("Only draft POs can be submitted");
        }
        po.setStatus("submitted");
        return toDto(poRepo.save(po));
    }

    @Transactional
    public PurchaseOrderDto receiveLine(UUID poId, UUID lineId, BigDecimal qtyReceived,
                                         String batchNumber, String lotNumber, UUID performedBy) {
        PurchaseOrder po = poRepo.findByIdWithLines(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", poId.toString()));

        PurchaseOrderLine line = po.getLines().stream()
                .filter(l -> l.getId().equals(lineId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrderLine", lineId.toString()));

        BigDecimal newReceived = line.getQtyReceived().add(qtyReceived);
        line.setQtyReceived(newReceived);

        // Create stock movement for receive
        StockMovementDto moveDto = StockMovementDto.builder()
                .itemId(line.getItemId())
                .movementType("received")
                .qtyChange(qtyReceived)
                .unitCost(line.getUnitCost())
                .referenceType("purchase_order")
                .referenceId(poId)
                .note("PO " + po.getPoNumber() + " receive")
                .build();
        movementService.createMovement(moveDto, performedBy);

        // Create batch if item is batch-tracked
        StockItem item = itemRepo.findById(line.getItemId()).orElse(null);
        if (item != null && Boolean.TRUE.equals(item.getIsBatchTracked()) && batchNumber != null) {
            StockBatch batch = StockBatch.builder()
                    .itemId(line.getItemId())
                    .locationId(item.getLocationId())
                    .batchNumber(batchNumber)
                    .lotNumber(lotNumber)
                    .qtyReceived(qtyReceived)
                    .qtyRemaining(qtyReceived)
                    .build();
            batchRepo.save(batch);
        }

        // Update PO status
        boolean allReceived = po.getLines().stream()
                .allMatch(l -> l.getQtyReceived().compareTo(l.getQtyOrdered()) >= 0);
        boolean anyReceived = po.getLines().stream()
                .anyMatch(l -> l.getQtyReceived().compareTo(BigDecimal.ZERO) > 0);

        if (allReceived) {
            po.setStatus("received");
        } else if (anyReceived) {
            po.setStatus("partial");
        }

        return toDto(poRepo.save(po));
    }

    @Transactional
    public void cancel(UUID id) {
        PurchaseOrder po = getEntity(id);
        if ("received".equals(po.getStatus())) {
            throw new IllegalStateException("Cannot cancel a fully received PO");
        }
        po.setStatus("cancelled");
        poRepo.save(po);
    }

    // ── Helpers ──

    private PurchaseOrder getEntity(UUID id) {
        return poRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id.toString()));
    }

    private void recalcTotal(PurchaseOrder po) {
        BigDecimal total = po.getLines().stream()
                .map(PurchaseOrderLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        po.setTotalAmount(total);
    }

    private String generatePoNumber() {
        int seq = poRepo.findMaxPoSequence() + 1;
        return String.format("PO-%05d", seq);
    }

    private PurchaseOrderDto toDto(PurchaseOrder po) {
        String supplierName = null;
        if (po.getSupplierId() != null) {
            supplierName = supplierRepo.findById(po.getSupplierId())
                    .map(s -> s.getName()).orElse(null);
        }

        List<PurchaseOrderDto.LineDto> lineDtos = new ArrayList<>();
        if (po.getLines() != null) {
            for (PurchaseOrderLine line : po.getLines()) {
                String itemName = null;
                String itemSku = null;
                if (line.getItemId() != null) {
                    var itemOpt = itemRepo.findById(line.getItemId());
                    if (itemOpt.isPresent()) {
                        itemName = itemOpt.get().getNameEn();
                        itemSku = itemOpt.get().getSku();
                    }
                }
                lineDtos.add(PurchaseOrderDto.LineDto.builder()
                        .id(line.getId())
                        .itemId(line.getItemId())
                        .itemName(itemName)
                        .itemSku(itemSku)
                        .description(line.getDescription())
                        .qtyOrdered(line.getQtyOrdered())
                        .unitCost(line.getUnitCost())
                        .qtyReceived(line.getQtyReceived())
                        .lineTotal(line.getLineTotal())
                        .build());
            }
        }

        return PurchaseOrderDto.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplierId())
                .supplierName(supplierName)
                .status(po.getStatus())
                .expectedDelivery(po.getExpectedDelivery())
                .currency(po.getCurrency())
                .notes(po.getNotes())
                .totalAmount(po.getTotalAmount())
                .createdBy(po.getCreatedBy())
                .createdAt(po.getCreatedAt())
                .lines(lineDtos)
                .build();
    }
}
