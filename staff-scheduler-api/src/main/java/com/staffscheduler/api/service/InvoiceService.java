package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.InvoiceDto;
import com.staffscheduler.api.dto.InvoiceDto.InvoiceLineDto;
import com.staffscheduler.api.dto.InvoiceDto.InvoicePaymentDto;
import com.staffscheduler.api.dto.InvoiceKpiDto;
import com.staffscheduler.api.dto.OcrImportResultDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.*;
import com.staffscheduler.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final InvoiceLineRepository lineRepo;
    private final InvoicePaymentRepository paymentRepo;
    private final StockMovementRepository movementRepo;
    private final PurchaseOrderRepository poRepo;
    private final MistralOcrService mistralOcrService;
    private final OcrFieldMapper ocrFieldMapper;

    private static final String PREFIX = "FAC-";

    public List<InvoiceDto> findAll(String status, String supplier, LocalDate dateFrom, LocalDate dateTo) {
        List<Invoice> invoices = invoiceRepo.findFiltered(status, supplier, dateFrom, dateTo);
        return invoices.stream().map(this::toDto).collect(Collectors.toList());
    }

    public InvoiceDto findById(UUID id) {
        Invoice inv = getEntity(id);
        return toDetailDto(inv);
    }

    @Transactional
    public InvoiceDto create(InvoiceDto dto, UUID userId) {
        validateSiret(dto.getSupplierSiret());
        validateVatNumber(dto.getSupplierVatNumber());

        Invoice inv = new Invoice();
        inv.setInvoiceNumber(generateInvoiceNumber());
        applyDto(inv, dto);
        inv.setStatus("received");
        inv.setCreatedBy(userId);
        inv = invoiceRepo.save(inv);

        if (dto.getLines() != null) {
            saveLines(inv, dto.getLines());
        }

        recalcTotals(inv);
        inv = invoiceRepo.save(inv);
        return toDetailDto(inv);
    }

    @Transactional
    public InvoiceDto update(UUID id, InvoiceDto dto) {
        Invoice inv = getEntity(id);
        if (!"received".equals(inv.getStatus())) {
            throw new IllegalStateException("Cannot edit invoice in status: " + inv.getStatus());
        }

        validateSiret(dto.getSupplierSiret());
        validateVatNumber(dto.getSupplierVatNumber());

        applyDto(inv, dto);

        // Replace lines
        inv.getLines().clear();
        invoiceRepo.saveAndFlush(inv);
        if (dto.getLines() != null) {
            saveLines(inv, dto.getLines());
        }

        recalcTotals(inv);
        inv = invoiceRepo.save(inv);
        return toDetailDto(inv);
    }

    @Transactional
    public InvoiceDto approve(UUID id, UUID userId) {
        Invoice inv = getEntity(id);
        if (!"received".equals(inv.getStatus())) {
            throw new IllegalStateException("Invoice must be in 'received' status to approve");
        }

        inv.setStatus("approved");
        invoiceRepo.save(inv);

        // Post stock movements for each stock-item line
        for (InvoiceLine line : inv.getLines()) {
            if (line.getStockItemId() != null) {
                StockMovement movement = StockMovement.builder()
                        .itemId(line.getStockItemId())
                        .movementType("received")
                        .qtyChange(line.getQty())
                        .unitCost(line.getUnitPrice())
                        .referenceType("invoice")
                        .referenceId(inv.getId())
                        .note("AP Invoice " + inv.getInvoiceNumber() + " approved")
                        .performedBy(userId)
                        .performedAt(LocalDateTime.now())
                        .build();
                movementRepo.save(movement);
            }
        }

        return toDetailDto(inv);
    }

    @Transactional
    public InvoicePaymentDto recordPayment(UUID invoiceId, InvoicePaymentDto dto, UUID userId) {
        Invoice inv = getEntity(invoiceId);
        if ("cancelled".equals(inv.getStatus())) {
            throw new IllegalStateException("Cannot record payment on cancelled invoice");
        }
        if ("received".equals(inv.getStatus())) {
            throw new IllegalStateException("Invoice must be approved before recording payments");
        }

        InvoicePayment payment = new InvoicePayment();
        payment.setInvoice(inv);
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setAmount(dto.getAmount());
        payment.setMethod(dto.getMethod());
        payment.setReference(dto.getReference());
        payment.setNote(dto.getNote());
        payment.setRecordedBy(userId);
        payment = paymentRepo.save(payment);

        // Recalculate paid total
        BigDecimal totalPaid = inv.getPayments().stream()
                .map(InvoicePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(dto.getAmount());

        inv.setAmountPaid(totalPaid);
        inv.setAmountOutstanding(inv.getTotalAmount().subtract(totalPaid));

        if (totalPaid.compareTo(inv.getTotalAmount()) >= 0) {
            inv.setStatus("paid");
        }

        invoiceRepo.save(inv);

        return toPaymentDto(payment);
    }

    @Transactional
    public InvoiceDto duplicate(UUID id, UUID userId) {
        Invoice source = getEntity(id);

        Invoice copy = new Invoice();
        copy.setInvoiceNumber(generateInvoiceNumber());
        copy.setCounterpartyName(source.getCounterpartyName());
        copy.setCounterpartyEmail(source.getCounterpartyEmail());
        copy.setCounterpartyAddress(source.getCounterpartyAddress());
        copy.setSupplierSiret(source.getSupplierSiret());
        copy.setSupplierVatNumber(source.getSupplierVatNumber());
        copy.setBuyerVatNumber(source.getBuyerVatNumber());
        copy.setDeliveryDate(source.getDeliveryDate());
        copy.setIssueDate(LocalDate.now());
        copy.setDueDate(source.getDueDate());
        copy.setStatus("received");
        copy.setCurrency(source.getCurrency());
        copy.setTaxRate(source.getTaxRate());
        copy.setPaymentTerms(source.getPaymentTerms());
        copy.setEarlyPaymentDiscount(source.getEarlyPaymentDiscount());
        copy.setLatePaymentRate(source.getLatePaymentRate());
        copy.setNotes(source.getNotes());
        copy.setPoId(source.getPoId());
        copy.setCreatedBy(userId);
        copy = invoiceRepo.save(copy);

        // Copy lines
        for (InvoiceLine srcLine : source.getLines()) {
            InvoiceLine newLine = new InvoiceLine();
            newLine.setInvoice(copy);
            newLine.setStockItemId(srcLine.getStockItemId());
            newLine.setDescription(srcLine.getDescription());
            newLine.setQty(srcLine.getQty());
            newLine.setUnitPrice(srcLine.getUnitPrice());
            newLine.setDiscountPct(srcLine.getDiscountPct());
            newLine.setTaxRate(srcLine.getTaxRate());
            newLine.setLineTotal(srcLine.getLineTotal());
            newLine.setTaxAmount(srcLine.getTaxAmount());
            lineRepo.save(newLine);
        }

        recalcTotals(copy);
        copy = invoiceRepo.save(copy);
        return toDetailDto(copy);
    }

    public List<InvoiceDto> findAllForExport(String status, String supplier, LocalDate dateFrom, LocalDate dateTo) {
        return findAll(status, supplier, dateFrom, dateTo);
    }

    public OcrImportResultDto importFromPdf(byte[] pdfBytes) throws Exception {
        String ocrJson = mistralOcrService.extractFromPdf(pdfBytes);
        return ocrFieldMapper.mapToResult(ocrJson, ocrJson, "mistral");
    }

    public InvoiceKpiDto getKpis() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        LocalDate twelveMonthsAgo = today.minusMonths(12).withDayOfMonth(1);

        InvoiceKpiDto kpi = new InvoiceKpiDto();
        kpi.setApUnpaidTotal(invoiceRepo.sumUnpaidTotal());
        kpi.setApPaidMtd(invoiceRepo.sumPaidMtd(startOfMonth, endOfMonth));
        kpi.setApPendingApproval(invoiceRepo.countPendingApproval());

        // Monthly spend
        List<Object[]> monthly = invoiceRepo.monthlySpend(twelveMonthsAgo);
        kpi.setMonthlySpend(monthly.stream()
                .map(row -> InvoiceKpiDto.MonthlySpend.builder()
                        .month((String) row[0])
                        .amount((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList()));

        // Status distribution
        List<Object[]> statusData = invoiceRepo.countByStatus();
        kpi.setStatusDistribution(statusData.stream()
                .map(row -> InvoiceKpiDto.StatusCount.builder()
                        .status((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList()));

        return kpi;
    }

    // ── Helpers ──

    private Invoice getEntity(UUID id) {
        return invoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id.toString()));
    }

    private String generateInvoiceNumber() {
        int seq = invoiceRepo.findMaxInvoiceSequence() + 1;
        return PREFIX + String.format("%06d", seq);
    }

    private void validateSiret(String siret) {
        if (siret != null && !siret.isEmpty()) {
            if (!siret.matches("\\d{14}")) {
                throw new IllegalArgumentException("SIRET must be exactly 14 digits");
            }
        }
    }

    private void validateVatNumber(String vat) {
        if (vat != null && !vat.isEmpty()) {
            if (!vat.matches("FR\\d{2}\\d{9}")) {
                throw new IllegalArgumentException("French VAT number must follow format: FR + 2 digits + 9-digit SIREN");
            }
        }
    }

    private void applyDto(Invoice inv, InvoiceDto dto) {
        inv.setCounterpartyName(dto.getCounterpartyName());
        inv.setCounterpartyEmail(dto.getCounterpartyEmail());
        inv.setCounterpartyAddress(dto.getCounterpartyAddress());
        inv.setSupplierSiret(dto.getSupplierSiret());
        inv.setSupplierVatNumber(dto.getSupplierVatNumber());
        inv.setBuyerVatNumber(dto.getBuyerVatNumber());
        inv.setDeliveryDate(dto.getDeliveryDate());
        inv.setIssueDate(dto.getIssueDate());
        inv.setDueDate(dto.getDueDate());
        inv.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EUR");
        inv.setTaxRate(dto.getTaxRate());
        inv.setPaymentTerms(dto.getPaymentTerms());
        inv.setEarlyPaymentDiscount(dto.getEarlyPaymentDiscount() != null ? dto.getEarlyPaymentDiscount() : BigDecimal.ZERO);
        inv.setLatePaymentRate(dto.getLatePaymentRate() != null ? dto.getLatePaymentRate() : new BigDecimal("12.37"));
        inv.setNotes(dto.getNotes());
        inv.setPoId(dto.getPoId());
    }

    private void saveLines(Invoice inv, List<InvoiceLineDto> lineDtos) {
        for (InvoiceLineDto ld : lineDtos) {
            InvoiceLine line = new InvoiceLine();
            line.setInvoice(inv);
            line.setStockItemId(ld.getStockItemId());
            line.setDescription(ld.getDescription());
            line.setQty(ld.getQty());
            line.setUnitPrice(ld.getUnitPrice());
            line.setDiscountPct(ld.getDiscountPct() != null ? ld.getDiscountPct() : BigDecimal.ZERO);
            line.setTaxRate(ld.getTaxRate() != null ? ld.getTaxRate() : inv.getTaxRate());

            // Compute line total: qty * unitPrice * (1 - discount/100)
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    line.getDiscountPct().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            BigDecimal lineTotal = line.getQty()
                    .multiply(line.getUnitPrice())
                    .multiply(discountMultiplier)
                    .setScale(2, RoundingMode.HALF_UP);
            line.setLineTotal(lineTotal);

            // Compute tax amount
            BigDecimal taxAmt = lineTotal.multiply(line.getTaxRate())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            line.setTaxAmount(taxAmt);

            lineRepo.save(line);
            inv.getLines().add(line);
        }
    }

    private void recalcTotals(Invoice inv) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        for (InvoiceLine line : inv.getLines()) {
            subtotal = subtotal.add(line.getLineTotal());
            totalTax = totalTax.add(line.getTaxAmount());
        }
        inv.setSubtotal(subtotal);
        inv.setTaxAmount(totalTax);
        inv.setDiscountAmount(inv.getDiscountAmount() != null ? inv.getDiscountAmount() : BigDecimal.ZERO);
        inv.setTotalAmount(subtotal.add(totalTax).subtract(inv.getDiscountAmount()));
        inv.setAmountOutstanding(inv.getTotalAmount().subtract(inv.getAmountPaid()));
    }

    private InvoiceDto toDto(Invoice inv) {
        return InvoiceDto.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .counterpartyName(inv.getCounterpartyName())
                .counterpartyEmail(inv.getCounterpartyEmail())
                .counterpartyAddress(inv.getCounterpartyAddress())
                .supplierSiret(inv.getSupplierSiret())
                .supplierVatNumber(inv.getSupplierVatNumber())
                .buyerVatNumber(inv.getBuyerVatNumber())
                .deliveryDate(inv.getDeliveryDate())
                .issueDate(inv.getIssueDate())
                .dueDate(inv.getDueDate())
                .status(inv.getStatus())
                .currency(inv.getCurrency())
                .taxRate(inv.getTaxRate())
                .paymentTerms(inv.getPaymentTerms())
                .earlyPaymentDiscount(inv.getEarlyPaymentDiscount())
                .latePaymentRate(inv.getLatePaymentRate())
                .notes(inv.getNotes())
                .poId(inv.getPoId())
                .subtotal(inv.getSubtotal())
                .taxAmount(inv.getTaxAmount())
                .discountAmount(inv.getDiscountAmount())
                .totalAmount(inv.getTotalAmount())
                .amountPaid(inv.getAmountPaid())
                .amountOutstanding(inv.getAmountOutstanding())
                .createdBy(inv.getCreatedBy())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private InvoiceDto toDetailDto(Invoice inv) {
        InvoiceDto dto = toDto(inv);

        // PO number lookup
        if (inv.getPoId() != null) {
            poRepo.findById(inv.getPoId()).ifPresent(po -> dto.setPoNumber(po.getPoNumber()));
        }

        dto.setLines(inv.getLines().stream().map(this::toLineDto).collect(Collectors.toList()));
        dto.setPayments(inv.getPayments().stream().map(this::toPaymentDto).collect(Collectors.toList()));
        return dto;
    }

    private InvoiceLineDto toLineDto(InvoiceLine line) {
        return InvoiceLineDto.builder()
                .id(line.getId())
                .stockItemId(line.getStockItemId())
                .description(line.getDescription())
                .qty(line.getQty())
                .unitPrice(line.getUnitPrice())
                .discountPct(line.getDiscountPct())
                .taxRate(line.getTaxRate())
                .lineTotal(line.getLineTotal())
                .taxAmount(line.getTaxAmount())
                .build();
    }

    private InvoicePaymentDto toPaymentDto(InvoicePayment payment) {
        return InvoicePaymentDto.builder()
                .id(payment.getId())
                .paymentDate(payment.getPaymentDate())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .reference(payment.getReference())
                .note(payment.getNote())
                .recordedBy(payment.getRecordedBy())
                .recordedAt(payment.getRecordedAt())
                .build();
    }
}
