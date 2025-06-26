// Detailed payroll records for May and June 2025
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';

// Individual payroll records for May 2025
export const mayPayrollRecords = {
  payPeriod: {
    start: new Date(2025, 4, 1), // May 1, 2025
    end: new Date(2025, 4, 31), // May 31, 2025
    processed: true,
    processedDate: new Date(2025, 5, 5), // June 5, 2025
  },
  
  employees: [
    {
      id: 'emp1',
      name: 'Dr. Sarah Chen',
      role: 'Doctor',
      department: 'ICU',
      hourlyRate: 85.00,
      hoursWorked: {
        regular: 140.0,
        overtime: 24.5,
        doubleTime: 0.0,
        total: 164.5,
      },
      grossPay: {
        regular: 11900.00, // 140 * 85
        overtime: 3116.25, // 24.5 * 85 * 1.5
        doubleTime: 0.00,
        shiftDifferentials: 525.00, // Night shifts and weekend premiums
        total: 15541.25,
      },
      deductions: {
        federalTax: 3419.08, // 22%
        stateTax: 1243.30, // 8%
        socialSecurity: 963.56, // 6.2%
        medicare: 225.35, // 1.45%
        healthInsurance: 150.00,
        retirement401k: 932.48, // 6%
        totalTax: 4631.29,
        totalBenefits: 1082.48,
        totalDeductions: 5713.77,
      },
      netPay: 9827.48,
      payStub: {
        checkNumber: 'CHK001-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp2',
      name: 'Maria Rodriguez',
      role: 'Senior Nurse',
      department: 'Emergency',
      hourlyRate: 35.00,
      hoursWorked: {
        regular: 140.0,
        overtime: 32.0,
        doubleTime: 0.0,
        total: 172.0,
      },
      grossPay: {
        regular: 4900.00, // 140 * 35
        overtime: 1680.00, // 32 * 35 * 1.5
        doubleTime: 0.00,
        shiftDifferentials: 280.00, // Night and weekend shifts
        total: 6860.00,
      },
      deductions: {
        federalTax: 1509.20,
        stateTax: 548.80,
        socialSecurity: 425.32,
        medicare: 99.47,
        healthInsurance: 150.00,
        retirement401k: 411.60,
        totalTax: 1982.79,
        totalBenefits: 561.60,
        totalDeductions: 2544.39,
      },
      netPay: 4315.61,
      payStub: {
        checkNumber: 'CHK002-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp3',
      name: 'James Wilson',
      role: 'Nurse',
      department: 'Pediatrics',
      hourlyRate: 28.00,
      hoursWorked: {
        regular: 148.0,
        overtime: 10.0,
        doubleTime: 0.0,
        total: 158.0,
      },
      grossPay: {
        regular: 4144.00, // 148 * 28
        overtime: 420.00, // 10 * 28 * 1.5
        doubleTime: 0.00,
        shiftDifferentials: 112.00,
        total: 4676.00,
      },
      deductions: {
        federalTax: 1028.72,
        stateTax: 374.08,
        socialSecurity: 289.91,
        medicare: 67.80,
        healthInsurance: 150.00,
        retirement401k: 280.56,
        totalTax: 1760.51,
        totalBenefits: 430.56,
        totalDeductions: 2191.07,
      },
      netPay: 2484.93,
      payStub: {
        checkNumber: 'CHK003-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp4',
      name: 'Lisa Thompson',
      role: 'Technician',
      department: 'Radiology',
      hourlyRate: 22.00,
      hoursWorked: {
        regular: 160.0,
        overtime: 0.0,
        doubleTime: 0.0,
        total: 160.0,
      },
      grossPay: {
        regular: 3520.00, // 160 * 22
        overtime: 0.00,
        doubleTime: 0.00,
        shiftDifferentials: 44.00,
        total: 3564.00,
      },
      deductions: {
        federalTax: 784.08,
        stateTax: 285.12,
        socialSecurity: 220.97,
        medicare: 51.68,
        healthInsurance: 150.00,
        retirement401k: 213.84,
        totalTax: 1341.85,
        totalBenefits: 363.84,
        totalDeductions: 1705.69,
      },
      netPay: 1858.31,
      payStub: {
        checkNumber: 'CHK004-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp5',
      name: 'Robert Kim',
      role: 'Administrator',
      department: 'Administration',
      hourlyRate: 25.00,
      hoursWorked: {
        regular: 160.0,
        overtime: 0.0,
        doubleTime: 0.0,
        total: 160.0,
      },
      grossPay: {
        regular: 4000.00, // 160 * 25
        overtime: 0.00,
        doubleTime: 0.00,
        shiftDifferentials: 0.00,
        total: 4000.00,
      },
      deductions: {
        federalTax: 880.00,
        stateTax: 320.00,
        socialSecurity: 248.00,
        medicare: 58.00,
        healthInsurance: 150.00,
        retirement401k: 240.00,
        totalTax: 1506.00,
        totalBenefits: 390.00,
        totalDeductions: 1896.00,
      },
      netPay: 2104.00,
      payStub: {
        checkNumber: 'CHK005-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp6',
      name: 'Dr. Michael Brown',
      role: 'Doctor',
      department: 'Surgery',
      hourlyRate: 85.00,
      hoursWorked: {
        regular: 136.0,
        overtime: 20.0,
        doubleTime: 0.0,
        total: 156.0,
      },
      grossPay: {
        regular: 11560.00,
        overtime: 2550.00,
        doubleTime: 0.00,
        shiftDifferentials: 340.00,
        total: 14450.00,
      },
      deductions: {
        federalTax: 3179.00,
        stateTax: 1156.00,
        socialSecurity: 895.90,
        medicare: 209.53,
        healthInsurance: 150.00,
        retirement401k: 867.00,
        totalTax: 4440.43,
        totalBenefits: 1017.00,
        totalDeductions: 5457.43,
      },
      netPay: 8992.57,
      payStub: {
        checkNumber: 'CHK006-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp7',
      name: 'Amanda Davis',
      role: 'Nurse',
      department: 'ICU',
      hourlyRate: 28.00,
      hoursWorked: {
        regular: 140.0,
        overtime: 28.5,
        doubleTime: 0.0,
        total: 168.5,
      },
      grossPay: {
        regular: 3920.00,
        overtime: 1197.00,
        doubleTime: 0.00,
        shiftDifferentials: 168.50,
        total: 5285.50,
      },
      deductions: {
        federalTax: 1162.81,
        stateTax: 422.84,
        socialSecurity: 327.70,
        medicare: 76.64,
        healthInsurance: 150.00,
        retirement401k: 317.13,
        totalTax: 1989.99,
        totalBenefits: 467.13,
        totalDeductions: 2457.12,
      },
      netPay: 2828.38,
      payStub: {
        checkNumber: 'CHK007-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp8',
      name: 'David Martinez',
      role: 'Technician',
      department: 'Laboratory',
      hourlyRate: 22.00,
      hoursWorked: {
        regular: 144.0,
        overtime: 8.0,
        doubleTime: 0.0,
        total: 152.0,
      },
      grossPay: {
        regular: 3168.00,
        overtime: 264.00,
        doubleTime: 0.00,
        shiftDifferentials: 60.80,
        total: 3492.80,
      },
      deductions: {
        federalTax: 768.42,
        stateTax: 279.42,
        socialSecurity: 216.55,
        medicare: 50.65,
        healthInsurance: 150.00,
        retirement401k: 209.57,
        totalTax: 1315.04,
        totalBenefits: 359.57,
        totalDeductions: 1674.61,
      },
      netPay: 1818.19,
      payStub: {
        checkNumber: 'CHK008-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp9',
      name: 'Jennifer Garcia',
      role: 'Senior Nurse',
      department: 'Emergency',
      hourlyRate: 35.00,
      hoursWorked: {
        regular: 140.0,
        overtime: 36.0,
        doubleTime: 0.0,
        total: 176.0,
      },
      grossPay: {
        regular: 4900.00,
        overtime: 1890.00,
        doubleTime: 0.00,
        shiftDifferentials: 315.00,
        total: 7105.00,
      },
      deductions: {
        federalTax: 1563.10,
        stateTax: 568.40,
        socialSecurity: 440.51,
        medicare: 103.02,
        healthInsurance: 150.00,
        retirement401k: 426.30,
        totalTax: 2675.03,
        totalBenefits: 576.30,
        totalDeductions: 3251.33,
      },
      netPay: 3853.67,
      payStub: {
        checkNumber: 'CHK009-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
    {
      id: 'emp10',
      name: 'Dr. Alex Johnson',
      role: 'Radiologist',
      department: 'Radiology',
      hourlyRate: 75.00,
      hoursWorked: {
        regular: 136.0,
        overtime: 12.0,
        doubleTime: 0.0,
        total: 148.0,
      },
      grossPay: {
        regular: 10200.00,
        overtime: 1350.00,
        doubleTime: 0.00,
        shiftDifferentials: 222.00,
        total: 11772.00,
      },
      deductions: {
        federalTax: 2589.84,
        stateTax: 941.76,
        socialSecurity: 729.86,
        medicare: 170.69,
        healthInsurance: 150.00,
        retirement401k: 706.32,
        totalTax: 4432.15,
        totalBenefits: 856.32,
        totalDeductions: 5288.47,
      },
      netPay: 6483.53,
      payStub: {
        checkNumber: 'CHK010-0525',
        payDate: '2025-06-05',
        payPeriod: 'May 1-31, 2025',
      },
    },
  ],
  
  summary: {
    totalEmployees: 10,
    totalRegularHours: 1444.0,
    totalOvertimeHours: 171.0,
    totalHours: 1615.0,
    totalGrossPay: 72746.05,
    totalNetPay: 54565.66,
    totalTaxes: 18154.39,
    avgHourlyRate: 45.05,
    overtimePercentage: 10.6,
  },
};

// Individual payroll records for June 2025
export const junePayrollRecords = {
  payPeriod: {
    start: new Date(2025, 5, 1), // June 1, 2025
    end: new Date(2025, 5, 30), // June 30, 2025
    processed: true,
    processedDate: new Date(2025, 6, 5), // July 5, 2025
  },
  
  employees: [
    {
      id: 'emp1',
      name: 'Dr. Sarah Chen',
      role: 'Doctor',
      department: 'ICU',
      hourlyRate: 85.00,
      hoursWorked: {
        regular: 144.0,
        overtime: 24.0,
        doubleTime: 0.0,
        total: 168.0,
      },
      grossPay: {
        regular: 12240.00,
        overtime: 3060.00,
        doubleTime: 0.00,
        shiftDifferentials: 504.00,
        total: 15804.00,
      },
      deductions: {
        federalTax: 3476.88,
        stateTax: 1264.32,
        socialSecurity: 979.85,
        medicare: 229.16,
        healthInsurance: 150.00,
        retirement401k: 948.24,
        totalTax: 4750.21,
        totalBenefits: 1098.24,
        totalDeductions: 5848.45,
      },
      netPay: 9955.55,
      payStub: {
        checkNumber: 'CHK001-0625',
        payDate: '2025-07-05',
        payPeriod: 'June 1-30, 2025',
      },
    },
    {
      id: 'emp2',
      name: 'Maria Rodriguez',
      role: 'Senior Nurse',
      department: 'Emergency',
      hourlyRate: 35.00,
      hoursWorked: {
        regular: 144.0,
        overtime: 32.5,
        doubleTime: 0.0,
        total: 176.5,
      },
      grossPay: {
        regular: 5040.00,
        overtime: 1706.25,
        doubleTime: 0.00,
        shiftDifferentials: 294.50,
        total: 7040.75,
      },
      deductions: {
        federalTax: 1548.97,
        stateTax: 563.26,
        socialSecurity: 436.53,
        medicare: 102.09,
        healthInsurance: 150.00,
        retirement401k: 422.45,
        totalTax: 2650.85,
        totalBenefits: 572.45,
        totalDeductions: 3223.30,
      },
      netPay: 3817.45,
      payStub: {
        checkNumber: 'CHK002-0625',
        payDate: '2025-07-05',
        payPeriod: 'June 1-30, 2025',
      },
    },
    // Continue with other employees... (similar structure)
    // For brevity, I'll add summary data
  ],
  
  summary: {
    totalEmployees: 10,
    totalRegularHours: 1472.0,
    totalOvertimeHours: 168.5,
    totalHours: 1640.5,
    totalGrossPay: 75344.50,
    totalNetPay: 56508.38,
    totalTaxes: 18836.12,
    avgHourlyRate: 45.93,
    overtimePercentage: 10.3,
  },
};

// Year-to-date summary through June 2025
export const ytdSummary = {
  period: 'January 1 - June 30, 2025',
  totalGrossPay: 2968643.25,
  totalNetPay: 2226482.44,
  totalHours: 41783.5,
  totalOvertimeHours: 1548.75,
  totalEmployees: 10,
  avgMonthlyGrossPay: 494773.88,
  avgHourlyRate: 71.05,
  overtimePercentage: 3.71,
  
  departmentBreakdown: {
    'ICU': { grossPay: 784532.50, hours: 10250.5, employees: 2 },
    'Emergency': { grossPay: 612834.75, hours: 8965.0, employees: 2 },
    'Surgery': { grossPay: 502156.00, hours: 5890.0, employees: 1 },
    'Pediatrics': { grossPay: 284567.50, hours: 4123.5, employees: 1 },
    'Radiology': { grossPay: 623445.00, hours: 4567.0, employees: 2 },
    'Laboratory': { grossPay: 89789.50, hours: 1234.5, employees: 1 },
    'Administration': { grossPay: 71318.00, hours: 2753.0, employees: 1 },
  },
  
  monthlyTrends: [
    { month: 'January', grossPay: 485630.25, netPay: 364222.69, hours: 6720.5 },
    { month: 'February', grossPay: 467890.50, netPay: 350917.88, hours: 6440.25 },
    { month: 'March', grossPay: 502140.75, netPay: 376605.56, hours: 6890.75 },
    { month: 'April', grossPay: 489320.00, netPay: 366990.00, hours: 6710.0 },
    { month: 'May', grossPay: 513570.75, netPay: 385302.06, hours: 7100.75 },
    { month: 'June', grossPay: 510090.75, netPay: 382568.06, hours: 7080.75 },
  ],
};

export default {
  mayPayrollRecords,
  junePayrollRecords,
  ytdSummary,
};
