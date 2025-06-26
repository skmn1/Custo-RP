import { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { payrollConfig, getShiftType, calculateOvertimeHours, calculateDoubleTimeHours } from '../data/payroll';

export const usePayroll = (employees, shifts) => {
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1), { weekStartsOn: 1 })
    };
  });

  // Calculate individual employee payroll
  const calculateEmployeePayroll = useCallback((employee, employeeShifts, payPeriod) => {
    const baseRate = payrollConfig.baseRates[employee.role] || 25.00;
    
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalDoubleTimeHours = 0;
    let totalShiftDifferentials = 0;
    let grossPay = 0;
    
    const daysInPeriod = eachDayOfInterval(payPeriod);
    const shiftsInPeriod = employeeShifts.filter(shift => {
      const shiftDate = daysInPeriod[shift.day];
      return shiftDate >= payPeriod.start && shiftDate <= payPeriod.end;
    });

    // Calculate total hours worked
    const totalHours = shiftsInPeriod.reduce((sum, shift) => sum + shift.duration, 0);
    
    // Calculate overtime
    const overtimeHours = calculateOvertimeHours(totalHours);
    const doubleTimeHours = calculateDoubleTimeHours(totalHours);
    const regularHours = totalHours - overtimeHours;

    totalRegularHours = regularHours;
    totalOvertimeHours = overtimeHours - doubleTimeHours;
    totalDoubleTimeHours = doubleTimeHours;

    // Calculate base pay
    grossPay += regularHours * baseRate;
    grossPay += totalOvertimeHours * baseRate * payrollConfig.overtimeMultipliers.standard;
    grossPay += doubleTimeHours * baseRate * payrollConfig.overtimeMultipliers.double;

    // Calculate shift differentials
    shiftsInPeriod.forEach(shift => {
      const shiftDate = daysInPeriod[shift.day];
      const shiftType = getShiftType(shift.startTime, shift.endTime, shiftDate);
      const differential = payrollConfig.shiftDifferentials[shiftType] || 0;
      totalShiftDifferentials += differential * shift.duration;
    });

    grossPay += totalShiftDifferentials;

    // Calculate taxes and deductions
    const federalTax = grossPay * payrollConfig.taxRates.federal;
    const stateTax = grossPay * payrollConfig.taxRates.state;
    const socialSecurity = grossPay * payrollConfig.taxRates.socialSecurity;
    const medicare = grossPay * payrollConfig.taxRates.medicare;
    const unemployment = grossPay * payrollConfig.taxRates.unemployment;

    const totalTaxes = federalTax + stateTax + socialSecurity + medicare + unemployment;

    // Calculate benefits (prorated for pay period)
    const payPeriodsPerYear = 26; // Bi-weekly
    const healthInsurance = payrollConfig.benefits.healthInsurance / (12 / (payPeriodsPerYear / 12));
    const dentalInsurance = payrollConfig.benefits.dentalInsurance / (12 / (payPeriodsPerYear / 12));
    const visionInsurance = payrollConfig.benefits.visionInsurance / (12 / (payPeriodsPerYear / 12));
    const retirement401k = grossPay * payrollConfig.benefits.retirement401k;
    const lifeInsurance = payrollConfig.benefits.lifeInsurance / (12 / (payPeriodsPerYear / 12));

    const totalBenefits = healthInsurance + dentalInsurance + visionInsurance + retirement401k + lifeInsurance;
    const totalDeductions = totalTaxes + totalBenefits;
    const netPay = grossPay - totalDeductions;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      role: employee.role,
      department: employee.department,
      payPeriod,
      hours: {
        regular: totalRegularHours,
        overtime: totalOvertimeHours,
        doubleTime: totalDoubleTimeHours,
        total: totalHours,
      },
      rates: {
        base: baseRate,
        overtime: baseRate * payrollConfig.overtimeMultipliers.standard,
        doubleTime: baseRate * payrollConfig.overtimeMultipliers.double,
      },
      pay: {
        regularPay: regularHours * baseRate,
        overtimePay: totalOvertimeHours * baseRate * payrollConfig.overtimeMultipliers.standard,
        doubleTimePay: doubleTimeHours * baseRate * payrollConfig.overtimeMultipliers.double,
        shiftDifferentials: totalShiftDifferentials,
        grossPay,
        netPay,
      },
      deductions: {
        federalTax,
        stateTax,
        socialSecurity,
        medicare,
        unemployment,
        healthInsurance,
        dentalInsurance,
        visionInsurance,
        retirement401k,
        lifeInsurance,
        totalTaxes,
        totalBenefits,
        totalDeductions,
      },
      shifts: shiftsInPeriod.length,
    };
  }, []);

  // Calculate payroll for all employees
  const employeePayrolls = useMemo(() => {
    return employees.map(employee => {
      const employeeShifts = shifts.filter(shift => shift.employeeId === employee.id);
      const payrollData = calculateEmployeePayroll(employee, employeeShifts, selectedPayPeriod);
      
      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        hourlyRate: payrollData.rates.base,
        totalHours: payrollData.hours.total,
        regularHours: payrollData.hours.regular,
        overtimeHours: payrollData.hours.overtime,
        doubleTimeHours: payrollData.hours.doubleTime,
        grossPay: payrollData.pay.grossPay,
        netPay: payrollData.pay.netPay,
        taxes: {
          federal: payrollData.deductions.federalTax,
          state: payrollData.deductions.stateTax,
          socialSecurity: payrollData.deductions.socialSecurity,
          medicare: payrollData.deductions.medicare,
        },
        deductions: {
          healthInsurance: payrollData.deductions.healthInsurance,
          retirement401k: payrollData.deductions.retirement401k,
          total: payrollData.deductions.totalDeductions,
        },
        shiftDifferentials: payrollData.rates.differential * payrollData.hours.total,
        shifts: employeeShifts.map(shift => ({
          date: format(eachDayOfInterval(selectedPayPeriod)[shift.day], 'yyyy-MM-dd'),
          startTime: shift.startTime,
          endTime: shift.endTime,
          duration: shift.duration,
          type: shift.type || 'Regular'
        }))
      };
    }).filter(emp => emp.totalHours > 0);
  }, [employees, shifts, selectedPayPeriod, calculateEmployeePayroll]);

  // Calculate comprehensive payroll statistics
  const payrollSummary = useMemo(() => {
    const totalGrossPay = employeePayrolls.reduce((sum, emp) => sum + emp.grossPay, 0);
    const totalNetPay = employeePayrolls.reduce((sum, emp) => sum + emp.netPay, 0);
    const totalHours = employeePayrolls.reduce((sum, emp) => sum + emp.totalHours, 0);
    const totalOvertimeHours = employeePayrolls.reduce((sum, emp) => sum + emp.overtimeHours, 0);
    const totalEmployees = employeePayrolls.length;
    
    const totalFederalTax = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.federal, 0);
    const totalStateTax = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.state, 0);
    const totalSocialSecurity = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.socialSecurity, 0);
    const totalMedicare = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.medicare, 0);
    const totalTaxes = totalFederalTax + totalStateTax + totalSocialSecurity + totalMedicare;

    return {
      totalEmployees,
      totalHours,
      totalOvertimeHours,
      totalGrossPay,
      totalNetPay,
      avgHourlyRate: totalHours > 0 ? totalGrossPay / totalHours : 0,
      grossPayChange: 0, // Would need historical data
      netPayChange: 0,
      hoursChange: 0,
      overtimeChange: 0,
    };
  }, [employeePayrolls]);

  // Department breakdown
  const departmentPayroll = useMemo(() => {
    return employeePayrolls.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = {
          employeeCount: 0,
          totalHours: 0,
          totalPay: 0,
        };
      }
      acc[emp.department].employeeCount += 1;
      acc[emp.department].totalHours += emp.totalHours;
      acc[emp.department].totalPay += emp.grossPay;
      return acc;
    }, {});
  }, [employeePayrolls]);

  // Role breakdown
  const rolePayroll = useMemo(() => {
    return employeePayrolls.reduce((acc, emp) => {
      if (!acc[emp.role]) {
        acc[emp.role] = {
          count: 0,
          totalHours: 0,
          totalPay: 0,
          avgPay: 0,
          avgHours: 0,
          avgRate: 0,
        };
      }
      acc[emp.role].count += 1;
      acc[emp.role].totalHours += emp.totalHours;
      acc[emp.role].totalPay += emp.grossPay;
      acc[emp.role].avgPay = acc[emp.role].totalPay / acc[emp.role].count;
      acc[emp.role].avgHours = acc[emp.role].totalHours / acc[emp.role].count;
      acc[emp.role].avgRate = acc[emp.role].totalPay / acc[emp.role].totalHours;
      return acc;
    }, {});
  }, [employeePayrolls]);

  // Top earners
  const topEarners = useMemo(() => {
    return [...employeePayrolls]
      .sort((a, b) => b.grossPay - a.grossPay)
      .slice(0, 10);
  }, [employeePayrolls]);

  // Comprehensive payroll statistics for analytics
  const payrollStats = useMemo(() => {
    const totalGrossPay = employeePayrolls.reduce((sum, emp) => sum + emp.grossPay, 0);
    const totalNetPay = employeePayrolls.reduce((sum, emp) => sum + emp.netPay, 0);
    const totalHours = employeePayrolls.reduce((sum, emp) => sum + emp.totalHours, 0);
    const totalOvertimeHours = employeePayrolls.reduce((sum, emp) => sum + emp.overtimeHours, 0);
    
    const totalFederalTax = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.federal, 0);
    const totalStateTax = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.state, 0);
    const totalSocialSecurity = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.socialSecurity, 0);
    const totalMedicare = employeePayrolls.reduce((sum, emp) => sum + emp.taxes.medicare, 0);
    const totalTaxes = totalFederalTax + totalStateTax + totalSocialSecurity + totalMedicare;
    
    const totalHealthInsurance = employeePayrolls.reduce((sum, emp) => sum + emp.deductions.healthInsurance, 0);
    const totalRetirement = employeePayrolls.reduce((sum, emp) => sum + emp.deductions.retirement401k, 0);
    const totalBenefits = totalHealthInsurance + totalRetirement;
    
    const employeesWithOvertime = employeePayrolls.filter(emp => emp.overtimeHours > 0).length;
    const overtimeCost = employeePayrolls.reduce((sum, emp) => sum + (emp.overtimeHours * emp.hourlyRate * 1.5), 0);
    const overtimePremium = employeePayrolls.reduce((sum, emp) => sum + (emp.overtimeHours * emp.hourlyRate * 0.5), 0);

    return {
      totalEmployees: employeePayrolls.length,
      totalHours,
      totalOvertimeHours,
      totalGrossPay,
      totalNetPay,
      totalTaxes,
      totalBenefits,
      totalFederalTax,
      totalStateTax,
      totalSocialSecurity,
      totalMedicare,
      totalHealthInsurance,
      totalEmployerTaxes: totalSocialSecurity + totalMedicare, // Employer portion
      totalEmployerBenefits: totalBenefits,
      avgHourlyRate: totalHours > 0 ? totalGrossPay / totalHours : 0,
      avgWeeklyHours: employeePayrolls.length > 0 ? totalHours / employeePayrolls.length : 0,
      overtimePercentage: totalHours > 0 ? (totalOvertimeHours / totalHours) * 100 : 0,
      laborCostRatio: 75, // Would be calculated against revenue
      employeesWithOvertime,
      overtimeCost,
      overtimePremium,
    };
  }, [employeePayrolls]);

  // Recent pay periods (mock data for now)
  const recentPayPeriods = useMemo(() => {
    return [
      {
        start: selectedPayPeriod.start,
        end: selectedPayPeriod.end,
        grossPay: payrollSummary.totalGrossPay,
        netPay: payrollSummary.totalNetPay,
        totalHours: payrollSummary.totalHours,
        employeeCount: payrollSummary.totalEmployees,
      }
    ];
  }, [selectedPayPeriod, payrollSummary]);

  // Navigation functions
  const navigatePayPeriod = useCallback((direction) => {
    if (direction === 'prev') {
      setSelectedPayPeriod(prev => ({
        start: subWeeks(prev.start, 2),
        end: subWeeks(prev.end, 2),
      }));
    } else if (direction === 'next') {
      setSelectedPayPeriod(prev => ({
        start: addWeeks(prev.start, 2),
        end: addWeeks(prev.end, 2),
      }));
    } else if (direction === 'current') {
      const now = new Date();
      setSelectedPayPeriod({
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1), { weekStartsOn: 1 })
      });
    }
  }, []);

  const goToPreviousPeriod = useCallback(() => navigatePayPeriod('prev'), [navigatePayPeriod]);
  const goToNextPeriod = useCallback(() => navigatePayPeriod('next'), [navigatePayPeriod]);
  const goToCurrentPeriod = useCallback(() => navigatePayPeriod('current'), [navigatePayPeriod]);

  // Export functions
  const exportPayrollData = useCallback((format = 'csv') => {
    if (format === 'csv') {
      const headers = [
        'Employee Name', 'Role', 'Department', 'Regular Hours', 'Overtime Hours',
        'Total Hours', 'Base Rate', 'Gross Pay', 'Federal Tax', 'State Tax',
        'Social Security', 'Medicare', 'Total Deductions', 'Net Pay'
      ];
      
      const rows = employeePayrolls.map(emp => [
        emp.name,
        emp.role,
        emp.department,
        emp.regularHours.toFixed(2),
        emp.overtimeHours.toFixed(2),
        emp.totalHours.toFixed(2),
        emp.hourlyRate.toFixed(2),
        emp.grossPay.toFixed(2),
        emp.taxes.federal.toFixed(2),
        emp.taxes.state.toFixed(2),
        emp.taxes.socialSecurity.toFixed(2),
        emp.taxes.medicare.toFixed(2),
        emp.deductions.total.toFixed(2),
        emp.netPay.toFixed(2),
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-${format(selectedPayPeriod.start, 'yyyy-MM-dd')}-to-${format(selectedPayPeriod.end, 'yyyy-MM-dd')}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  }, [employeePayrolls, selectedPayPeriod]);

  return {
    // Core data
    employeePayrolls,
    payrollSummary,
    payrollStats,
    selectedPayPeriod,
    
    // Breakdowns
    departmentPayroll,
    rolePayroll,
    topEarners,
    recentPayPeriods,
    
    // Actions
    setSelectedPayPeriod,
    navigatePayPeriod,
    goToPreviousPeriod,
    goToNextPeriod,
    goToCurrentPeriod,
    exportPayrollData,
    
    // Utilities
    calculateEmployeePayroll,
  };
};
