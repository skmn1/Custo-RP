/**
 * Calculate the duration between two time strings in hours
 * @param {string} startTime - Time in HH:MM format
 * @param {string} endTime - Time in HH:MM format
 * @returns {number} Duration in hours
 */
export const calculateShiftDuration = (startTime, endTime) => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  if (endHour > startHour) {
    return endHour - startHour;
  } else {
    // Handle overnight shifts
    return (24 - startHour) + endHour;
  }
};

/**
 * Generate a unique ID for shifts
 * @returns {string} Unique shift ID
 */
export const generateShiftId = () => `shift${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Check if an employee is working overtime
 * @param {Array} shifts - Array of shifts
 * @param {string} employeeId - Employee ID
 * @param {number} maxHours - Maximum allowed hours
 * @returns {boolean} True if employee is over their max hours
 */
export const isEmployeeOvertime = (shifts, employeeId, maxHours) => {
  const totalHours = shifts
    .filter(shift => shift.employeeId === employeeId)
    .reduce((sum, shift) => sum + shift.duration, 0);
  
  return totalHours > maxHours;
};

/**
 * Get total hours worked by an employee
 * @param {Array} shifts - Array of shifts
 * @param {string} employeeId - Employee ID
 * @returns {number} Total hours worked
 */
export const getEmployeeTotalHours = (shifts, employeeId) => {
  return shifts
    .filter(shift => shift.employeeId === employeeId)
    .reduce((sum, shift) => sum + shift.duration, 0);
};

/**
 * Get shifts for a specific employee and day
 * @param {Array} shifts - Array of shifts
 * @param {string} employeeId - Employee ID
 * @param {number} day - Day index (0-6)
 * @returns {Array} Filtered shifts
 */
export const getShiftsForEmployeeAndDay = (shifts, employeeId, day) => {
  return shifts.filter(shift => 
    shift.employeeId === employeeId && shift.day === day
  );
};

/**
 * Get all shifts for a specific employee
 * @param {Array} shifts - Array of shifts
 * @param {string} employeeId - Employee ID
 * @returns {Array} Filtered shifts
 */
export const getShiftsForEmployee = (shifts, employeeId) => {
  return shifts.filter(shift => shift.employeeId === employeeId);
};
