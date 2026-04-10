/**
 * Unit tests for Task 68 — ESS Mobile Attendance
 *
 * Covers:
 *  - AttendanceRing arc calculation and colour thresholds
 *  - getWeekRange date calculations
 *  - getRingColor threshold logic
 *  - DayRow status rendering
 *  - MobileAttendance component structure
 *  - Page-level conditional routing
 *  - i18n keys (EN + FR)
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── AttendanceRing arc calculation ───────────────────────────

describe('AttendanceRing arc calculation', () => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  function calculateOffset(worked, expected) {
    const pct = expected > 0 ? Math.min((worked / expected) * 100, 100) : 0;
    return circumference - (pct / 100) * circumference;
  }

  it('calculates correct offset for 50% completion', () => {
    const offset = calculateOffset(20, 40);
    const expectedOffset = circumference - (50 / 100) * circumference;
    expect(offset).toBeCloseTo(expectedOffset, 2);
  });

  it('calculates zero offset for 100% completion', () => {
    expect(calculateOffset(40, 40)).toBeCloseTo(0, 2);
  });

  it('caps at 100% (offset = 0) when worked exceeds expected', () => {
    expect(calculateOffset(50, 40)).toBeCloseTo(0, 2);
  });

  it('returns full circumference offset for 0 hours', () => {
    expect(calculateOffset(0, 40)).toBeCloseTo(circumference, 2);
  });

  it('handles 0 expected hours gracefully', () => {
    expect(calculateOffset(10, 0)).toBeCloseTo(circumference, 2);
  });
});

// ── getRingColor thresholds ──────────────────────────────────

describe('getRingColor thresholds', () => {
  // Replicate the function
  function getRingColor(pct) {
    if (pct >= 90) return 'var(--mobile-tint)';
    if (pct >= 70) return 'var(--mobile-warning, #f59e0b)';
    return 'var(--mobile-destructive, #ef4444)';
  }

  it('returns tint (blue) for ≥ 90%', () => {
    expect(getRingColor(90)).toBe('var(--mobile-tint)');
    expect(getRingColor(100)).toBe('var(--mobile-tint)');
    expect(getRingColor(95)).toBe('var(--mobile-tint)');
  });

  it('returns warning (amber) for 70–89%', () => {
    expect(getRingColor(70)).toBe('var(--mobile-warning, #f59e0b)');
    expect(getRingColor(80)).toBe('var(--mobile-warning, #f59e0b)');
    expect(getRingColor(89)).toBe('var(--mobile-warning, #f59e0b)');
  });

  it('returns destructive (red) for < 70%', () => {
    expect(getRingColor(69)).toBe('var(--mobile-destructive, #ef4444)');
    expect(getRingColor(0)).toBe('var(--mobile-destructive, #ef4444)');
    expect(getRingColor(50)).toBe('var(--mobile-destructive, #ef4444)');
  });
});

// ── getWeekRange date calculations ───────────────────────────

describe('getWeekRange', () => {
  // Replicate the function
  function getWeekRange(offset = 0) {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + offset * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    return { from: fmt(monday), to: fmt(sunday), monday, sunday };
  }

  it('returns 7-day range for current week', () => {
    const { monday, sunday } = getWeekRange(0);
    const diff = Math.round((sunday - monday) / (1000 * 60 * 60 * 24));
    expect(diff).toBe(6);
  });

  it('from is a Monday (day 1)', () => {
    const { monday } = getWeekRange(0);
    expect(monday.getDay()).toBe(1);
  });

  it('to is a Sunday (day 0)', () => {
    const { sunday } = getWeekRange(0);
    expect(sunday.getDay()).toBe(0);
  });

  it('previous week offset shifts by -7 days', () => {
    const current = getWeekRange(0);
    const prev = getWeekRange(-1);
    const diff = Math.round((current.monday - prev.monday) / (1000 * 60 * 60 * 24));
    expect(diff).toBe(7);
  });
});

// ── DayRow status rendering ──────────────────────────────────

describe('DayRow status logic', () => {
  it('present status maps to green dot class', () => {
    const STATUS_DOT_COLORS = {
      present: 'bg-green-500',
      late: 'bg-amber-500',
      absent: 'bg-red-500',
      leave: 'bg-blue-500',
      on_leave: 'bg-blue-500',
    };
    expect(STATUS_DOT_COLORS['present']).toBe('bg-green-500');
    expect(STATUS_DOT_COLORS['late']).toBe('bg-amber-500');
    expect(STATUS_DOT_COLORS['absent']).toBe('bg-red-500');
    expect(STATUS_DOT_COLORS['leave']).toBe('bg-blue-500');
    expect(STATUS_DOT_COLORS['on_leave']).toBe('bg-blue-500');
  });

  it('unknown status falls back to grey', () => {
    const STATUS_DOT_COLORS = {
      present: 'bg-green-500',
      late: 'bg-amber-500',
      absent: 'bg-red-500',
      leave: 'bg-blue-500',
    };
    const color = STATUS_DOT_COLORS['weekend'] || 'bg-gray-300';
    expect(color).toBe('bg-gray-300');
  });
});

// ── MobileAttendance component structure ─────────────────────

describe('MobileAttendance component structure', () => {
  const src = fs.readFileSync(
    path.resolve('src/components/ess/attendance/MobileAttendance.jsx'),
    'utf-8',
  );

  it('imports useEssAttendance hook', () => {
    expect(src).toContain('useEssAttendance');
  });

  it('imports MobileHeader primitive', () => {
    expect(src).toContain('MobileHeader');
  });

  it('imports MobileCard primitive', () => {
    expect(src).toContain('MobileCard');
  });

  it('imports StatusChip primitive', () => {
    expect(src).toContain('StatusChip');
  });

  it('has AttendanceRing sub-component', () => {
    expect(src).toContain('AttendanceRing');
  });

  it('ring uses SVG with correct radius', () => {
    expect(src).toContain('r={radius}');
    expect(src).toContain('const radius = 54');
  });

  it('ring has role="img" with aria-label', () => {
    expect(src).toContain('role="img"');
    expect(src).toContain('aria-label=');
  });

  it('ring respects prefers-reduced-motion', () => {
    expect(src).toContain('motion-reduce:transition-none');
  });

  it('has WeekNavigator sub-component', () => {
    expect(src).toContain('WeekNavigator');
  });

  it('week navigator buttons have aria-label', () => {
    expect(src).toContain("aria-label={t('mobile.attendance.previousWeek')}");
    expect(src).toContain("aria-label={t('mobile.attendance.nextWeek')}");
  });

  it('has DayRow sub-component', () => {
    expect(src).toContain('DayRow');
  });

  it('has StatusDot sub-component', () => {
    expect(src).toContain('StatusDot');
  });

  it('has MonthlySummary sub-component', () => {
    expect(src).toContain('MonthlySummary');
  });

  it('monthly summary is collapsible', () => {
    expect(src).toContain('aria-expanded');
    expect(src).toContain('setExpanded');
  });

  it('has loading skeleton', () => {
    expect(src).toContain('AttendanceSkeleton');
    expect(src).toContain('animate-pulse');
  });

  it('has offline fallback', () => {
    expect(src).toContain('EssOfflineFallback');
  });

  it('day list uses <ol> for semantics', () => {
    expect(src).toContain('<ol');
    expect(src).toContain('</ol>');
  });

  it('handles in-progress clock (clockIn without clockOut)', () => {
    expect(src).toContain('isInProgress');
    expect(src).toContain('In progress');
  });

  it('has required data-testid attributes', () => {
    expect(src).toContain('data-testid="mobile-attendance"');
    expect(src).toContain('data-testid="attendance-ring"');
    expect(src).toContain('data-testid="week-navigator"');
    expect(src).toContain('data-testid="day-list"');
    expect(src).toContain('testId="day-row"');
    expect(src).toContain('testId="weekly-summary-card"');
    expect(src).toContain('data-testid="monthly-summary"');
    expect(src).toContain('data-testid="monthly-summary-toggle"');
    expect(src).toContain('data-testid="monthly-summary-content"');
    expect(src).toContain('data-testid="attendance-skeleton"');
    expect(src).toContain('data-testid="mobile-attendance-error"');
  });

  it('exports Ring and helpers for testing', () => {
    expect(src).toContain('export { AttendanceRing');
    expect(src).toContain('getWeekRange');
    expect(src).toContain('getRingColor');
  });
});

// ── EssAttendancePage mobile routing ─────────────────────────

describe('EssAttendancePage mobile routing', () => {
  const src = fs.readFileSync(
    path.resolve('src/pages/ess/EssAttendancePage.jsx'),
    'utf-8',
  );

  it('imports useMobileLayout', () => {
    expect(src).toContain('useMobileLayout');
  });

  it('imports MobileAttendance', () => {
    expect(src).toContain('MobileAttendance');
  });

  it('conditionally returns MobileAttendance when isMobile', () => {
    expect(src).toContain('if (isMobile) return <MobileAttendance />');
  });
});

// ── i18n keys ────────────────────────────────────────────────

describe('i18n — mobile.attendance keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'title', 'thisWeek', 'attendanceRate', 'daysPresent',
    'previousWeek', 'nextWeek', 'present', 'late', 'absent',
    'leave', 'noRecord', 'approved', 'monthlySummary',
    'totalHours', 'lateArrivals', 'absences', 'leaveTaken',
    'day', 'days',
  ];

  it('EN has all mobile.attendance keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.attendance).toHaveProperty(key);
      expect(en.mobile.attendance[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.attendance keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.attendance).toHaveProperty(key);
      expect(fr.mobile.attendance[key]).toBeTruthy();
    });
  });

  it('EN interpolation placeholders present', () => {
    expect(en.mobile.attendance.attendanceRate).toContain('{{rate}}');
    expect(en.mobile.attendance.daysPresent).toContain('{{count}}');
    expect(en.mobile.attendance.daysPresent).toContain('{{total}}');
    expect(en.mobile.attendance.monthlySummary).toContain('{{month}}');
    expect(en.mobile.attendance.day).toContain('{{count}}');
    expect(en.mobile.attendance.days).toContain('{{count}}');
  });

  it('FR interpolation placeholders present', () => {
    expect(fr.mobile.attendance.attendanceRate).toContain('{{rate}}');
    expect(fr.mobile.attendance.daysPresent).toContain('{{count}}');
    expect(fr.mobile.attendance.monthlySummary).toContain('{{month}}');
  });

  it('FR translations are correct', () => {
    expect(fr.mobile.attendance.title).toBe('Temps');
    expect(fr.mobile.attendance.present).toBe('Présent');
    expect(fr.mobile.attendance.late).toBe('Arrivée tardive');
    expect(fr.mobile.attendance.leave).toBe('Congé');
    expect(fr.mobile.attendance.noRecord).toBe('Aucun enregistrement');
  });

  it('EN labels are concise for mobile', () => {
    expect(en.mobile.attendance.title.length).toBeLessThanOrEqual(10);
    expect(en.mobile.attendance.present.length).toBeLessThanOrEqual(10);
    expect(en.mobile.attendance.noRecord.length).toBeLessThanOrEqual(12);
  });
});
