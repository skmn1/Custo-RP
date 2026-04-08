package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.InvoiceDto;
import com.staffscheduler.api.dto.InvoiceDto.InvoicePaymentDto;
import com.staffscheduler.api.dto.InvoiceKpiDto;
import com.staffscheduler.api.dto.OcrImportResultDto;
import com.staffscheduler.api.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Supplier invoice (AP) management")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "List AP invoices with optional filters")
    public ResponseEntity<List<InvoiceDto>> list(
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by supplier name") @RequestParam(required = false) String supplier,
            @Parameter(description = "Filter by start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @Parameter(description = "Filter by end date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(invoiceService.findAll(status, supplier, dateFrom, dateTo));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create AP invoice")
    public ResponseEntity<InvoiceDto> create(
            Authentication authentication,
            @RequestBody InvoiceDto dto) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(dto, userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get invoice detail with lines and payments")
    public ResponseEntity<InvoiceDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update invoice (received status only)")
    public ResponseEntity<InvoiceDto> update(
            @PathVariable UUID id,
            @RequestBody InvoiceDto dto) {
        return ResponseEntity.ok(invoiceService.update(id, dto));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Approve invoice — locks invoice and posts stock movements")
    public ResponseEntity<InvoiceDto> approve(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(invoiceService.approve(id, userId));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Record payment on an approved invoice")
    public ResponseEntity<InvoicePaymentDto> recordPayment(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody InvoicePaymentDto dto) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.recordPayment(id, dto, userId));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Duplicate invoice as new received invoice")
    public ResponseEntity<InvoiceDto> duplicate(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.duplicate(id, userId));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cancel invoice — sets status to cancelled")
    public ResponseEntity<InvoiceDto> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.cancelInvoice(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete invoice (received or cancelled status only)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Import invoice from PDF via OCR")
    public ResponseEntity<OcrImportResultDto> importPdf(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
        }
        try {
            OcrImportResultDto result = invoiceService.importFromPdf(file.getBytes());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Export invoices as CSV")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        List<InvoiceDto> invoices = invoiceService.findAllForExport(status, supplier, dateFrom, dateTo);
        byte[] csv = generateCsv(invoices);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "invoices-export.csv");
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }

    private byte[] generateCsv(List<InvoiceDto> invoices) {
        StringBuilder sb = new StringBuilder();
        sb.append("Numéro,Fournisseur,SIRET,N° TVA Fournisseur,Date émission,Date échéance,Statut,Total HT,TVA,Total TTC,Réglé,Reste à payer\n");
        for (InvoiceDto inv : invoices) {
            sb.append(escapeCsv(inv.getInvoiceNumber())).append(',');
            sb.append(escapeCsv(inv.getCounterpartyName())).append(',');
            sb.append(escapeCsv(inv.getSupplierSiret())).append(',');
            sb.append(escapeCsv(inv.getSupplierVatNumber())).append(',');
            sb.append(inv.getIssueDate()).append(',');
            sb.append(inv.getDueDate()).append(',');
            sb.append(inv.getStatus()).append(',');
            sb.append(inv.getSubtotal()).append(',');
            sb.append(inv.getTaxAmount()).append(',');
            sb.append(inv.getTotalAmount()).append(',');
            sb.append(inv.getAmountPaid()).append(',');
            sb.append(inv.getAmountOutstanding()).append('\n');
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
