package com.staffscheduler.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockItemDto {
    private UUID id;
    private String sku;
    private String nameEn;
    private String nameFr;
    private UUID categoryId;
    private String categoryNameEn;
    private String categoryNameFr;
    private String uom;
    private String barcode;
    private BigDecimal reorderPoint;
    private BigDecimal minLevel;
    private BigDecimal avgCost;
    private BigDecimal salePrice;
    private UUID preferredSupplierId;
    private String supplierName;
    private UUID locationId;
    private String locationName;
    private String imageUrl;
    private Boolean isBatchTracked;
    private Boolean isActive;
    private BigDecimal currentQty;
    private String stockStatus; // normal, warn, critical
    private List<LocationQty> locationBreakdown;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LocationQty {
        private UUID locationId;
        private String locationName;
        private BigDecimal qty;
    }
}
