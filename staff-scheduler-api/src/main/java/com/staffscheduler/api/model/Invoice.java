package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices", indexes = {
    @Index(name = "idx_invoice_number", columnList = "invoice_number", unique = true),
    @Index(name = "idx_invoice_status", columnList = "status"),
    @Index(name = "idx_invoice_issue_date", columnList = "issue_date"),
    @Index(name = "idx_invoice_supplier", columnList = "counterparty_name"),
    @Index(name = "idx_invoice_po", columnList = "po_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @NotBlank
    @Size(max = 200)
    @Column(name = "counterparty_name", nullable = false, length = 200)
    private String counterpartyName;

    @Size(max = 254)
    @Column(name = "counterparty_email", length = 254)
    private String counterpartyEmail;

    @Column(name = "counterparty_address", columnDefinition = "TEXT")
    private String counterpartyAddress;

    @Size(min = 14, max = 14)
    @Column(name = "supplier_siret", length = 14)
    private String supplierSiret;

    @Size(max = 20)
    @Column(name = "supplier_vat_number", length = 20)
    private String supplierVatNumber;

    @Size(max = 20)
    @Column(name = "buyer_vat_number", length = 20)
    private String buyerVatNumber;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @NotNull
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @NotNull
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @NotBlank
    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "received";

    @Column(length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(name = "tax_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = new BigDecimal("20.00");

    @Column(name = "payment_terms", columnDefinition = "TEXT")
    private String paymentTerms;

    @Column(name = "early_payment_discount", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal earlyPaymentDiscount = BigDecimal.ZERO;

    @Column(name = "late_payment_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal latePaymentRate = new BigDecimal("12.37");

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "po_id")
    private UUID poId;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_outstanding", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amountOutstanding = BigDecimal.ZERO;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoiceLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoicePayment> payments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
