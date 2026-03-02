package com.staffscheduler.api.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosDetailDto {
    private Long id;
    private String name;
    private String address;
    private String type;
    private String phone;
    private String managerId;
    private String managerName;
    private Object openingHours;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
    private List<EmployeeDto> employees;
    private Dashboard dashboard;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Dashboard {
        private int employeeCount;
        private int shiftsToday;
        private String lastInventoryDate;
        private int lowStockAlerts;
    }
}
