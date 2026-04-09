package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.AppSettingDto;
import com.staffscheduler.api.dto.InvoiceDto;
import com.staffscheduler.api.dto.InvoiceDto.InvoicePaymentDto;
import com.staffscheduler.api.service.InvoiceService;
import com.staffscheduler.api.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
@Tag(name = "Accounting", description = "Accounting dashboard, payments log, reports, and settings")
public class AccountingController {

    private final InvoiceService invoiceService;
    private final SettingsService settingsService;

    // ── Cash Flow Projection ────────────────────────────────────────────

    @GetMapping("/cash-flow-projection")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Weekly cash flow in/out projection for next N days")
    public ResponseEntity<List<Map<String, Object>>> cashFlowProjection(
            @RequestParam(defaultValue = "60") int days) {
        List<InvoiceDto> all = invoiceService.findAll(null, null, null, null);
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(days);

        List<Map<String, Object>> buckets = new ArrayList<>();
        LocalDate weekStart = today;
        BigDecimal runningNet = BigDecimal.ZERO;

        while (weekStart.isBefore(end)) {
            LocalDate weekEnd = weekStart.plusDays(6);
            if (weekEnd.isAfter(end)) weekEnd = end;

            final LocalDate ws = weekStart;
            final LocalDate we = weekEnd;

            BigDecimal inflow = all.stream()
                    .filter(i -> "AR".equals(i.getType()) && isOpen(i))
                    .filter(i -> i.getDueDate() != null && !i.getDueDate().isBefore(ws) && !i.getDueDate().isAfter(we))
                    .map(i -> i.getAmountOutstanding() != null ? i.getAmountOutstanding() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal outflow = all.stream()
                    .filter(i -> !"AR".equals(i.getType()) && isOpen(i))
                    .filter(i -> i.getDueDate() != null && !i.getDueDate().isBefore(ws) && !i.getDueDate().isAfter(we))
                    .map(i -> i.getAmountOutstanding() != null ? i.getAmountOutstanding() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            runningNet = runningNet.add(inflow).subtract(outflow);

            Map<String, Object> bucket = new LinkedHashMap<>();
            bucket.put("weekStart", ws.toString());
            bucket.put("weekEnd", we.toString());
            bucket.put("in", inflow);
            bucket.put("out", outflow);
            bucket.put("net", runningNet);
            buckets.add(bucket);

            weekStart = weekStart.plusDays(7);
        }

        return ResponseEntity.ok(buckets);
    }

    // ── Payments Log ────────────────────────────────────────────────────

    @GetMapping("/payments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Paginated cross-invoice payments log with filters")
    public ResponseEntity<List<Map<String, Object>>> payments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String method) {
        List<InvoiceDto> all = invoiceService.findAll(null, null, null, null);
        List<Map<String, Object>> result = new ArrayList<>();

        for (InvoiceDto inv : all) {
            if (inv.getPayments() == null) continue;
            for (InvoicePaymentDto p : inv.getPayments()) {
                if (dateFrom != null && p.getPaymentDate() != null && p.getPaymentDate().isBefore(dateFrom)) continue;
                if (dateTo != null && p.getPaymentDate() != null && p.getPaymentDate().isAfter(dateTo)) continue;
                if (type != null && !type.equalsIgnoreCase(inv.getType())) continue;
                if (method != null && !method.equalsIgnoreCase(p.getMethod())) continue;

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("date", p.getPaymentDate());
                row.put("invoiceNumber", inv.getInvoiceNumber());
                row.put("invoiceId", inv.getId());
                row.put("type", inv.getType());
                row.put("counterpartyName", inv.getCounterpartyName());
                row.put("amount", p.getAmount());
                row.put("method", p.getMethod());
                row.put("recordedBy", p.getRecordedBy());
                result.add(row);
            }
        }

        result.sort((a, b) -> {
            LocalDate da = (LocalDate) a.get("date");
            LocalDate db = (LocalDate) b.get("date");
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return db.compareTo(da);
        });

        return ResponseEntity.ok(result);
    }

    // ── Reports ─────────────────────────────────────────────────────────

    @GetMapping("/reports/revenue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Monthly AR revenue totals")
    public ResponseEntity<List<Map<String, Object>>> revenueReport() {
        return ResponseEntity.ok(monthlyTotals("AR"));
    }

    @GetMapping("/reports/expenses")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Monthly AP expense totals")
    public ResponseEntity<List<Map<String, Object>>> expenseReport() {
        return ResponseEntity.ok(monthlyTotals(null)); // AP = not AR
    }

    @GetMapping("/reports/tax-summary")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Tax collected vs paid by period")
    public ResponseEntity<List<Map<String, Object>>> taxSummary() {
        List<InvoiceDto> all = invoiceService.findAll(null, null, null, null);
        Map<String, BigDecimal> collected = new TreeMap<>();
        Map<String, BigDecimal> paid = new TreeMap<>();

        for (InvoiceDto inv : all) {
            String month = inv.getIssueDate() != null ? inv.getIssueDate().toString().substring(0, 7) : null;
            if (month == null) continue;
            BigDecimal tax = inv.getTaxAmount() != null ? inv.getTaxAmount() : BigDecimal.ZERO;
            if ("AR".equals(inv.getType())) {
                collected.merge(month, tax, BigDecimal::add);
            } else {
                paid.merge(month, tax, BigDecimal::add);
            }
        }

        Set<String> months = new TreeSet<>();
        months.addAll(collected.keySet());
        months.addAll(paid.keySet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (String m : months) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", m);
            row.put("collected", collected.getOrDefault(m, BigDecimal.ZERO));
            row.put("paid", paid.getOrDefault(m, BigDecimal.ZERO));
            row.put("net", collected.getOrDefault(m, BigDecimal.ZERO).subtract(paid.getOrDefault(m, BigDecimal.ZERO)));
            result.add(row);
        }
        return ResponseEntity.ok(result);
    }

    // ── Accounting Settings ─────────────────────────────────────────────

    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTING_AGENT')")
    @Operation(summary = "Get accounting-scoped settings")
    public ResponseEntity<List<AppSettingDto>> getSettings() {
        return ResponseEntity.ok(settingsService.getSettingsByCategory("accounting"));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update accounting settings (super_admin only)")
    public ResponseEntity<List<AppSettingDto>> updateSettings(
            @RequestBody List<AppSettingDto> settings,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(settingsService.updateCategory("accounting", settings, userId));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private boolean isOpen(InvoiceDto inv) {
        return inv.getStatus() != null
                && !"paid".equalsIgnoreCase(inv.getStatus())
                && !"cancelled".equalsIgnoreCase(inv.getStatus());
    }

    private List<Map<String, Object>> monthlyTotals(String typeFilter) {
        List<InvoiceDto> all = invoiceService.findAll(null, null, null, null);
        Map<String, BigDecimal> map = new TreeMap<>();
        for (InvoiceDto inv : all) {
            if ("paid".equalsIgnoreCase(inv.getStatus())) {
                boolean isAr = "AR".equals(inv.getType());
                if (typeFilter != null && !typeFilter.equals(inv.getType())) continue;
                if (typeFilter == null && isAr) continue; // expense = not AR
                String month = inv.getIssueDate() != null ? inv.getIssueDate().toString().substring(0, 7) : null;
                if (month == null) continue;
                BigDecimal amount = inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO;
                map.merge(month, amount, BigDecimal::add);
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> e : map.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", e.getKey());
            row.put("total", e.getValue());
            result.add(row);
        }
        return result;
    }
}
