/**
 * Unit tests for Task 75 — ESS Warm Restyle Per-Screen Application
 *
 * Covers:
 *  - BottomNav: warm token bg/border, active-pill span, label only for active tab
 *  - MobileDashboard: warm gradient hero card, stat values use --mobile-tint
 *  - WeekView: today pill uses --mobile-tint instead of bg-indigo-600
 *  - ShiftCard: left bar uses --mobile-tint
 *  - MobileAttendance: STATUS_DOT_COLORS use token vars, gradient summary card wrapper
 *  - MobilePayslipDetail: net pay uses --mobile-tint, breakdown bar uses --mobile-success/destructive
 *  - MobileProfile: avatar ring has --mobile-tint, section headers use .mobile-grain, press state uses token
 *  - MobileNotifications: press state uses --mobile-bg-grouped
 *  - MobileOfflineIndicators: offline banner uses warm rgba, QueuedActionsNotice uses --mobile-warning
 *  - ActionRow: press state uses --mobile-bg-grouped
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Source files ──────────────────────────────────────────────────

const bottomNavSrc = fs.readFileSync(
  path.resolve('src/components/mobile/BottomNav.jsx'),
  'utf-8',
);

const dashboardSrc = fs.readFileSync(
  path.resolve('src/components/ess/dashboard/MobileDashboard.jsx'),
  'utf-8',
);

const weekViewSrc = fs.readFileSync(
  path.resolve('src/components/ess/schedule/WeekView.jsx'),
  'utf-8',
);

const shiftCardSrc = fs.readFileSync(
  path.resolve('src/components/ess/schedule/ShiftCard.jsx'),
  'utf-8',
);

const attendanceSrc = fs.readFileSync(
  path.resolve('src/components/ess/attendance/MobileAttendance.jsx'),
  'utf-8',
);

const payslipSrc = fs.readFileSync(
  path.resolve('src/components/ess/payslips/MobilePayslipDetail.jsx'),
  'utf-8',
);

const profileSrc = fs.readFileSync(
  path.resolve('src/components/ess/profile/MobileProfile.jsx'),
  'utf-8',
);

const notificationsSrc = fs.readFileSync(
  path.resolve('src/components/ess/notifications/MobileNotifications.jsx'),
  'utf-8',
);

const offlineSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileOfflineIndicators.jsx'),
  'utf-8',
);

const actionRowSrc = fs.readFileSync(
  path.resolve('src/components/mobile/ActionRow.jsx'),
  'utf-8',
);

// ── BottomNav ─────────────────────────────────────────────────────

describe('BottomNav — warm restyle', () => {
  it('uses --mobile-tab-bg token for nav background', () => {
    expect(bottomNavSrc).toContain('var(--mobile-tab-bg)');
  });

  it('uses --mobile-tab-border token for nav top border', () => {
    expect(bottomNavSrc).toContain('var(--mobile-tab-border)');
  });

  it('renders a pill span for the active tab indicator', () => {
    expect(bottomNavSrc).toContain('--mobile-tab-active-pill');
  });

  it('only shows the label for the active tab', () => {
    expect(bottomNavSrc).toContain('isActive &&');
  });

  it('does not use bg-gray for nav background', () => {
    expect(bottomNavSrc).not.toMatch(/className="[^"]*bg-gray-[^"]*"/);
  });
});

// ── MobileDashboard ───────────────────────────────────────────────

describe('MobileDashboard — warm restyle', () => {
  it('renders a warm gradient hero card', () => {
    expect(dashboardSrc).toContain('linear-gradient(160deg, #EDE8DF');
  });

  it('stat pill values use --mobile-tint colour', () => {
    expect(dashboardSrc).toContain('var(--mobile-tint)');
  });

  it('passes nextShift prop to greeting component', () => {
    expect(dashboardSrc).toContain('nextShift');
  });
});

// ── WeekView ─────────────────────────────────────────────────────

describe('WeekView — warm today pill', () => {
  it('uses --mobile-tint for the today date pill background', () => {
    expect(weekViewSrc).toContain('var(--mobile-tint)');
  });

  it('does not use bg-indigo-600 for the today pill', () => {
    expect(weekViewSrc).not.toContain('bg-indigo-600');
  });
});

// ── ShiftCard ─────────────────────────────────────────────────────

describe('ShiftCard — warm left bar', () => {
  it('uses --mobile-tint for the left accent bar', () => {
    expect(shiftCardSrc).toContain('var(--mobile-tint)');
  });

  it('does not hard-code a hex colour for the left bar directly', () => {
    // The bar should pull from the token, not from colors.bar evaluation in render
    expect(shiftCardSrc).not.toMatch(/backgroundColor:\s*colors\.bar/);
  });
});

// ── MobileAttendance ──────────────────────────────────────────────

describe('MobileAttendance — warm restyle', () => {
  it('STATUS_DOT_COLORS.present uses --mobile-success token', () => {
    expect(attendanceSrc).toContain('var(--mobile-success)');
  });

  it('STATUS_DOT_COLORS.late uses --mobile-warning token', () => {
    expect(attendanceSrc).toContain('var(--mobile-warning)');
  });

  it('STATUS_DOT_COLORS.absent uses --mobile-destructive token', () => {
    expect(attendanceSrc).toContain('var(--mobile-destructive)');
  });

  it('STATUS_DOT_COLORS.leave/holiday uses --mobile-info token', () => {
    expect(attendanceSrc).toContain('var(--mobile-info)');
  });

  it('does not use hard-coded green-500/red-500 Tailwind in STATUS_DOT_COLORS', () => {
    expect(attendanceSrc).not.toContain("present: 'bg-green-500'");
    expect(attendanceSrc).not.toContain("absent: 'bg-red-500'");
  });

  it('weekly summary card has warm gradient wrapper', () => {
    expect(attendanceSrc).toContain('linear-gradient(160deg, #EDE8DF');
  });

  it('weekly summary card uses data-testid=weekly-summary-card', () => {
    expect(attendanceSrc).toContain('data-testid="weekly-summary-card"');
  });
});

// ── MobilePayslipDetail ───────────────────────────────────────────

describe('MobilePayslipDetail — warm restyle', () => {
  it('net pay figure uses --mobile-tint colour', () => {
    expect(payslipSrc).toContain('var(--mobile-tint)');
  });

  it('PayBreakdownBar net segment uses --mobile-success', () => {
    expect(payslipSrc).toContain('var(--mobile-success)');
  });

  it('PayBreakdownBar deductions segment uses --mobile-destructive', () => {
    expect(payslipSrc).toContain('var(--mobile-destructive)');
  });
});

// ── MobileProfile ─────────────────────────────────────────────────

describe('MobileProfile — warm restyle', () => {
  it('avatar ring wrapper uses --mobile-tint background', () => {
    expect(profileSrc).toContain("background: 'var(--mobile-tint)'");
  });

  it('avatar ring has data-testid=profile-avatar-ring', () => {
    expect(profileSrc).toContain('data-testid="profile-avatar-ring"');
  });

  it('avatarfallback initials use --mobile-tint colour', () => {
    expect(profileSrc).toContain("color: 'var(--mobile-tint)'");
  });

  it('section headers use .mobile-grain class', () => {
    expect(profileSrc).toContain('mobile-grain');
  });

  it('section headers use .mobile-section-header class', () => {
    expect(profileSrc).toContain('mobile-section-header');
  });

  it('ProfileFieldRow editable press state uses --mobile-bg-grouped', () => {
    expect(profileSrc).toContain('active:bg-[var(--mobile-bg-grouped)]');
  });

  it('DocumentRow press state uses --mobile-bg-grouped', () => {
    expect(profileSrc).toContain('active:bg-[var(--mobile-bg-grouped)]');
  });

  it('does not use bg-indigo-100 for avatar fallback', () => {
    expect(profileSrc).not.toContain('bg-indigo-100');
  });

  it('does not use active:bg-gray-50 in profile', () => {
    expect(profileSrc).not.toContain('active:bg-gray-50');
  });
});

// ── MobileNotifications ───────────────────────────────────────────

describe('MobileNotifications — warm restyle', () => {
  it('NotificationRow press state uses --mobile-bg-grouped', () => {
    expect(notificationsSrc).toContain('active:bg-[var(--mobile-bg-grouped)]');
  });

  it('does not use active:bg-gray-50 for press state', () => {
    expect(notificationsSrc).not.toContain('active:bg-gray-50');
  });
});

// ── MobileOfflineIndicators ───────────────────────────────────────

describe('MobileOfflineIndicators — warm restyle', () => {
  it('offline banner uses warm amber rgba instead of Tailwind amber-500', () => {
    expect(offlineSrc).toContain('rgba(196,163,90,0.92)');
  });

  it('offline banner does not use bg-amber-500/90', () => {
    expect(offlineSrc).not.toContain('bg-amber-500/90');
  });

  it('QueuedActionsNotice uses --mobile-warning colour for text', () => {
    expect(offlineSrc).toContain('var(--mobile-warning)');
  });

  it('QueuedActionsNotice does not use text-amber-700', () => {
    expect(offlineSrc).not.toContain('text-amber-700');
  });

  it('QueuedActionsNotice uses --mobile-bg-grouped for background', () => {
    expect(offlineSrc).toContain('var(--mobile-bg-grouped)');
  });
});

// ── ActionRow ─────────────────────────────────────────────────────

describe('ActionRow — warm restyle', () => {
  it('press state uses --mobile-bg-grouped token', () => {
    expect(actionRowSrc).toContain('active:bg-[var(--mobile-bg-grouped)]');
  });

  it('does not use active:bg-gray-50 for press state', () => {
    expect(actionRowSrc).not.toContain('active:bg-gray-50');
  });
});
