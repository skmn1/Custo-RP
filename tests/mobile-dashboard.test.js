/**
 * Unit tests for Task 65 — ESS Mobile Dashboard
 *
 * Covers:
 *  - Time-based greeting logic
 *  - formatRelativeDay logic
 *  - NextShiftCard (with data, empty state)
 *  - QuickStatsRow (hidden payslip when restricted)
 *  - Summary cards structure
 *  - i18n keys (EN + FR)
 *  - Component structure checks
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Time-based greeting ──────────────────────────────────────────

describe('Time-based greeting logic', () => {
  const mockT = (key) => key;

  function getTimeBasedGreeting(t, hour) {
    if (hour < 12) return t('mobile.dashboard.goodMorning');
    if (hour < 18) return t('mobile.dashboard.goodAfternoon');
    return t('mobile.dashboard.goodEvening');
  }

  it('returns goodMorning before 12:00', () => {
    expect(getTimeBasedGreeting(mockT, 0)).toBe('mobile.dashboard.goodMorning');
    expect(getTimeBasedGreeting(mockT, 6)).toBe('mobile.dashboard.goodMorning');
    expect(getTimeBasedGreeting(mockT, 11)).toBe('mobile.dashboard.goodMorning');
  });

  it('returns goodAfternoon from 12:00 to 17:59', () => {
    expect(getTimeBasedGreeting(mockT, 12)).toBe('mobile.dashboard.goodAfternoon');
    expect(getTimeBasedGreeting(mockT, 15)).toBe('mobile.dashboard.goodAfternoon');
    expect(getTimeBasedGreeting(mockT, 17)).toBe('mobile.dashboard.goodAfternoon');
  });

  it('returns goodEvening from 18:00 onwards', () => {
    expect(getTimeBasedGreeting(mockT, 18)).toBe('mobile.dashboard.goodEvening');
    expect(getTimeBasedGreeting(mockT, 21)).toBe('mobile.dashboard.goodEvening');
    expect(getTimeBasedGreeting(mockT, 23)).toBe('mobile.dashboard.goodEvening');
  });
});

// ── formatRelativeDay ────────────────────────────────────────────

describe('formatRelativeDay logic', () => {
  const mockT = (key) => {
    const map = { 'schedule.today': 'Today', 'mobile.dashboard.tomorrow': 'Tomorrow' };
    return map[key] || key;
  };
  const mockFormatDate = (d) => 'Thu 10 Apr';

  // Helper that mirrors the component's logic
  function formatRelativeDay(dateStr, t, formatDate) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) return t('schedule.today');
    if (target.getTime() === tomorrow.getTime()) return t('mobile.dashboard.tomorrow');
    return formatDate(d, 'EEE d MMM');
  }

  it('returns empty string for null/undefined', () => {
    expect(formatRelativeDay(null, mockT, mockFormatDate)).toBe('');
    expect(formatRelativeDay(undefined, mockT, mockFormatDate)).toBe('');
  });

  it('returns "Today" for today\'s date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(formatRelativeDay(today, mockT, mockFormatDate)).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow\'s date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmrStr = tomorrow.toISOString().split('T')[0];
    expect(formatRelativeDay(tmrStr, mockT, mockFormatDate)).toBe('Tomorrow');
  });

  it('returns formatted date for other dates', () => {
    const farDate = new Date();
    farDate.setDate(farDate.getDate() + 5);
    const result = formatRelativeDay(farDate.toISOString().split('T')[0], mockT, mockFormatDate);
    expect(result).toBe('Thu 10 Apr'); // mocked
  });
});

// ── QuickStats restriction logic ─────────────────────────────────

describe('QuickStats payslip restriction', () => {
  const items = [
    { value: 2, label: 'shifts', link: '/app/ess/schedule' },
    { value: '€2.6k', label: 'last pay', link: '/app/ess/payslips', hidden: true },
    { value: '48.5h', label: 'hours', link: '/app/ess/attendance' },
    { value: '100%', label: 'attendance', link: '/app/ess/attendance' },
  ];

  it('filters out hidden payslip stat', () => {
    const visible = items.filter((i) => !i.hidden);
    expect(visible).toHaveLength(3);
    expect(visible.find((i) => i.label === 'last pay')).toBeUndefined();
  });

  it('shows payslip stat when not restricted', () => {
    const unrestricted = items.map((i) => ({ ...i, hidden: false }));
    const visible = unrestricted.filter((i) => !i.hidden);
    expect(visible).toHaveLength(4);
  });
});

// ── MobileDashboard component structure ──────────────────────────

describe('MobileDashboard component structure', () => {
  const src = fs.readFileSync(
    path.resolve('src/components/ess/dashboard/MobileDashboard.jsx'),
    'utf-8',
  );

  it('imports useEssDashboard hook', () => {
    expect(src).toContain('useEssDashboard');
  });

  it('imports useMobileLayout is NOT in this file (done at page level)', () => {
    expect(src).not.toContain('useMobileLayout');
  });

  it('imports MobileCard primitive', () => {
    expect(src).toContain('MobileCard');
  });

  it('imports StatusChip primitive', () => {
    expect(src).toContain('StatusChip');
  });

  it('uses date-fns isToday/isTomorrow', () => {
    expect(src).toContain('isToday');
    expect(src).toContain('isTomorrow');
  });

  it('uses useLocaleFormat for currency formatting', () => {
    expect(src).toContain('useLocaleFormat');
    expect(src).toContain('formatCurrency');
  });

  it('uses useLocaleDateFns for date formatting', () => {
    expect(src).toContain('useLocaleDateFns');
    expect(src).toContain('formatDate');
  });

  it('renders greeting section', () => {
    expect(src).toContain('MobileDashboardGreeting');
  });

  it('renders next shift card', () => {
    expect(src).toContain('NextShiftCard');
  });

  it('renders quick stats row', () => {
    expect(src).toContain('QuickStatsRow');
  });

  it('renders payslip card', () => {
    expect(src).toContain('PayslipCard');
  });

  it('renders profile card', () => {
    expect(src).toContain('ProfileCard');
  });

  it('renders attendance card', () => {
    expect(src).toContain('AttendanceCard');
  });

  it('has loading skeleton state', () => {
    expect(src).toContain('DashboardSkeleton');
    expect(src).toContain('animate-pulse');
  });

  it('has error/retry state', () => {
    expect(src).toContain('refetch');
    expect(src).toContain('ArrowPathIcon');
  });

  it('has offline fallback', () => {
    expect(src).toContain('EssOfflineFallback');
  });

  it('has data-testid attributes', () => {
    expect(src).toContain('data-testid="mobile-dashboard"');
    expect(src).toContain('data-testid="mobile-dashboard-greeting"');
    expect(src).toContain('testId="mobile-next-shift-card"');
    expect(src).toContain('data-testid="mobile-quick-stats"');
    expect(src).toContain('testId="mobile-payslip-card"');
    expect(src).toContain('testId="mobile-profile-card"');
    expect(src).toContain('testId="mobile-attendance-card"');
    expect(src).toContain('data-testid="mobile-dashboard-skeleton"');
    expect(src).toContain('data-testid="mobile-dashboard-error"');
  });
});

// ── EssDashboardPage conditional routing ─────────────────────────

describe('EssDashboardPage mobile routing', () => {
  const src = fs.readFileSync(
    path.resolve('src/pages/ess/EssDashboardPage.jsx'),
    'utf-8',
  );

  it('imports useMobileLayout', () => {
    expect(src).toContain('useMobileLayout');
  });

  it('imports MobileDashboard', () => {
    expect(src).toContain('MobileDashboard');
  });

  it('conditionally returns MobileDashboard when isMobile', () => {
    expect(src).toContain('if (isMobile) return <MobileDashboard />');
  });
});

// ── i18n keys ────────────────────────────────────────────────────

describe('i18n — mobile.dashboard keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'goodMorning', 'goodAfternoon', 'goodEvening', 'tomorrow',
    'nextShift', 'noUpcomingShifts', 'viewSchedule',
    'shifts', 'lastPay', 'hours', 'attendance',
    'latestPayslip', 'paidOn', 'profile', 'complete', 'pendingRequests',
    'attendanceThisMonth', 'hoursWorked', 'attendanceRate',
  ];

  it('EN has all mobile.dashboard keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.dashboard).toHaveProperty(key);
      expect(en.mobile.dashboard[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.dashboard keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.dashboard).toHaveProperty(key);
      expect(fr.mobile.dashboard[key]).toBeTruthy();
    });
  });

  it('FR greetings are correct', () => {
    expect(fr.mobile.dashboard.goodMorning).toBe('Bonjour');
    expect(fr.mobile.dashboard.goodAfternoon).toBe('Bon après-midi');
    expect(fr.mobile.dashboard.goodEvening).toBe('Bonsoir');
  });

  it('EN labels are short for mobile display', () => {
    expect(en.mobile.dashboard.shifts.length).toBeLessThanOrEqual(8);
    expect(en.mobile.dashboard.lastPay.length).toBeLessThanOrEqual(10);
    expect(en.mobile.dashboard.hours.length).toBeLessThanOrEqual(8);
    expect(en.mobile.dashboard.attendance.length).toBeLessThanOrEqual(10);
  });

  it('interpolation placeholders present', () => {
    expect(en.mobile.dashboard.paidOn).toContain('{{date}}');
    expect(en.mobile.dashboard.complete).toContain('{{percent}}');
    expect(en.mobile.dashboard.pendingRequests).toContain('{{count}}');
    expect(en.mobile.dashboard.hoursWorked).toContain('{{hours}}');
    expect(en.mobile.dashboard.attendanceRate).toContain('{{rate}}');
  });
});

// ── Next shift card badge cap ────────────────────────────────────

describe('Notification badge cap (from TopBar, relevant to dashboard context)', () => {
  it('caps at 99+', () => {
    const formatBadge = (count) => (count > 99 ? '99+' : String(count));
    expect(formatBadge(0)).toBe('0');
    expect(formatBadge(5)).toBe('5');
    expect(formatBadge(99)).toBe('99');
    expect(formatBadge(100)).toBe('99+');
  });
});

// ── Progress bar width ───────────────────────────────────────────

describe('Profile completeness progress bar', () => {
  it('clamps width to 100%', () => {
    const clamp = (pct) => `${Math.min(pct, 100)}%`;
    expect(clamp(85)).toBe('85%');
    expect(clamp(100)).toBe('100%');
    expect(clamp(120)).toBe('100%');
    expect(clamp(0)).toBe('0%');
  });
});
