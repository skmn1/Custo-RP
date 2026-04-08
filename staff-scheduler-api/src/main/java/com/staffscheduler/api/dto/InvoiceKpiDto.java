package com.staffscheduler.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceKpiDto {

    private BigDecimal apUnpaidTotal;
    private BigDecimal apPaidMtd;
    private long apPendingApproval;
    private List<MonthlySpend> monthlySpend;
    private List<StatusCount> statusDistribution;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlySpend {
        private String month;
        private BigDecimal amount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StatusCount {
        private String status;
        private long count;
    }
}
