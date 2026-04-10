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
 * Get shifts for a specific employee and day.
 * Prefers exact date matching (YYYY-MM-DD) when both the shift and the
 * caller provide a date string; falls back to day-index matching for
 * legacy/seed data that has no date field.
 *
 * @param {Array}  shifts     - Array of shifts
 * @param {string} employeeId - Employee ID
 * @param {number} day        - Day index (0-6)
 * @param {string} [dateStr]  - ISO date string for the column being rendered (yyyy-MM-dd)
 * @returns {Array} Filtered shifts
 */
export const getShiftsForEmployeeAndDay = (shifts, employeeId, day, dateStr = null) => {
  return shifts.filter(shift => {
    if (shift.employeeId !== employeeId) return false;
    // Prefer exact date match to avoid showing shifts from other weeks
    if (dateStr && shift.date) return shift.date === dateStr;
    return shift.day === day;
  });
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
