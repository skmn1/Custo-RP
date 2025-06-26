// Historical shifts data for payroll testing (May & June 2025)
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';

// Generate realistic shift patterns for May and June 2025
export const generateHistoricalShifts = () => {
  const shifts = [];
  let shiftId = 1;

  // Define May 2025 (month 4, since months are 0-indexed)
  const mayStart = startOfMonth(new Date(2025, 4, 1)); // May 1, 2025
  const mayEnd = endOfMonth(new Date(2025, 4, 1)); // May 31, 2025
  
  // Define June 2025 (month 5)
  const juneStart = startOfMonth(new Date(2025, 5, 1)); // June 1, 2025
  const juneEnd = endOfMonth(new Date(2025, 5, 1)); // June 30, 2025

  const mayDays = eachDayOfInterval({ start: mayStart, end: mayEnd });
  const juneDays = eachDayOfInterval({ start: juneStart, end: juneEnd });
  
  // All employees from employees.js
  const employees = [
    { id: 'emp1', role: 'Doctor', department: 'ICU' },
    { id: 'emp2', role: 'Senior Nurse', department: 'Emergency' },
    { id: 'emp3', role: 'Nurse', department: 'Pediatrics' },
    { id: 'emp4', role: 'Technician', department: 'Radiology' },
    { id: 'emp5', role: 'Administrator', department: 'Administration' },
    { id: 'emp6', role: 'Doctor', department: 'Surgery' },
    { id: 'emp7', role: 'Nurse', department: 'ICU' },
    { id: 'emp8', role: 'Technician', department: 'Laboratory' },
    { id: 'emp9', role: 'Senior Nurse', department: 'Emergency' },
    { id: 'emp10', role: 'Radiologist', department: 'Radiology' },
  ];

  // Shift patterns by role
  const shiftPatterns = {
    'Doctor': [
      { startTime: '07:00', endTime: '19:00', duration: 12, type: 'Day', frequency: 3 }, // 3 days a week
      { startTime: '19:00', endTime: '07:00', duration: 12, type: 'Night', frequency: 1 }, // 1 night shift
    ],
    'Senior Nurse': [
      { startTime: '06:00', endTime: '18:00', duration: 12, type: 'Day', frequency: 3 },
      { startTime: '18:00', endTime: '06:00', duration: 12, type: 'Night', frequency: 2 },
    ],
    'Nurse': [
      { startTime: '06:00', endTime: '14:00', duration: 8, type: 'Morning', frequency: 3 },
      { startTime: '14:00', endTime: '22:00', duration: 8, type: 'Evening', frequency: 2 },
      { startTime: '22:00', endTime: '06:00', duration: 8, type: 'Night', frequency: 1 },
    ],
    'Technician': [
      { startTime: '08:00', endTime: '16:00', duration: 8, type: 'Day', frequency: 5 },
      { startTime: '16:00', endTime: '00:00', duration: 8, type: 'Evening', frequency: 1 },
    ],
    'Administrator': [
      { startTime: '09:00', endTime: '17:00', duration: 8, type: 'Office', frequency: 5 },
    ],
    'Radiologist': [
      { startTime: '08:00', endTime: '18:00', duration: 10, type: 'Day', frequency: 4 },
      { startTime: '18:00', endTime: '22:00', duration: 4, type: 'Evening', frequency: 2 },
    ],
  };

  // Generate shifts for each month
  [mayDays, juneDays].forEach((monthDays, monthIndex) => {
    const monthName = monthIndex === 0 ? 'May' : 'June';
    
    employees.forEach((employee) => {
      const patterns = shiftPatterns[employee.role] || [];
      let dayIndex = 0;
      
      monthDays.forEach((date, dateIndex) => {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = checkIfHoliday(date);
        
        // Skip some days to create realistic schedules (not everyone works every day)
        const workProbability = isWeekend ? 0.3 : 0.7; // Lower chance on weekends
        if (Math.random() > workProbability && !isHoliday) return;
        
        // Select pattern based on day rotation
        const patternIndex = dayIndex % patterns.length;
        const pattern = patterns[patternIndex];
        
        if (!pattern) return;
        
        // Add some overtime scenarios
        let actualDuration = pattern.duration;
        let shiftType = pattern.type;
        
        // 15% chance of overtime
        if (Math.random() < 0.15) {
          actualDuration += Math.floor(Math.random() * 4) + 1; // 1-4 hours overtime
          shiftType = `${pattern.type} (OT)`;
        }
        
        // Weekend/Holiday premiums
        if (isWeekend) {
          shiftType = `Weekend ${pattern.type}`;
        }
        if (isHoliday) {
          shiftType = `Holiday ${pattern.type}`;
        }
        
        // Calculate end time based on actual duration
        const endTime = calculateEndTime(pattern.startTime, actualDuration);
        
        shifts.push({
          id: `hist_shift_${shiftId++}`,
          employeeId: employee.id,
          date: format(date, 'yyyy-MM-dd'),
          startTime: pattern.startTime,
          endTime: endTime,
          duration: actualDuration,
          type: shiftType,
          department: employee.department,
          month: monthName,
          isWeekend,
          isHoliday,
          hasOvertime: actualDuration > pattern.duration,
        });
        
        dayIndex++;
      });
    });
  });

  return shifts;
};

// Helper function to check if a date is a holiday
const checkIfHoliday = (date) => {
  const holidays = [
    '2025-05-26', // Memorial Day (last Monday in May)
    '2025-06-19', // Juneteenth
  ];
  return holidays.includes(format(date, 'yyyy-MM-dd'));
};

// Helper function to calculate end time
const calculateEndTime = (startTime, duration) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
  
  return format(endDate, 'HH:mm');
};

// Payroll periods for May and June 2025
export const historicalPayPeriods = [
  // May 2025 periods (bi-weekly)
  {
    id: 'may_period_1',
    start: new Date(2025, 4, 1), // May 1
    end: new Date(2025, 4, 14), // May 14
    processed: true,
    totalGrossPay: 245680.50,
    totalNetPay: 184260.38,
    totalHours: 3420.5,
    employeeCount: 10,
  },
  {
    id: 'may_period_2',
    start: new Date(2025, 4, 15), // May 15
    end: new Date(2025, 4, 31), // May 31
    processed: true,
    totalGrossPay: 267890.25,
    totalNetPay: 201042.69,
    totalHours: 3680.25,
    employeeCount: 10,
  },
  // June 2025 periods (bi-weekly)
  {
    id: 'june_period_1',
    start: new Date(2025, 5, 1), // June 1
    end: new Date(2025, 5, 14), // June 14
    processed: true,
    totalGrossPay: 258750.75,
    totalNetPay: 194063.06,
    totalHours: 3580.75,
    employeeCount: 10,
  },
  {
    id: 'june_period_2',
    start: new Date(2025, 5, 15), // June 15
    end: new Date(2025, 5, 30), // June 30
    processed: true,
    totalGrossPay: 251340.00,
    totalNetPay: 188505.00,
    totalHours: 3520.0,
    employeeCount: 10,
  },
];

// Employee performance metrics for the period
export const historicalEmployeeMetrics = {
  'emp1': { // Doctor
    mayHours: 164.5,
    juneHours: 168.0,
    overtimeHours: 24.5,
    avgHourlyRate: 85.00,
    totalGrossPay: 28372.50,
  },
  'emp2': { // Senior Nurse
    mayHours: 172.0,
    juneHours: 176.5,
    overtimeHours: 32.5,
    avgHourlyRate: 35.00,
    totalGrossPay: 12197.50,
  },
  'emp3': { // Nurse
    mayHours: 158.0,
    juneHours: 162.5,
    overtimeHours: 20.5,
    avgHourlyRate: 28.00,
    totalGrossPay: 8974.00,
  },
  'emp4': { // Technician
    mayHours: 160.0,
    juneHours: 160.0,
    overtimeHours: 0.0,
    avgHourlyRate: 22.00,
    totalGrossPay: 7040.00,
  },
  'emp5': { // Administrator
    mayHours: 160.0,
    juneHours: 160.0,
    overtimeHours: 0.0,
    avgHourlyRate: 25.00,
    totalGrossPay: 8000.00,
  },
  'emp6': { // Doctor
    mayHours: 156.0,
    juneHours: 164.0,
    overtimeHours: 20.0,
    avgHourlyRate: 85.00,
    totalGrossPay: 27200.00,
  },
  'emp7': { // Nurse
    mayHours: 168.5,
    juneHours: 172.0,
    overtimeHours: 28.5,
    avgHourlyRate: 28.00,
    totalGrossPay: 9534.00,
  },
  'emp8': { // Technician
    mayHours: 152.0,
    juneHours: 156.0,
    overtimeHours: 8.0,
    avgHourlyRate: 22.00,
    totalGrossPay: 6776.00,
  },
  'emp9': { // Senior Nurse
    mayHours: 176.0,
    juneHours: 180.0,
    overtimeHours: 36.0,
    avgHourlyRate: 35.00,
    totalGrossPay: 12460.00,
  },
  'emp10': { // Radiologist
    mayHours: 148.0,
    juneHours: 152.0,
    overtimeHours: 12.0,
    avgHourlyRate: 75.00,
    totalGrossPay: 22500.00,
  },
};

// Department cost centers for tracking
export const departmentCostCenters = {
  'ICU': {
    budgetedHours: 2000,
    actualHours: 2156,
    budgetedCost: 120000,
    actualCost: 134875,
    variance: 14875,
    variancePercentage: 12.4,
  },
  'Emergency': {
    budgetedHours: 1800,
    actualHours: 1923,
    budgetedCost: 95000,
    actualCost: 102340,
    variance: 7340,
    variancePercentage: 7.7,
  },
  'Surgery': {
    budgetedHours: 1200,
    actualHours: 1189,
    budgetedCost: 85000,
    actualCost: 83567,
    variance: -1433,
    variancePercentage: -1.7,
  },
  'Pediatrics': {
    budgetedHours: 1000,
    actualHours: 1045,
    budgetedCost: 45000,
    actualCost: 47230,
    variance: 2230,
    variancePercentage: 5.0,
  },
  'Radiology': {
    budgetedHours: 800,
    actualHours: 856,
    budgetedCost: 65000,
    actualCost: 68945,
    variance: 3945,
    variancePercentage: 6.1,
  },
  'Laboratory': {
    budgetedHours: 600,
    actualHours: 612,
    budgetedCost: 25000,
    actualCost: 25680,
    variance: 680,
    variancePercentage: 2.7,
  },
  'Administration': {
    budgetedHours: 400,
    actualHours: 400,
    budgetedCost: 18000,
    actualCost: 18000,
    variance: 0,
    variancePercentage: 0.0,
  },
};

export default {
  generateHistoricalShifts,
  historicalPayPeriods,
  historicalEmployeeMetrics,
  departmentCostCenters,
};
