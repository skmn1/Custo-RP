package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.StockKpiDto;
import com.staffscheduler.api.model.StockItem;
import com.staffscheduler.api.repository.StockCategoryRepository;
import com.staffscheduler.api.repository.StockItemRepository;
import com.staffscheduler.api.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardKpiService {

    private final StockItemRepository itemRepo;
    private final StockMovementRepository movementRepo;
    private final StockCategoryRepository categoryRepo;

    public StockKpiDto getKpis() {
        List<StockItem> activeItems = itemRepo.findByIsActiveTrueOrderByNameEnAsc();

        // Total SKUs
        long totalSkus = activeItems.size();

        // Inventory value & low stock
        BigDecimal totalValue = BigDecimal.ZERO;
        long lowStockCount = 0;
        List<StockKpiDto.LowStockAlert> alerts = new ArrayList<>();

        for (StockItem item : activeItems) {
            BigDecimal qty = movementRepo.sumQtyByItemId(item.getId());
            BigDecimal value = qty.multiply(item.getAvgCost());
            totalValue = totalValue.add(value);

            String status = null;
            if (qty.compareTo(item.getMinLevel()) <= 0) {
                status = "critical";
            } else if (qty.compareTo(item.getReorderPoint()) <= 0) {
                status = "warn";
            }

            if (status != null) {
                lowStockCount++;
                alerts.add(StockKpiDto.LowStockAlert.builder()
                        .id(item.getId().toString())
                        .itemName(item.getNameEn())
                        .itemSku(item.getSku())
                        .currentQty(qty)
                        .reorderPoint(item.getReorderPoint())
                        .minLevel(item.getMinLevel())
                        .status(status)
                        .build());
            }
        }

        // Weekly movement trend (last 12 weeks)
        LocalDateTime since12w = LocalDateTime.now().minusWeeks(12);
        List<Object[]> trendData = movementRepo.findWeeklyTrend(since12w);
        List<StockKpiDto.WeeklyTrend> trends = trendData.stream().map(row -> {
            String week = row[0] != null ? ((Timestamp) row[0]).toLocalDateTime().toLocalDate().toString() : "";
            BigDecimal qtyIn = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            BigDecimal qtyOut = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            return StockKpiDto.WeeklyTrend.builder()
                    .week(week).qtyIn(qtyIn).qtyOut(qtyOut).build();
        }).collect(Collectors.toList());

        // Top consumed (last 30 days)
        LocalDateTime since30d = LocalDateTime.now().minusDays(30);
        List<Object[]> topData = movementRepo.findTopConsumedSince(since30d);
        List<StockKpiDto.TopConsumed> topConsumed = topData.stream().map(row -> {
            String itemId = row[0].toString();
            BigDecimal total = (BigDecimal) row[1];
            String name = itemRepo.findById(java.util.UUID.fromString(itemId))
                    .map(StockItem::getNameEn).orElse("Unknown");
            String sku = itemRepo.findById(java.util.UUID.fromString(itemId))
                    .map(StockItem::getSku).orElse("");
            return StockKpiDto.TopConsumed.builder()
                    .itemName(name).itemSku(sku).totalConsumed(total).build();
        }).collect(Collectors.toList());

        // Value by category - aggregate from items
        List<StockKpiDto.CategoryValue> categoryValues = new ArrayList<>();
        var categories = categoryRepo.findByIsActiveTrueOrderBySortOrderAsc();
        for (var cat : categories) {
            BigDecimal catValue = activeItems.stream()
                    .filter(item -> cat.getId().equals(item.getCategoryId()))
                    .map(item -> movementRepo.sumQtyByItemId(item.getId()).multiply(item.getAvgCost()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (catValue.compareTo(BigDecimal.ZERO) > 0) {
                categoryValues.add(StockKpiDto.CategoryValue.builder()
                        .categoryName(cat.getNameEn())
                        .value(catValue)
                        .build());
            }
        }

        // Average days to stockout (simplified: current qty / avg daily consumption over 30d)
        BigDecimal avgDays = BigDecimal.ZERO;
        int itemsWithConsumption = 0;
        for (StockItem item : activeItems) {
            BigDecimal consumption = movementRepo.sumConsumptionSince(item.getId(), since30d);
            if (consumption.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal dailyConsumption = consumption.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
                BigDecimal qty = movementRepo.sumQtyByItemId(item.getId());
                if (dailyConsumption.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal daysToStockout = qty.divide(dailyConsumption, 1, RoundingMode.HALF_UP);
                    avgDays = avgDays.add(daysToStockout);
                    itemsWithConsumption++;
                }
            }
        }
        if (itemsWithConsumption > 0) {
            avgDays = avgDays.divide(BigDecimal.valueOf(itemsWithConsumption), 1, RoundingMode.HALF_UP);
        }

        return StockKpiDto.builder()
                .totalInventoryValue(totalValue)
                .totalSkus(totalSkus)
                .lowStockItems(lowStockCount)
                .avgDaysToStockout(avgDays)
                .movementTrend(trends)
                .topConsumed(topConsumed)
                .valueByCategory(categoryValues)
                .lowStockAlerts(alerts)
                .build();
    }
}
