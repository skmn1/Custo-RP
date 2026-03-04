package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.PayrollDto;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.model.Shift;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.ShiftRepository;
import com.staffscheduler.api.util.PayrollCalculator;
import com.staffscheduler.api.util.PayrollCalculator.EmployeePayrollResult;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;

    // ── Per-employee payroll ──

    public List<PayrollDto.EmployeePayroll> calculateEmployeePayrolls(LocalDate startDate, LocalDate endDate) {
        List<Employee> employees = employeeRepository.findAll();
        List<Shift> allShifts = shiftRepository.findByDateBetween(startDate, endDate);

        Map<String, List<Shift>> shiftsByEmployee = allShifts.stream()
                .collect(Collectors.groupingBy(Shift::getEmployeeId));

        return employees.stream()
                .filter(emp -> !shiftsByEmployee.getOrDefault(emp.getId(), List.of()).isEmpty())
                .map(emp -> {
                    List<Shift> empShifts = shiftsByEmployee.getOrDefault(emp.getId(), List.of());

                    EmployeePayrollResult calc = PayrollCalculator.calculate(emp.getRole(), empShifts);

                    List<PayrollDto.ShiftDetail> shiftDetails = empShifts.stream()
                            .map(s -> PayrollDto.ShiftDetail.builder()
                                    .date(s.getDate().toString())
                                    .startTime(s.getStartTime())
                                    .endTime(s.getEndTime())
                                    .duration(s.getDuration())
                                    .type(s.getType() != null ? s.getType() : "Regular")
                                    .build())
                            .collect(Collectors.toList());

                    return PayrollDto.EmployeePayroll.builder()
                            .id(emp.getId())
                            .name(emp.getName())
                            .role(emp.getRole())
                            .department(null)
                            .hourlyRate(calc.baseRate())
                            .totalHours(calc.totalHours())
                            .regularHours(calc.regularHours())
                            .overtimeHours(calc.overtimeHours())
                            .doubleTimeHours(calc.doubleTimeHours())
                            .grossPay(calc.grossPay())
                            .netPay(calc.netPay())
                            .taxes(PayrollDto.TaxBreakdown.builder()
                                    .federal(calc.federalTax())
                                    .state(calc.stateTax())
                                    .socialSecurity(calc.socialSecurity())
                                    .medicare(calc.medicare())
                                    .build())
                            .deductions(PayrollDto.DeductionBreakdown.builder()
                                    .healthInsurance(calc.healthInsurance())
                                    .retirement401k(calc.retirement401k())
                                    .total(calc.totalDeductions())
                                    .build())
                            .shiftDifferentials(calc.shiftDifferentials())
                            .shifts(shiftDetails)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Summary ──

    public PayrollDto.Summary calculateSummary(LocalDate startDate, LocalDate endDate) {
        List<PayrollDto.EmployeePayroll> payrolls = calculateEmployeePayrolls(startDate, endDate);

        double totalGross = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getGrossPay).sum();
        double totalNet = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getNetPay).sum();
        double totalHours = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getTotalHours).sum();
        double totalOT = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getOvertimeHours).sum();

        return PayrollDto.Summary.builder()
                .totalEmployees(payrolls.size())
                .totalHours(totalHours)
                .totalOvertimeHours(totalOT)
                .totalGrossPay(totalGross)
                .totalNetPay(totalNet)
                .avgHourlyRate(totalHours > 0 ? totalGross / totalHours : 0)
                .build();
    }

    // ── Department breakdown ──

    public List<PayrollDto.DepartmentSummary> calculateDepartmentPayroll(LocalDate startDate, LocalDate endDate) {
        List<PayrollDto.EmployeePayroll> payrolls = calculateEmployeePayrolls(startDate, endDate);

        Map<String, List<PayrollDto.EmployeePayroll>> byDept = payrolls.stream()
                .collect(Collectors.groupingBy(PayrollDto.EmployeePayroll::getDepartment));

        return byDept.entrySet().stream()
                .map(e -> PayrollDto.DepartmentSummary.builder()
                        .department(e.getKey())
                        .employeeCount(e.getValue().size())
                        .totalHours(e.getValue().stream().mapToDouble(PayrollDto.EmployeePayroll::getTotalHours).sum())
                        .totalPay(e.getValue().stream().mapToDouble(PayrollDto.EmployeePayroll::getGrossPay).sum())
                        .build())
                .sorted(Comparator.comparing(PayrollDto.DepartmentSummary::getDepartment))
                .collect(Collectors.toList());
    }

    // ── Statistics ──

    public PayrollDto.Statistics calculateStatistics(LocalDate startDate, LocalDate endDate) {
        List<PayrollDto.EmployeePayroll> payrolls = calculateEmployeePayrolls(startDate, endDate);

        double totalGross = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getGrossPay).sum();
        double totalNet = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getNetPay).sum();
        double totalHours = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getTotalHours).sum();
        double totalOT = payrolls.stream().mapToDouble(PayrollDto.EmployeePayroll::getOvertimeHours).sum();

        double totalFederal = payrolls.stream().mapToDouble(p -> p.getTaxes().getFederal()).sum();
        double totalState = payrolls.stream().mapToDouble(p -> p.getTaxes().getState()).sum();
        double totalSS = payrolls.stream().mapToDouble(p -> p.getTaxes().getSocialSecurity()).sum();
        double totalMedicare = payrolls.stream().mapToDouble(p -> p.getTaxes().getMedicare()).sum();
        double totalTaxes = totalFederal + totalState + totalSS + totalMedicare;

        double totalHealth = payrolls.stream().mapToDouble(p -> p.getDeductions().getHealthInsurance()).sum();
        double totalRetirement = payrolls.stream().mapToDouble(p -> p.getDeductions().getRetirement401k()).sum();
        double totalBenefits = totalHealth + totalRetirement;

        int employeesWithOT = (int) payrolls.stream().filter(p -> p.getOvertimeHours() > 0).count();
        double otCost = payrolls.stream()
                .mapToDouble(p -> p.getOvertimeHours() * p.getHourlyRate() * 1.5).sum();
        double otPremium = payrolls.stream()
                .mapToDouble(p -> p.getOvertimeHours() * p.getHourlyRate() * 0.5).sum();

        return PayrollDto.Statistics.builder()
                .totalEmployees(payrolls.size())
                .totalHours(totalHours)
                .totalOvertimeHours(totalOT)
                .totalGrossPay(totalGross)
                .totalNetPay(totalNet)
                .totalTaxes(totalTaxes)
                .totalBenefits(totalBenefits)
                .totalFederalTax(totalFederal)
                .totalStateTax(totalState)
                .totalSocialSecurity(totalSS)
                .totalMedicare(totalMedicare)
                .totalHealthInsurance(totalHealth)
                .totalEmployerTaxes(totalSS + totalMedicare)
                .totalEmployerBenefits(totalBenefits)
                .avgHourlyRate(totalHours > 0 ? totalGross / totalHours : 0)
                .avgWeeklyHours(payrolls.size() > 0 ? totalHours / payrolls.size() : 0)
                .overtimePercentage(totalHours > 0 ? (totalOT / totalHours) * 100 : 0)
                .laborCostRatio(75)
                .employeesWithOvertime(employeesWithOT)
                .overtimeCost(otCost)
                .overtimePremium(otPremium)
                .build();
    }

    // ── CSV Export ──

    public String exportCsv(LocalDate startDate, LocalDate endDate) throws IOException {
        List<PayrollDto.EmployeePayroll> payrolls = calculateEmployeePayrolls(startDate, endDate);

        StringWriter writer = new StringWriter();
        CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                .setHeader("Employee Name", "Role", "Department", "Regular Hours", "Overtime Hours",
                        "Total Hours", "Base Rate", "Gross Pay", "Federal Tax", "State Tax",
                        "Social Security", "Medicare", "Total Deductions", "Net Pay")
                .build());

        for (PayrollDto.EmployeePayroll emp : payrolls) {
            printer.printRecord(
                    emp.getName(),
                    emp.getRole(),
                    emp.getDepartment(),
                    String.format("%.2f", emp.getRegularHours()),
                    String.format("%.2f", emp.getOvertimeHours()),
                    String.format("%.2f", emp.getTotalHours()),
                    String.format("%.2f", emp.getHourlyRate()),
                    String.format("%.2f", emp.getGrossPay()),
                    String.format("%.2f", emp.getTaxes().getFederal()),
                    String.format("%.2f", emp.getTaxes().getState()),
                    String.format("%.2f", emp.getTaxes().getSocialSecurity()),
                    String.format("%.2f", emp.getTaxes().getMedicare()),
                    String.format("%.2f", emp.getDeductions().getTotal()),
                    String.format("%.2f", emp.getNetPay())
            );
        }

        printer.flush();
        return writer.toString();
    }
}
