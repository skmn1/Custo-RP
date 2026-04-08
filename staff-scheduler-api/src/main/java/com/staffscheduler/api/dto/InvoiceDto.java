package com.staffscheduler.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceDto {

    private UUID id;
    private String invoiceNumber;
    private String counterpartyName;
    private String counterpartyEmail;
    private String counterpartyAddress;
    private String supplierSiret;
    private String supplierVatNumber;
    private String buyerVatNumber;
    private LocalDate deliveryDate;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String status;
    private String currency;
    private BigDecimal taxRate;
    private String paymentTerms;
    private BigDecimal earlyPaymentDiscount;
    private BigDecimal latePaymentRate;
    private String notes;
    private UUID poId;
    private String poNumber;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal amountOutstanding;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<InvoiceLineDto> lines;
    private List<InvoicePaymentDto> payments;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InvoiceLineDto {
        private UUID id;
        private UUID stockItemId;
        private String stockItemName;
        private String description;
        private BigDecimal qty;
        private BigDecimal unitPrice;
        private BigDecimal discountPct;
        private BigDecimal taxRate;
        private BigDecimal lineTotal;
        private BigDecimal taxAmount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InvoicePaymentDto {
        private UUID id;
        private LocalDate paymentDate;
        private BigDecimal amount;
        private String method;
        private String reference;
        private String note;
        private UUID recordedBy;
        private LocalDateTime recordedAt;
    }
}
