package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Detailed PoS view including employees and dashboard")
public class PosDetailDto {
    @Schema(description = "PoS ID", example = "1")
    private Long id;
    @Schema(description = "Location name", example = "Downtown Café")
    private String name;
    @Schema(description = "Street address", example = "123 Main Street")
    private String address;
    @Schema(description = "Location type", example = "restaurant")
    private String type;
    @Schema(description = "Phone number", example = "+30-210-555-0001")
    private String phone;
    @Schema(description = "Manager employee ID", example = "emp-5")
    private String managerId;
    @Schema(description = "Manager name", example = "Nikolaos Stavrou")
    private String managerName;
    @Schema(description = "Weekly opening hours")
    private Object openingHours;
    @Schema(description = "Active status", example = "true")
    private Boolean isActive;
    @Schema(description = "Creation timestamp")
    private String createdAt;
    @Schema(description = "Last update timestamp")
    private String updatedAt;
    @Schema(description = "Employees assigned to this PoS")
    private List<EmployeeDto> employees;
    @Schema(description = "PoS dashboard metrics")
    private Dashboard dashboard;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Dashboard metrics for a PoS location")
    public static class Dashboard {
        @Schema(description = "Number of assigned employees", example = "5")
        private int employeeCount;
        @Schema(description = "Number of shifts scheduled today", example = "3")
        private int shiftsToday;
        @Schema(description = "Date of last inventory check", example = "2025-06-01")
        private String lastInventoryDate;
        @Schema(description = "Number of low-stock alerts", example = "2")
        private int lowStockAlerts;
    }
}
