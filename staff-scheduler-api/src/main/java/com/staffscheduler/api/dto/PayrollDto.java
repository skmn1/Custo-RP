package com.staffscheduler.api.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class PayrollDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Summary {
        private int totalEmployees;
        private double totalHours;
        private double totalOvertimeHours;
        private double totalGrossPay;
        private double totalNetPay;
        private double avgHourlyRate;
        private double grossPayChange;
        private double netPayChange;
        private double hoursChange;
        private double overtimeChange;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EmployeePayroll {
        private String id;
        private String name;
        private String role;
        private String department;
        private double hourlyRate;
        private double totalHours;
        private double regularHours;
        private double overtimeHours;
        private double doubleTimeHours;
        private double grossPay;
        private double netPay;
        private TaxBreakdown taxes;
        private DeductionBreakdown deductions;
        private double shiftDifferentials;
        private List<ShiftDetail> shifts;
        private PayStub payStub;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TaxBreakdown {
        private double federal;
        private double state;
        private double socialSecurity;
        private double medicare;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DeductionBreakdown {
        private double healthInsurance;
        private double retirement401k;
        private double total;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ShiftDetail {
        private String date;
        private String startTime;
        private String endTime;
        private double duration;
        private String type;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PayStub {
        private String checkNumber;
        private String payDate;
        private String payPeriod;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DepartmentSummary {
        private String department;
        private int employeeCount;
        private double totalHours;
        private double totalPay;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Statistics {
        private int totalEmployees;
        private double totalHours;
        private double totalOvertimeHours;
        private double totalGrossPay;
        private double totalNetPay;
        private double totalTaxes;
        private double totalBenefits;
        private double totalFederalTax;
        private double totalStateTax;
        private double totalSocialSecurity;
        private double totalMedicare;
        private double totalHealthInsurance;
        private double totalEmployerTaxes;
        private double totalEmployerBenefits;
        private double avgHourlyRate;
        private double avgWeeklyHours;
        private double overtimePercentage;
        private double laborCostRatio;
        private int employeesWithOvertime;
        private double overtimeCost;
        private double overtimePremium;
    }
}
