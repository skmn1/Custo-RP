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

// Holiday dates for the year
export const holidays = [
  '2025-01-01', // New Year's Day
  '2025-07-04', // Independence Day
  '2025-12-25', // Christmas
  '2025-11-28', // Thanksgiving (example)
  // Add more holidays as needed
];

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
