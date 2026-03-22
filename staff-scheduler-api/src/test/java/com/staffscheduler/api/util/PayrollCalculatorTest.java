package com.staffscheduler.api.util;

import com.staffscheduler.api.model.Shift;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class PayrollCalculatorTest {

    @ParameterizedTest
    @CsvSource({
            "Sales Associate, 18.00",
            "Stock Clerk, 17.00",
            "Cashier, 16.00",
            "Deli Clerk, 18.00",
            "Unknown Role, 25.00"
    })
    void getBaseRate_shouldReturnCorrectRate(String role, double expected) {
        assertThat(PayrollCalculator.getBaseRate(role)).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({
            "30.0, 0.0",
            "40.0, 0.0",
            "45.0, 5.0",
            "60.0, 20.0",
            "70.0, 30.0"
    })
    void calculateOvertimeHours_shouldReturnCorrectHours(double total, double expected) {
        assertThat(PayrollCalculator.calculateOvertimeHours(total)).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({
            "40.0, 0.0",
            "60.0, 0.0",
            "65.0, 5.0",
            "70.0, 10.0"
    })
    void calculateDoubleTimeHours_shouldReturnCorrectHours(double total, double expected) {
        assertThat(PayrollCalculator.calculateDoubleTimeHours(total)).isEqualTo(expected);
    }

    @Test
    void getShiftType_shouldDetectNightShift() {
        assertThat(PayrollCalculator.getShiftType("23:00", "07:00", LocalDate.of(2026, 3, 2)))
                .isEqualTo("Night");
    }

    @Test
    void getShiftType_shouldDetectWeekendShift() {
        // 2026-03-07 is Saturday
        assertThat(PayrollCalculator.getShiftType("09:00", "17:00", LocalDate.of(2026, 3, 7)))
                .isEqualTo("Weekend");
    }

    @Test
    void getShiftType_shouldReturnRegularForWeekday() {
        // 2026-03-02 is Monday
        assertThat(PayrollCalculator.getShiftType("09:00", "17:00", LocalDate.of(2026, 3, 2)))
                .isEqualTo("Regular");
    }

    @Test
    void calculate_shouldComputeFullPayroll_forRegularHours() {
        List<Shift> shifts = List.of(
                createShift("09:00", "17:00", LocalDate.of(2026, 3, 2), 8.0),  // Mon
                createShift("09:00", "17:00", LocalDate.of(2026, 3, 3), 8.0),  // Tue
                createShift("09:00", "17:00", LocalDate.of(2026, 3, 4), 8.0),  // Wed
                createShift("09:00", "17:00", LocalDate.of(2026, 3, 5), 8.0),  // Thu
                createShift("09:00", "17:00", LocalDate.of(2026, 3, 6), 8.0)   // Fri
        );

        PayrollCalculator.EmployeePayrollResult result =
                PayrollCalculator.calculate("Cashier", shifts);

        // 40 hours * $16/hr = $640 gross (no OT, no shift diffs for regular weekday)
        assertThat(result.totalHours()).isEqualTo(40.0);
        assertThat(result.regularHours()).isEqualTo(40.0);
        assertThat(result.overtimeHours()).isEqualTo(0.0);
        assertThat(result.baseRate()).isEqualTo(16.0);
        assertThat(result.grossPay()).isEqualTo(640.0);

        // Verify taxes
        assertThat(result.federalTax()).isCloseTo(140.80, within(0.01));  // 22%
        assertThat(result.stateTax()).isCloseTo(51.20, within(0.01));     // 8%
        assertThat(result.socialSecurity()).isCloseTo(39.68, within(0.01)); // 6.2%
        assertThat(result.medicare()).isCloseTo(9.28, within(0.01));     // 1.45%

        // Net pay: gross - taxes - benefits > 0
        assertThat(result.netPay()).isPositive();
        assertThat(result.netPay()).isLessThan(result.grossPay());
    }

    @Test
    void calculate_shouldComputeOvertime_forExcessHours() {
        List<Shift> shifts = List.of(
                createShift("06:00", "18:00", LocalDate.of(2026, 3, 2), 12.0),  // Mon 12h
                createShift("06:00", "18:00", LocalDate.of(2026, 3, 3), 12.0),  // Tue 12h
                createShift("06:00", "18:00", LocalDate.of(2026, 3, 4), 12.0),  // Wed 12h
                createShift("06:00", "18:00", LocalDate.of(2026, 3, 5), 12.0)   // Thu 12h
        );

        PayrollCalculator.EmployeePayrollResult result =
                PayrollCalculator.calculate("Cashier", shifts);

        // 48 total, 40 regular, 8 OT
        assertThat(result.totalHours()).isEqualTo(48.0);
        assertThat(result.regularHours()).isEqualTo(40.0);
        assertThat(result.overtimeHours()).isEqualTo(8.0);
        assertThat(result.doubleTimeHours()).isEqualTo(0.0);

        // OT pay = 8h * 16 * 1.5 = 192
        assertThat(result.overtimePay()).isCloseTo(192.0, within(0.01));
    }

    @Test
    void calculate_shouldComputeDoubleTime_beyondThreshold() {
        List<Shift> shifts = List.of(
                createShift("06:00", "19:00", LocalDate.of(2026, 3, 2), 13.0),  // Mon
                createShift("06:00", "19:00", LocalDate.of(2026, 3, 3), 13.0),  // Tue
                createShift("06:00", "19:00", LocalDate.of(2026, 3, 4), 13.0),  // Wed
                createShift("06:00", "19:00", LocalDate.of(2026, 3, 5), 13.0),  // Thu
                createShift("06:00", "19:00", LocalDate.of(2026, 3, 6), 13.0)   // Fri
        );

        PayrollCalculator.EmployeePayrollResult result =
                PayrollCalculator.calculate("Cashier", shifts);

        // 65 total, 40 regular, 20 OT (60-40), 5 DT (65-60)
        assertThat(result.totalHours()).isEqualTo(65.0);
        assertThat(result.regularHours()).isEqualTo(40.0);
        assertThat(result.overtimeHours()).isEqualTo(20.0);
        assertThat(result.doubleTimeHours()).isEqualTo(5.0);

        double dtPay = 5.0 * 16.0 * 2.0; // 160
        assertThat(result.doubleTimePay()).isCloseTo(dtPay, within(0.01));
    }

    @Test
    void calculate_shouldIncludeShiftDifferentials_forNightShifts() {
        List<Shift> shifts = List.of(
                createShift("23:00", "07:00", LocalDate.of(2026, 3, 2), 8.0) // Night shift
        );

        PayrollCalculator.EmployeePayrollResult result =
                PayrollCalculator.calculate("Cashier", shifts);

        // Night differential: $3.00/hr * 8h = $24
        assertThat(result.shiftDifferentials()).isCloseTo(24.0, within(0.01));
        assertThat(result.grossPay()).isCloseTo(8.0 * 16.0 + 24.0, within(0.01));
    }

    private Shift createShift(String startTime, String endTime, LocalDate date, double duration) {
        return Shift.builder()
                .id("test-shift")
                .employeeId("emp1")
                .date(date)
                .dayIndex(date.getDayOfWeek().getValue() - 1)
                .startTime(startTime)
                .endTime(endTime)
                .duration(duration)
                .type("Regular")
                .department("Sales")
                .build();
    }
}
