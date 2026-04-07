import { format, startOfWeek, addDays } from 'date-fns';

/**
 * Map day name to date-fns weekStartsOn index (0=Sun, 1=Mon, ... 6=Sat)
 */
const WEEK_START_MAP = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

/**
 * Generate week days array starting from the configured day
 * @param {Date} currentWeek - Current week date
 * @param {string} [weekStartDay='monday'] - Day name the week starts on
 * @returns {Array} Array of Date objects for the week
 */
export const generateWeekDays = (currentWeek, weekStartDay = 'monday') => {
  const weekStartsOn = WEEK_START_MAP[weekStartDay] ?? 1;
  const weekStart = startOfWeek(currentWeek, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

/**
 * Calculate week number of the year
 * @param {Date} date - Date to calculate week number for
 * @returns {number} Week number
 */
export const getWeekNumber = (date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return Math.ceil(
    (weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  );
};

/**
 * Format week range string
 * @param {Date} weekStart - Start of the week
 * @returns {string} Formatted week range
 */
export const formatWeekRange = (weekStart) => {
  const weekEnd = addDays(weekStart, 6);
  return `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
};

/**
 * Navigate to a different week
 * @param {Date} currentWeek - Current week date
 * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
 * @returns {Date} New week date
 */
export const navigateWeek = (currentWeek, direction) => {
  const newWeek = new Date(currentWeek);
  newWeek.setDate(newWeek.getDate() + (direction * 7));
  return newWeek;
};
