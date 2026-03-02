package com.staffscheduler.api.util;

import com.staffscheduler.api.model.Shift;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

/**
 * Payroll calculation utility — mirrors frontend payroll.js logic.
 */
public class PayrollCalculator {

    // Base hourly rates by role
    public static final Map<String, Double> BASE_RATES = Map.of(
            "Doctor", 85.00,
            "Senior Nurse", 35.00,
            "Nurse", 28.00,
            "Technician", 22.00,
            "Administrator", 25.00,
            "Radiologist", 75.00,
            "Store Manager", 40.00,
            "Assistant Manager", 32.00,
            "Cashier", 18.00,
            "Butcher", 30.00
    );

    public static final double OT_MULTIPLIER = 1.5;
    public static final double DOUBLE_TIME_MULTIPLIER = 2.0;
    public static final double WEEKEND_MULTIPLIER = 1.25;

    // Shift differentials
    public static final Map<String, Double> SHIFT_DIFFERENTIALS = Map.of(
            "Night", 3.00,
            "Weekend", 2.50,
            "Holiday", 5.00,
            "Emergency", 4.00
    );

    // Tax rates
    public static final double TAX_FEDERAL = 0.22;
    public static final double TAX_STATE = 0.08;
    public static final double TAX_SOCIAL_SECURITY = 0.062;
    public static final double TAX_MEDICARE = 0.0145;
    public static final double TAX_UNEMPLOYMENT = 0.006;

    // Benefits
    public static final double BENEFIT_HEALTH = 150.00;
    public static final double BENEFIT_DENTAL = 25.00;
    public static final double BENEFIT_VISION = 15.00;
    public static final double BENEFIT_401K_RATE = 0.06;
    public static final double BENEFIT_LIFE = 20.00;

    public static final double STANDARD_WEEKLY_HOURS = 40.0;
    public static final double DOUBLE_TIME_THRESHOLD = 60.0;

    public static double getBaseRate(String role) {
        return BASE_RATES.getOrDefault(role, 25.00);
    }

    public static double calculateOvertimeHours(double totalHours) {
        return totalHours > STANDARD_WEEKLY_HOURS ? totalHours - STANDARD_WEEKLY_HOURS : 0;
    }

    public static double calculateDoubleTimeHours(double totalHours) {
        return totalHours > DOUBLE_TIME_THRESHOLD ? totalHours - DOUBLE_TIME_THRESHOLD : 0;
    }

    public static String getShiftType(String startTime, String endTime, LocalDate date) {
        int startHour = Integer.parseInt(startTime.split(":")[0]);
        int endHour = Integer.parseInt(endTime.split(":")[0]);

        if (startHour >= 23 || endHour <= 7) return "Night";

        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) return "Weekend";

        return "Regular";
    }

    /**
     * Full payroll calculation for one employee in a given period.
     */
    public static EmployeePayrollResult calculate(String role, List<Shift> shifts) {
        double baseRate = getBaseRate(role);
        double totalHours = shifts.stream().mapToDouble(Shift::getDuration).sum();

        double overtimeAll = calculateOvertimeHours(totalHours);
        double doubleTimeHours = calculateDoubleTimeHours(totalHours);
        double overtimeHours = overtimeAll - doubleTimeHours;
        double regularHours = totalHours - overtimeAll;

        double regularPay = regularHours * baseRate;
        double overtimePay = overtimeHours * baseRate * OT_MULTIPLIER;
        double doubleTimePay = doubleTimeHours * baseRate * DOUBLE_TIME_MULTIPLIER;

        double shiftDiffs = 0;
        for (Shift s : shifts) {
            String sType = getShiftType(s.getStartTime(), s.getEndTime(), s.getDate());
            double diff = SHIFT_DIFFERENTIALS.getOrDefault(sType, 0.0);
            shiftDiffs += diff * s.getDuration();
        }

        double grossPay = regularPay + overtimePay + doubleTimePay + shiftDiffs;

        // Taxes
        double federalTax = grossPay * TAX_FEDERAL;
        double stateTax = grossPay * TAX_STATE;
        double socialSecurity = grossPay * TAX_SOCIAL_SECURITY;
        double medicare = grossPay * TAX_MEDICARE;
        double unemployment = grossPay * TAX_UNEMPLOYMENT;
        double totalTaxes = federalTax + stateTax + socialSecurity + medicare + unemployment;

        // Benefits (prorated per bi-weekly pay period)
        double healthInsurance = BENEFIT_HEALTH / 2.0;   // bi-weekly
        double dentalInsurance = BENEFIT_DENTAL / 2.0;
        double visionInsurance = BENEFIT_VISION / 2.0;
        double retirement401k = grossPay * BENEFIT_401K_RATE;
        double lifeInsurance = BENEFIT_LIFE / 2.0;
        double totalBenefits = healthInsurance + dentalInsurance + visionInsurance + retirement401k + lifeInsurance;

        double totalDeductions = totalTaxes + totalBenefits;
        double netPay = grossPay - totalDeductions;

        return new EmployeePayrollResult(
                baseRate, totalHours, regularHours, overtimeHours, doubleTimeHours,
                regularPay, overtimePay, doubleTimePay, shiftDiffs, grossPay,
                federalTax, stateTax, socialSecurity, medicare, unemployment, totalTaxes,
                healthInsurance, retirement401k, totalBenefits, totalDeductions, netPay
        );
    }

    public record EmployeePayrollResult(
            double baseRate, double totalHours, double regularHours,
            double overtimeHours, double doubleTimeHours,
            double regularPay, double overtimePay, double doubleTimePay,
            double shiftDifferentials, double grossPay,
            double federalTax, double stateTax, double socialSecurity,
            double medicare, double unemployment, double totalTaxes,
            double healthInsurance, double retirement401k,
            double totalBenefits, double totalDeductions, double netPay) {}
}
