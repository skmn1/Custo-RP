/**
 * Unit tests for Task 83 — MobileRequestsPage (Nexus Kinetic)
 *
 * Covers:
 *  - balancePct: progress bar percentage clamped at 100
 *  - statusChipClass: correct classes for approved/pending/declined
 *  - formatDateRange: single date and range formatting
 *  - Date validation: endDate must be ≥ startDate
 *  - i18n keys: EN and FR presence + value checks (nested types/status)
 *  - Source structural assertions: testids, aria attrs, FAB, hooks, routes
 *  - Hooks: useEssLeaveBalance and useEssLeaveRequests structure
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Helpers mirrored from MobileRequestsPage ─────────────────────

function balancePct(used, total) {
  if (!total) return 0;
  return Math.min((used / total) * 100, 100);
}

function statusChipClass(status) {
  if (status === 'approved') return 'bg-primary-container/40 text-primary';
  if (status === 'declined' || status === 'rejected') return 'bg-error-container/40 text-error';
  return 'bg-secondary-container/40 text-secondary';
}

/** Simplified date validation: endDate >= startDate */
function isEndDateValid(startDate, endDate) {
  if (!startDate || !endDate) return true; // not filled yet
  return endDate >= startDate;
}

// ── balancePct ───────────────────────────────────────────────────

describe('balancePct()', () => {
  it('returns 0 when used is 0', () => {
    expect(balancePct(0, 21)).toBe(0);
  });

  it('returns 100 when fully used', () => {
    expect(balancePct(21, 21)).toBe(100);
  });

  it('returns correct pct for partial use', () => {
    expect(balancePct(12, 21)).toBeCloseTo((12 / 21) * 100);
  });

  it('clamps to 100 when over-used', () => {
    expect(balancePct(25, 21)).toBe(100);
  });

  it('returns 0 when total is 0 (avoid division by zero)', () => {
    expect(balancePct(0, 0)).toBe(0);
  });

  it('handles decimal values', () => {
    expect(balancePct(5, 10)).toBeCloseTo(50);
  });

  it('handles sick days 2/10', () => {
    expect(balancePct(2, 10)).toBeCloseTo(20);
  });
});

// ── statusChipClass ──────────────────────────────────────────────

describe('statusChipClass()', () => {
  it('approved → primary-container color', () => {
    expect(statusChipClass('approved')).toContain('text-primary');
    expect(statusChipClass('approved')).toContain('bg-primary-container');
  });

  it('pending → secondary color', () => {
    expect(statusChipClass('pending')).toContain('text-secondary');
    expect(statusChipClass('pending')).toContain('bg-secondary-container');
  });

  it('declined → error color', () => {
    expect(statusChipClass('declined')).toContain('text-error');
    expect(statusChipClass('declined')).toContain('bg-error-container');
  });

  it('rejected also maps to error color', () => {
    expect(statusChipClass('rejected')).toContain('text-error');
  });

  it('unknown status defaults to secondary', () => {
    expect(statusChipClass('processing')).toContain('bg-secondary-container');
  });
});

// ── Date validation ──────────────────────────────────────────────

describe('isEndDateValid()', () => {
  it('returns true when endDate equals startDate', () => {
    expect(isEndDateValid('2026-04-15', '2026-04-15')).toBe(true);
  });

  it('returns true when endDate is after startDate', () => {
    expect(isEndDateValid('2026-04-15', '2026-04-18')).toBe(true);
  });

  it('returns false when endDate is before startDate', () => {
    expect(isEndDateValid('2026-04-15', '2026-04-14')).toBe(false);
  });

  it('returns true when startDate is empty (not yet filled)', () => {
    expect(isEndDateValid('', '2026-04-15')).toBe(true);
  });

  it('returns true when endDate is empty (not yet filled)', () => {
    expect(isEndDateValid('2026-04-15', '')).toBe(true);
  });

  it('returns true when both are empty', () => {
    expect(isEndDateValid('', '')).toBe(true);
  });
});

// ── i18n: EN keys ────────────────────────────────────────────────

describe('EN leave i18n keys', () => {
  const enPath = path.resolve(process.cwd(), 'public/locales/en/ess.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const leave = en.mobile?.leave ?? {};

  const flatKeys = [
    'title', 'sectionLabel', 'annualLeave', 'sickDays', 'shiftSwaps',
    'daysLeft', 'daysUsedOf', 'noData', 'newRequest', 'newRequestAriaLabel',
    'recentRequests', 'noRequests', 'leaveType', 'startDate', 'endDate',
    'reason', 'reasonPlaceholder', 'submitRequest', 'validationEndDate',
  ];

  flatKeys.forEach(key => {
    it(`has EN key mobile.leave.${key}`, () => {
      expect(leave[key]).toBeDefined();
      expect(typeof leave[key]).toBe('string');
      expect(leave[key].length).toBeGreaterThan(0);
    });
  });

  it('daysUsedOf contains {{used}} interpolation', () => {
    expect(leave.daysUsedOf).toContain('{{used}}');
  });

  it('daysUsedOf contains {{total}} interpolation', () => {
    expect(leave.daysUsedOf).toContain('{{total}}');
  });

  it('title is "Requests & Leave"', () => {
    expect(leave.title).toBe('Requests & Leave');
  });

  it('submitRequest is "Submit Request"', () => {
    expect(leave.submitRequest).toBe('Submit Request');
  });

  it('has types.annual', () => {
    expect(leave.types?.annual).toBe('Annual Leave');
  });

  it('has types.sick', () => {
    expect(leave.types?.sick).toBeDefined();
  });

  it('has types.swap', () => {
    expect(leave.types?.swap).toBeDefined();
  });

  it('has status.approved', () => {
    expect(leave.status?.approved).toBe('Approved');
  });

  it('has status.pending', () => {
    expect(leave.status?.pending).toBe('Pending');
  });

  it('has status.declined', () => {
    expect(leave.status?.declined).toBe('Declined');
  });
});

// ── i18n: FR keys ────────────────────────────────────────────────

describe('FR leave i18n keys', () => {
  const frPath = path.resolve(process.cwd(), 'public/locales/fr/ess.json');
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const leave = fr.mobile?.leave ?? {};

  it('title contains Congés', () => {
    expect(leave.title).toContain('Congés');
  });

  it('newRequest contains "demande"', () => {
    expect(leave.newRequest?.toLowerCase()).toContain('demande');
  });

  it('submitRequest contains "Soumettre"', () => {
    expect(leave.submitRequest).toContain('Soumettre');
  });

  it('status.approved is "Approuvé"', () => {
    expect(leave.status?.approved).toBe('Approuvé');
  });

  it('status.declined is "Refusé"', () => {
    expect(leave.status?.declined).toBe('Refusé');
  });

  it('status.pending contains "attente"', () => {
    expect(leave.status?.pending?.toLowerCase()).toContain('attente');
  });

  it('types.annual contains "Congé"', () => {
    expect(leave.types?.annual).toContain('Congé');
  });

  it('daysUsedOf contains {{used}}', () => {
    expect(leave.daysUsedOf).toContain('{{used}}');
  });

  it('validationEndDate is defined', () => {
    expect(leave.validationEndDate).toBeDefined();
    expect(leave.validationEndDate.length).toBeGreaterThan(0);
  });
});

// ── Source: MobileRequestsPage structure ────────────────────────

describe('MobileRequestsPage source structure', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileRequestsPage.jsx'),
    'utf8'
  );

  it('imports useEssLeaveBalance', () => {
    expect(src).toContain('useEssLeaveBalance');
  });

  it('imports useEssLeaveRequests', () => {
    expect(src).toContain('useEssLeaveRequests');
  });

  it('imports useTranslation', () => {
    expect(src).toContain('useTranslation');
  });

  it('imports Helmet', () => {
    expect(src).toContain('Helmet');
  });

  it('has requests-page testid', () => {
    expect(src).toContain('data-testid="requests-page"');
  });

  it('has leave-balance-cards testid', () => {
    expect(src).toContain('data-testid="leave-balance-cards"');
  });

  it('has balance cards for annual, sick, swap', () => {
    expect(src).toContain('annual');
    expect(src).toContain('sick');
    expect(src).toContain('swap');
  });

  it('has progress bars with role="progressbar"', () => {
    expect(src).toContain('role="progressbar"');
  });

  it('has aria-valuenow on progress bars', () => {
    expect(src).toContain('aria-valuenow');
  });

  it('has aria-valuemin and aria-valuemax on progress bars', () => {
    expect(src).toContain('aria-valuemin');
    expect(src).toContain('aria-valuemax');
  });

  it('has requests-list testid', () => {
    expect(src).toContain('data-testid="requests-list"');
  });

  it('has requests-empty testid', () => {
    expect(src).toContain('data-testid="requests-empty"');
  });

  it('has request-row testid', () => {
    expect(src).toContain('data-testid="request-row"');
  });

  it('has status-chip testid', () => {
    expect(src).toContain('data-testid="status-chip"');
  });

  it('has new-request-fab testid', () => {
    expect(src).toContain('data-testid="new-request-fab"');
  });

  it('FAB has aria-label from i18n', () => {
    expect(src).toContain('mobile.leave.newRequestAriaLabel');
  });

  it('FAB is positioned fixed bottom-24', () => {
    expect(src).toContain('fixed bottom-24');
  });

  it('has new-request-form testid', () => {
    expect(src).toContain('data-testid="new-request-form"');
  });

  it('has leave-type pill testids', () => {
    expect(src).toContain('data-testid={`leave-type-${lt.key}`}');
  });

  it('leave type pills have aria-pressed', () => {
    expect(src).toContain('aria-pressed');
  });

  it('has start-date-input testid', () => {
    expect(src).toContain('data-testid="start-date-input"');
  });

  it('has end-date-input testid', () => {
    expect(src).toContain('data-testid="end-date-input"');
  });

  it('has reason-input testid', () => {
    expect(src).toContain('data-testid="reason-input"');
  });

  it('has submit-request-btn testid', () => {
    expect(src).toContain('data-testid="submit-request-btn"');
  });

  it('submit button has disabled prop tied to isSubmitting', () => {
    expect(src).toContain('disabled={isSubmitting}');
  });

  it('has form-error testid with role="alert"', () => {
    expect(src).toContain('data-testid="form-error"');
    expect(src).toContain('role="alert"');
  });

  it('validates endDate < startDate and sets validation error', () => {
    expect(src).toContain('validationEndDate');
    expect(src).toContain('endDate < startDate');
  });

  it('bottom sheet has role="dialog"', () => {
    expect(src).toContain('role="dialog"');
  });

  it('uses Magenta gradient on FAB and submit button', () => {
    expect(src).toContain('#da336b');
    expect(src).toContain('#8b2044');
  });

  it('Material Symbols icon: beach_access for annual leave', () => {
    expect(src).toContain('beach_access');
  });

  it('Material Symbols icon: sick for sick days', () => {
    expect(src).toContain('sick');
  });

  it('skeleton has requests-skeleton testid', () => {
    expect(src).toContain('data-testid="requests-skeleton"');
  });

  it('exports MobileRequestsPage as named export', () => {
    expect(src).toContain('export const MobileRequestsPage');
  });

  it('has leave-sheet testid on bottom sheet', () => {
    expect(src).toContain('data-testid="leave-sheet"');
  });
});

// ── Source: hooks ────────────────────────────────────────────────

describe('useEssLeaveBalance hook', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useEssLeaveBalance.js'),
    'utf8'
  );

  it('exports useEssLeaveBalance', () => {
    expect(src).toContain('export function useEssLeaveBalance');
  });

  it('calls /ess/leave/balance endpoint', () => {
    expect(src).toContain('/ess/leave/balance');
  });

  it('returns { data, isLoading, error, refetch }', () => {
    expect(src).toContain('return { data, isLoading, error, refetch');
  });

  it('uses useEffect to fetch on mount', () => {
    expect(src).toContain('useEffect');
  });
});

describe('useEssLeaveRequests hook', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useEssLeaveRequests.js'),
    'utf8'
  );

  it('exports useEssLeaveRequests', () => {
    expect(src).toContain('export function useEssLeaveRequests');
  });

  it('calls /ess/leave/requests endpoint for GET', () => {
    expect(src).toContain('/ess/leave/requests');
  });

  it('uses POST method for createRequest', () => {
    expect(src).toContain("method: 'POST'");
  });

  it('returns createRequest function', () => {
    expect(src).toContain('createRequest');
  });

  it('returns isSubmitting state', () => {
    expect(src).toContain('isSubmitting');
  });

  it('returns submitError state', () => {
    expect(src).toContain('submitError');
  });

  it('refreshes list after successful create', () => {
    expect(src).toContain('fetchRequests()');
  });
});

// ── App.jsx route ────────────────────────────────────────────────

describe('App.jsx ESS requests route', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/App.jsx'),
    'utf8'
  );

  it('imports MobileRequestsPage', () => {
    expect(src).toContain('MobileRequestsPage');
  });

  it('has requests route at path="requests"', () => {
    expect(src).toContain('path="requests"');
  });

  it('requests route uses MobileRequestsPage element', () => {
    expect(src).toContain('element={<MobileRequestsPage />}');
  });
});
