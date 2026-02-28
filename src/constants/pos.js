export const POS_TYPES = ['BUTCHER', 'GROCERY', 'FAST_FOOD', 'MIXED'];

export const POS_TYPE_LABELS = {
  BUTCHER: 'Butcher',
  GROCERY: 'Grocery',
  FAST_FOOD: 'Fast Food',
  MIXED: 'Mixed',
};

export const POS_TYPE_COLORS = {
  BUTCHER: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  GROCERY: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  FAST_FOOD: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  MIXED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
};

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const DEFAULT_OPENING_HOURS = {
  monday: { open: '08:00', close: '20:00', closed: false },
  tuesday: { open: '08:00', close: '20:00', closed: false },
  wednesday: { open: '08:00', close: '20:00', closed: false },
  thursday: { open: '08:00', close: '20:00', closed: false },
  friday: { open: '08:00', close: '22:00', closed: false },
  saturday: { open: '09:00', close: '18:00', closed: false },
  sunday: { open: null, close: null, closed: true },
};
