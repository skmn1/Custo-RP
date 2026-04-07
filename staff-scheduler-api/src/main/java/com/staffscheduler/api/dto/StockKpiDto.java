package com.staffscheduler.api.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockKpiDto {
    private BigDecimal totalInventoryValue;
    private long totalSkus;
    private long lowStockItems;
    private BigDecimal avgDaysToStockout;
    private List<WeeklyTrend> movementTrend;
    private List<TopConsumed> topConsumed;
    private List<CategoryValue> valueByCategory;
    private List<LowStockAlert> lowStockAlerts;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class WeeklyTrend {
        private String week;
        private BigDecimal qtyIn;
        private BigDecimal qtyOut;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopConsumed {
        private String itemName;
        private String itemSku;
        private BigDecimal totalConsumed;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryValue {
        private String categoryName;
        private BigDecimal value;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LowStockAlert {
        private String id;
        private String itemName;
        private String itemSku;
        private BigDecimal currentQty;
        private BigDecimal reorderPoint;
        private BigDecimal minLevel;
        private String status; // warn or critical
    }
}
