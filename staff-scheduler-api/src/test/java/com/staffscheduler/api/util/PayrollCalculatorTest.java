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
            "Doctor, 85.00",
            "Senior Nurse, 35.00",
            "Nurse, 28.00",
            "Technician, 22.00",
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
                PayrollCalculator.calculate("Nurse", shifts);

        // 40 hours * $28/hr = $1120 gross (no OT, no shift diffs for regular weekday)
        assertThat(result.totalHours()).isEqualTo(40.0);
        assertThat(result.regularHours()).isEqualTo(40.0);
        assertThat(result.overtimeHours()).isEqualTo(0.0);
        assertThat(result.baseRate()).isEqualTo(28.0);
        assertThat(result.grossPay()).isEqualTo(1120.0);

        // Verify taxes
        assertThat(result.federalTax()).isCloseTo(246.40, within(0.01));  // 22%
        assertThat(result.stateTax()).isCloseTo(89.60, within(0.01));     // 8%
        assertThat(result.socialSecurity()).isCloseTo(69.44, within(0.01)); // 6.2%
        assertThat(result.medicare()).isCloseTo(16.24, within(0.01));     // 1.45%

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
                PayrollCalculator.calculate("Nurse", shifts);

        // 48 total, 40 regular, 8 OT
        assertThat(result.totalHours()).isEqualTo(48.0);
        assertThat(result.regularHours()).isEqualTo(40.0);
        assertThat(result.overtimeHours()).isEqualTo(8.0);
        assertThat(result.doubleTimeHours()).isEqualTo(0.0);

        // OT pay = 8h * 28 * 1.5 = 336
        assertThat(result.overtimePay()).isCloseTo(336.0, within(0.01));
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
                PayrollCalculator.calculate("Nurse", shifts);

        // 65 total, 40 regular, 20 OT (60-40), 5 DT (65-60)
        assertThat(result.totalHours()).isEqualTo(65.0);
        assertThat(result.regularHours()).isEqualTo(40.0);
        assertThat(result.overtimeHours()).isEqualTo(20.0);
        assertThat(result.doubleTimeHours()).isEqualTo(5.0);

        double dtPay = 5.0 * 28.0 * 2.0; // 280
        assertThat(result.doubleTimePay()).isCloseTo(dtPay, within(0.01));
    }

    @Test
    void calculate_shouldIncludeShiftDifferentials_forNightShifts() {
        List<Shift> shifts = List.of(
                createShift("23:00", "07:00", LocalDate.of(2026, 3, 2), 8.0) // Night shift
        );

        PayrollCalculator.EmployeePayrollResult result =
                PayrollCalculator.calculate("Nurse", shifts);

        // Night differential: $3.00/hr * 8h = $24
        assertThat(result.shiftDifferentials()).isCloseTo(24.0, within(0.01));
        assertThat(result.grossPay()).isCloseTo(8.0 * 28.0 + 24.0, within(0.01));
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
                .department("ICU")
                .build();
    }
}
