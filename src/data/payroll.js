// Payroll rates and configuration
export const payrollConfig = {
  // Base hourly rates by role
  baseRates: {
    'Doctor': 85.00,
    'Senior Nurse': 35.00,
    'Nurse': 28.00,
    'Technician': 22.00,
    'Administrator': 25.00,
    'Radiologist': 75.00,
  },
  
  // Overtime multipliers
  overtimeMultipliers: {
    standard: 1.5,      // Time and a half for >40 hours
    double: 2.0,        // Double time for >60 hours or holidays
    weekend: 1.25,      // Weekend premium
  },
  
  // Shift differentials (additional hourly rate)
  shiftDifferentials: {
    'Night': 3.00,      // 11 PM - 7 AM
    'Weekend': 2.50,    // Saturday/Sunday
    'Holiday': 5.00,    // Designated holidays
    'Emergency': 4.00,  // Emergency/on-call shifts
  },
  
  // Tax rates (simplified)
  taxRates: {
    federal: 0.22,      // Federal income tax
    state: 0.08,        // State income tax
    socialSecurity: 0.062, // Social Security
    medicare: 0.0145,   // Medicare
    unemployment: 0.006, // Unemployment insurance
  },
  
  // Benefits and deductions
  benefits: {
    healthInsurance: 150.00,     // Monthly
    dentalInsurance: 25.00,      // Monthly
    visionInsurance: 15.00,      // Monthly
    retirement401k: 0.06,        // 6% of gross pay
    lifeInsurance: 20.00,        // Monthly
  },
  
  // Pay periods
  payPeriods: {
    biweekly: 26,       // Pay periods per year
    monthly: 12,
    weekly: 52,
  }
};

// Holiday dates for the year (2025)
export const holidays = [
  '2025-01-01', // New Year's Day
  '2025-01-20', // Martin Luther King Jr. Day
  '2025-02-17', // Presidents' Day
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-11-28', // Day after Thanksgiving
  '2025-12-25', // Christmas
  '2025-12-31', // New Year's Eve
];

// Mock historical payroll data for trend analysis
export const historicalPayrollData = {
  // Monthly summaries for 2025
  monthly: {
    'January': {
      totalGrossPay: 485630.25,
      totalNetPay: 364222.69,
      totalHours: 6720.5,
      overtimeHours: 245.5,
      employeeCount: 10,
      avgHourlyRate: 72.25,
    },
    'February': {
      totalGrossPay: 467890.50,
      totalNetPay: 350917.88,
      totalHours: 6440.25,
      overtimeHours: 198.25,
      employeeCount: 10,
      avgHourlyRate: 72.65,
    },
    'March': {
      totalGrossPay: 502140.75,
      totalNetPay: 376605.56,
      totalHours: 6890.75,
      overtimeHours: 267.75,
      employeeCount: 10,
      avgHourlyRate: 72.85,
    },
    'April': {
      totalGrossPay: 489320.00,
      totalNetPay: 366990.00,
      totalHours: 6710.0,
      overtimeHours: 234.0,
      employeeCount: 10,
      avgHourlyRate: 72.95,
    },
    'May': {
      totalGrossPay: 513570.75,
      totalNetPay: 385302.06,
      totalHours: 7100.75,
      overtimeHours: 289.75,
      employeeCount: 10,
      avgHourlyRate: 73.12,
    },
    'June': {
      totalGrossPay: 510090.75,
      totalNetPay: 382568.06,
      totalHours: 7080.75,
      overtimeHours: 275.75,
      employeeCount: 10,
      avgHourlyRate: 73.08,
    },
  },
  
  // Quarterly trends
  quarterly: {
    'Q1 2025': {
      totalGrossPay: 1455661.50,
      totalNetPay: 1091746.13,
      totalHours: 20051.5,
      overtimeHours: 711.5,
      laborCostRatio: 73.2,
      overtimePercentage: 3.55,
    },
    'Q2 2025': {
      totalGrossPay: 1512981.50,
      totalNetPay: 1134860.12,
      totalHours: 20891.5,
      overtimeHours: 799.5,
      laborCostRatio: 74.1,
      overtimePercentage: 3.83,
    },
  },
  
  // Department historical performance
  departmentTrends: {
    'ICU': {
      monthlyAvgCost: 22479.17,
      monthlyAvgHours: 359.33,
      overtimePercentage: 4.2,
      turnoverRate: 0.05,
    },
    'Emergency': {
      monthlyAvgCost: 17056.67,
      monthlyAvgHours: 320.5,
      overtimePercentage: 5.1,
      turnoverRate: 0.08,
    },
    'Surgery': {
      monthlyAvgCost: 13927.83,
      monthlyAvgHours: 198.17,
      overtimePercentage: 2.8,
      turnoverRate: 0.03,
    },
    'Pediatrics': {
      monthlyAvgCost: 7871.67,
      monthlyAvgHours: 174.17,
      overtimePercentage: 3.2,
      turnoverRate: 0.04,
    },
    'Radiology': {
      monthlyAvgCost: 11490.83,
      monthlyAvgHours: 142.67,
      overtimePercentage: 2.1,
      turnoverRate: 0.02,
    },
    'Laboratory': {
      monthlyAvgCost: 4280.00,
      monthlyAvgHours: 102.0,
      overtimePercentage: 1.8,
      turnoverRate: 0.06,
    },
    'Administration': {
      monthlyAvgCost: 3000.00,
      monthlyAvgHours: 66.67,
      overtimePercentage: 0.5,
      turnoverRate: 0.01,
    },
  },
};

// Payroll budget vs actual tracking
export const budgetTracking = {
  annual: {
    budgetedGrossPay: 5800000,
    actualGrossPay: 2968072.00, // Through June
    variance: -2831928.00,
    variancePercentage: -48.8, // On track (it's only June)
    
    budgetedHours: 82000,
    actualHours: 40943.0,
    hoursVariance: -41057.0,
    hoursVariancePercentage: -50.1, // On track
  },
  
  monthly: {
    'May': {
      budgetedGrossPay: 480000,
      actualGrossPay: 513570.75,
      variance: 33570.75,
      variancePercentage: 7.0,
    },
    'June': {
      budgetedGrossPay: 485000,
      actualGrossPay: 510090.75,
      variance: 25090.75,
      variancePercentage: 5.2,
    },
  },
  
  departmental: {
    'ICU': { budgeted: 240000, actual: 269750, variance: 29750 },
    'Emergency': { budgeted: 190000, actual: 204680, variance: 14680 },
    'Surgery': { budgeted: 170000, actual: 167134, variance: -2866 },
    'Pediatrics': { budgeted: 90000, actual: 94460, variance: 4460 },
    'Radiology': { budgeted: 130000, actual: 137890, variance: 7890 },
    'Laboratory': { budgeted: 50000, actual: 51360, variance: 1360 },
    'Administration': { budgeted: 36000, actual: 36000, variance: 0 },
  },
};

// Compliance and audit data
export const complianceData = {
  taxWithholdings: {
    federal: {
      required: 712345.32,
      withheld: 712345.32,
      remitted: 712345.32,
      compliance: 100.0,
    },
    state: {
      required: 258891.75,
      withheld: 258891.75,
      remitted: 258891.75,
      compliance: 100.0,
    },
    socialSecurity: {
      required: 184061.47,
      withheld: 184061.47,
      remitted: 184061.47,
      compliance: 100.0,
    },
    medicare: {
      required: 43032.05,
      withheld: 43032.05,
      remitted: 43032.05,
      compliance: 100.0,
    },
  },
  
  overtimeCompliance: {
    violations: 0,
    warnings: 3,
    averageOvertimeHours: 27.95,
    maxOvertimeHours: 45.5,
    employeesOverLimit: ['emp2', 'emp9'], // Over 40 hours overtime in a month
  },
  
  benefitsCompliance: {
    eligibleEmployees: 10,
    enrolledEmployees: 10,
    enrollmentRate: 100.0,
    cobra: {
      eligibleEmployees: 0,
      enrolled: 0,
    },
  },
};

// Payroll calculations helper functions
export const calculateOvertimeHours = (totalHours, standardHours = 40) => {
  if (totalHours <= standardHours) return 0;
  return totalHours - standardHours;
};

export const calculateDoubleTimeHours = (totalHours, doubleTimeThreshold = 60) => {
  if (totalHours <= doubleTimeThreshold) return 0;
  return totalHours - doubleTimeThreshold;
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isHoliday = (date) => {
  const dateStr = new Date(date).toISOString().split('T')[0];
  return holidays.includes(dateStr);
};

export const getShiftType = (startTime, endTime, date) => {
  const start = parseInt(startTime.split(':')[0]);
  const end = parseInt(endTime.split(':')[0]);
  
  // Night shift: 11 PM - 7 AM
  if (start >= 23 || end <= 7) return 'Night';
  
  // Weekend shift
  if (isWeekend(date)) return 'Weekend';
  
  // Holiday shift
  if (isHoliday(date)) return 'Holiday';
  
  return 'Regular';
};
