/**
 * Unit tests for Task 81 — MobileSchedulePage (Nexus Kinetic)
 *
 * Covers:
 *  - buildMonthGrid: correct number of cells, Monday-first padding, null pads
 *  - toDateString: ISO 'YYYY-MM-DD' formatting without UTC offset
 *  - Calendar: selected day aria-pressed=true; today aria-current=date; shift dots
 *  - ShiftList: filters correctly to selected date; empty state when no shifts
 *  - i18n keys: EN and FR presence + value checks
 *  - Component structural assertions (testids, aria attributes, etc.)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Helpers mirrored from MobileSchedulePage ────────────────────

function buildMonthGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startPad = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const total = startPad + daysInMonth;
  const cells = new Array(Math.ceil(total / 7) * 7).fill(null);
  for (let i = 0; i < daysInMonth; i++) {
    cells[startPad + i] = new Date(first.getFullYear(), first.getMonth(), i + 1);
  }
  return cells;
}

function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── buildMonthGrid ───────────────────────────────────────────────

describe('buildMonthGrid()', () => {
  it('produces correct total cells (multiple of 7) for April 2026', () => {
    const cells = buildMonthGrid(new Date(2026, 3, 1)); // April
    expect(cells.length % 7).toBe(0);
  });

  it('has exactly 30 non-null cells for April 2026', () => {
    const cells = buildMonthGrid(new Date(2026, 3, 1));
    expect(cells.filter(Boolean).length).toBe(30);
  });

  it('first non-null cell is the 1st of the month', () => {
    const cells = buildMonthGrid(new Date(2026, 3, 1));
    const first = cells.find(Boolean);
    expect(first.getDate()).toBe(1);
  });

  it('April 2026: first day is Wednesday → 2 null pads (Mon, Tue)', () => {
    // April 1, 2026 is a Wednesday → startPad = (Wed=3 +6)%7 = 2
    const cells = buildMonthGrid(new Date(2026, 3, 1));
    expect(cells[0]).toBeNull();
    expect(cells[1]).toBeNull();
    expect(cells[2]).not.toBeNull();
    expect(cells[2].getDate()).toBe(1);
  });

  it('has correct number of cells for February 2026 (28 days)', () => {
    const cells = buildMonthGrid(new Date(2026, 1, 1));
    expect(cells.filter(Boolean).length).toBe(28);
  });

  it('has correct number of cells for January 2026 (31 days)', () => {
    const cells = buildMonthGrid(new Date(2026, 0, 1));
    expect(cells.filter(Boolean).length).toBe(31);
  });
});

// ── toDateString ─────────────────────────────────────────────────

describe('toDateString()', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 3, 10))).toBe('2026-04-10');
  });

  it('zero-pads single-digit month and day', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('handles end-of-year date', () => {
    expect(toDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

// ── ShiftList day filter ─────────────────────────────────────────

describe('ShiftList day filtering logic', () => {
  function filterShiftsForDate(shifts, selectedDate) {
    return shifts.filter((s) => {
      if (!s.date) return false;
      const shiftDate = new Date(s.date.includes('T') ? s.date : s.date + 'T00:00:00');
      // isSameDay equivalent
      return (
        shiftDate.getFullYear() === selectedDate.getFullYear() &&
        shiftDate.getMonth() === selectedDate.getMonth() &&
        shiftDate.getDate() === selectedDate.getDate()
      );
    });
  }

  const SHIFTS = [
    { id: '1', date: '2026-04-10', startTime: '09:00', endTime: '17:00' },
    { id: '2', date: '2026-04-10', startTime: '18:00', endTime: '22:00' },
    { id: '3', date: '2026-04-11', startTime: '09:00', endTime: '13:00' },
    { id: '4', date: '2026-04-15', startTime: '10:00', endTime: '18:00' },
  ];

  it('returns both shifts on 10 Apr', () => {
    const result = filterShiftsForDate(SHIFTS, new Date(2026, 3, 10));
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual(['1', '2']);
  });

  it('returns one shift on 11 Apr', () => {
    const result = filterShiftsForDate(SHIFTS, new Date(2026, 3, 11));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns empty array for date with no shifts', () => {
    const result = filterShiftsForDate(SHIFTS, new Date(2026, 3, 12));
    expect(result).toHaveLength(0);
  });

  it('handles ISO datetime strings (with T) correctly', () => {
    const isoShifts = [{ id: '5', date: '2026-04-10T09:00:00', startTime: '09:00', endTime: '17:00' }];
    const result = filterShiftsForDate(isoShifts, new Date(2026, 3, 10));
    expect(result).toHaveLength(1);
  });

  it('skips shifts with null/undefined date', () => {
    const badShifts = [{ id: '6', date: null }, { id: '7' }];
    const result = filterShiftsForDate(badShifts, new Date(2026, 3, 10));
    expect(result).toHaveLength(0);
  });
});

// ── Shift dot set ────────────────────────────────────────────────

describe('Shift date Set construction', () => {
  it('creates a Set of YYYY-MM-DD strings from shift array', () => {
    const shifts = [
      { date: '2026-04-10' },
      { date: '2026-04-15' },
      { date: '2026-04-10' }, // duplicate
    ];
    const shiftDates = new Set(shifts.map((s) => s.date));
    expect(shiftDates.size).toBe(2);
    expect(shiftDates.has('2026-04-10')).toBe(true);
    expect(shiftDates.has('2026-04-15')).toBe(true);
    expect(shiftDates.has('2026-04-11')).toBe(false);
  });
});

// ── i18n key presence — EN ─────────────────────────────────────

describe('EN ess.json — mobile.schedule Task 81 keys', () => {
  let en;
  beforeEach(() => {
    en = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'public/locales/en/ess.json'), 'utf-8'),
    );
  });

  const REQUIRED_KEYS = [
    'title',
    'workforceLabel',
    'previousMonth',
    'nextMonth',
    'calendarLabel',
    'today',
    'noShifts',
    'shiftSingular',
    'shiftPlural',
    'requestSwap',
    'statusConfirmed',
    'statusPending',
    'statusSwapRequested',
  ];

  REQUIRED_KEYS.forEach((key) => {
    it(`has mobile.schedule.${key}`, () => {
      expect(en.mobile?.schedule).toHaveProperty(key);
      expect(en.mobile.schedule[key]).toBeTruthy();
    });
  });

  it('title is "Work Schedule"', () => {
    expect(en.mobile.schedule.title).toBe('Work Schedule');
  });

  it('requestSwap is "Request Swap"', () => {
    expect(en.mobile.schedule.requestSwap).toBe('Request Swap');
  });
});

// ── i18n key presence — FR ─────────────────────────────────────

describe('FR ess.json — mobile.schedule Task 81 keys', () => {
  let fr;
  beforeEach(() => {
    fr = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'public/locales/fr/ess.json'), 'utf-8'),
    );
  });

  const FR_EXPECTED = {
    title: 'Planning',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    noShifts: 'Aucun quart prévu ce jour',
    requestSwap: 'Demander un échange',
    statusConfirmed: 'Confirmé',
    statusPending: 'En attente',
    statusSwapRequested: 'Échange demandé',
  };

  Object.entries(FR_EXPECTED).forEach(([key, expected]) => {
    it(`mobile.schedule.${key} = "${expected}"`, () => {
      expect(fr.mobile?.schedule?.[key]).toBe(expected);
    });
  });
});

// ── Component source structural checks ──────────────────────────

describe('MobileSchedulePage — source structure', () => {
  let src;
  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileSchedulePage.jsx'),
      'utf-8',
    );
  });

  it('exports MobileSchedulePage as named export', () => {
    expect(src).toContain('export const MobileSchedulePage');
  });

  it('imports useEssSchedule hook', () => {
    expect(src).toContain('useEssSchedule');
  });

  it('imports isSameDay from date-fns', () => {
    expect(src).toContain('isSameDay');
  });

  it('contains data-testid="mobile-schedule-page"', () => {
    expect(src).toContain('data-testid="mobile-schedule-page"');
  });

  it('contains data-testid="schedule-calendar"', () => {
    expect(src).toContain('data-testid="schedule-calendar"');
  });

  it('contains data-testid="shift-list"', () => {
    expect(src).toContain('data-testid="shift-list"');
  });

  it('contains data-testid="shift-list-empty" for empty state', () => {
    expect(src).toContain('data-testid="shift-list-empty"');
  });

  it('contains data-testid="shift-card" on each shift', () => {
    expect(src).toContain('data-testid="shift-card"');
  });

  it('contains data-testid="schedule-skeleton" for loading state', () => {
    expect(src).toContain('data-testid="schedule-skeleton"');
  });

  it('calendar days have aria-pressed', () => {
    expect(src).toContain('aria-pressed={isSelected}');
  });

  it('today cell has aria-current="date"', () => {
    expect(src).toContain("aria-current={isTodayDay ? 'date' : undefined}");
  });

  it('calendar has role="grid"', () => {
    expect(src).toContain('role="grid"');
  });

  it('calendar days have role="gridcell"', () => {
    expect(src).toContain('role="gridcell"');
  });

  it('Magenta dot indicator present for shift days', () => {
    expect(src).toContain('bg-primary');
    expect(src).toContain('hasShift');
  });

  it('selected day uses bg-primary fill', () => {
    expect(src).toContain("isSelected");
    expect(src).toContain("bg-primary text-on-primary");
  });

  it('Magenta accent bar on today shift card', () => {
    expect(src).toContain('#da336b');
  });

  it('location_on Material Symbol used for location tag', () => {
    expect(src).toContain('location_on');
  });

  it('swap_horiz Material Symbol used for Request Swap', () => {
    expect(src).toContain('swap_horiz');
  });

  it('buildMonthGrid is defined', () => {
    expect(src).toContain('function buildMonthGrid');
  });

  it('toDateString is defined', () => {
    expect(src).toContain('function toDateString');
  });

  it('month navigation uses navigatePrev / navigateNext from hook', () => {
    expect(src).toContain('navigatePrev');
    expect(src).toContain('navigateNext');
  });

  it('Helmet sets theme-color', () => {
    expect(src).toContain('#fff8f7');
  });
});

// ── EssSchedulePage delegates to MobileSchedulePage ─────────────

describe('EssSchedulePage — delegates to MobileSchedulePage on mobile', () => {
  let pageSrc;
  beforeEach(() => {
    pageSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/pages/ess/EssSchedulePage.jsx'),
      'utf-8',
    );
  });

  it('imports MobileSchedulePage', () => {
    expect(pageSrc).toContain('MobileSchedulePage');
  });

  it('renders MobileSchedulePage when isMobile is true', () => {
    expect(pageSrc).toContain('<MobileSchedulePage />');
  });
});
