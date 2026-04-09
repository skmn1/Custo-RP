/**
 * Shift type → colour mapping for the ESS read-only schedule.
 *
 * Colour bar on the left edge of a shift card uses the `bar` hex value.
 * Background, border, and text classes are Tailwind utilities.
 * This mapping mirrors the colour scheme used in the Planning App scheduler
 * grid so employees and managers see identical type colours on both views.
 */
export const SHIFT_TYPE_COLORS = {
  morning: {
    bar:    '#3B82F6',
    bg:     'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text:   'text-blue-900 dark:text-blue-100',
    badge:  'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200',
  },
  evening: {
    bar:    '#8B5CF6',
    bg:     'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    text:   'text-purple-900 dark:text-purple-100',
    badge:  'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200',
  },
  night: {
    bar:    '#1E40AF',
    bg:     'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-700',
    text:   'text-indigo-900 dark:text-indigo-100',
    badge:  'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200',
  },
  day: {
    bar:    '#10B981',
    bg:     'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    text:   'text-green-900 dark:text-green-100',
    badge:  'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200',
  },
  regular: {
    bar:    '#6B7280',
    bg:     'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-600',
    text:   'text-gray-900 dark:text-gray-100',
    badge:  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
  },
};

/** Returns the colour config for a shift type string, falling back to 'regular'. */
export function getShiftColors(shiftType) {
  const key = (shiftType || 'regular').toLowerCase();
  return SHIFT_TYPE_COLORS[key] || SHIFT_TYPE_COLORS.regular;
}
