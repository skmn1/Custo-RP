/**
 * Unit tests for Task 88 — ESS Leave Request Logic (Mobile)
 *
 * Covers:
 *  - calculateWorkingDays: weekday counting, holiday exclusion, edge cases
 *  - statusChipClass: all status values including new submitted/cancelled
 *  - typeIcon: leave type → icon mapping
 *  - Form validation logic: 6 validation rules
 *  - Balance warning: triggered when workingDays > available
 *  - Reason field visibility: required/optional/hidden by leave type
 *  - i18n keys: new Task 88 keys in EN and FR
 *  - Source structure: hook imports, testids, aria attributes
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { calculateWorkingDays } from '../src/utils/dateUtils.js';

// ── Helpers mirrored from MobileRequestsPage ─────────────────────

function statusChipClass(status) {
  switch (status) {
    case 'approved':  return 'bg-primary-container/40 text-primary';
    case 'rejected':
    case 'declined':  return 'bg-error-container/40 text-error';
    case 'cancelled': return 'bg-surface-container text-outline';
    case 'submitted':
    case 'pending':
    default:          return 'bg-secondary-container/40 text-secondary';
  }
}

function typeIcon(leaveType) {
  const lt = (leaveType || '').toLowerCase();
  if (lt.includes('sick')) return 'sick';
  if (lt.includes('personal')) return 'person';
  if (lt.includes('unpaid')) return 'money_off';
  return 'beach_access';
}

const REASON_REQUIRED_TYPES = new Set(['annual', 'unpaid', 'personal']);
const REASON_HIDDEN_TYPES   = new Set(['maternity', 'paternity']);

function isReasonRequired(typeCode) {
  return REASON_REQUIRED_TYPES.has(typeCode) ||
    (!REASON_HIDDEN_TYPES.has(typeCode) && !['sick', 'bereavement'].includes(typeCode));
}

function isReasonHidden(typeCode) {
  return REASON_HIDDEN_TYPES.has(typeCode);
}

function validate({ leaveTypeId, startDate, endDate, reason, reasonRequired }) {
  const errs = {};
  const today = new Date().toISOString().split('T')[0];
  if (!leaveTypeId) errs.leaveType = 'required';
  if (!startDate)   errs.startDate = 'required';
  else if (startDate < today) errs.startDate = 'future';
  if (!endDate)     errs.endDate = 'required';
  else if (startDate && endDate < startDate) errs.endDate = 'afterStart';
  if (reasonRequired && !reason.trim()) errs.reason = 'required';
  return errs;
}

// ── calculateWorkingDays ─────────────────────────────────────────

describe('calculateWorkingDays()', () => {
  it('returns 0 and 0 when dates are empty', () => {
    const result = calculateWorkingDays('', '');
    expect(result.workingDays).toBe(0);
    expect(result.holidaysExcluded).toBe(0);
  });

  it('returns 0 when startDate > endDate', () => {
    const result = calculateWorkingDays('2026-01-10', '2026-01-05');
    expect(result.workingDays).toBe(0);
  });

  it('counts 1 day for a single weekday (Monday)', () => {
    // 2026-01-05 is a Monday
    const result = calculateWorkingDays('2026-01-05', '2026-01-05');
    expect(result.workingDays).toBe(1);
  });

  it('counts 0 days for a Saturday', () => {
    // 2026-01-03 is a Saturday
    const result = calculateWorkingDays('2026-01-03', '2026-01-03');
    expect(result.workingDays).toBe(0);
  });

  it('counts 0 days for a Sunday', () => {
    // 2026-01-04 is a Sunday
    const result = calculateWorkingDays('2026-01-04', '2026-01-04');
    expect(result.workingDays).toBe(0);
  });

  it('counts 5 working days in a Mon-Fri week', () => {
    // 2026-01-05 (Mon) to 2026-01-09 (Fri)
    const result = calculateWorkingDays('2026-01-05', '2026-01-09');
    expect(result.workingDays).toBe(5);
  });

  it('counts 5 working days across a full Mon-Sun span', () => {
    // 2026-01-05 (Mon) to 2026-01-11 (Sun)
    const result = calculateWorkingDays('2026-01-05', '2026-01-11');
    expect(result.workingDays).toBe(5);
  });

  it('counts 10 working days across 2 weeks', () => {
    // 2026-01-05 (Mon) to 2026-01-16 (Fri)
    const result = calculateWorkingDays('2026-01-05', '2026-01-16');
    expect(result.workingDays).toBe(10);
  });

  it('excludes public holidays passed as strings', () => {
    // 2026-01-05 (Mon) to 2026-01-09 (Fri), 1 holiday on Wed
    const result = calculateWorkingDays('2026-01-05', '2026-01-09', ['2026-01-07']);
    expect(result.workingDays).toBe(4);
    expect(result.holidaysExcluded).toBe(1);
  });

  it('excludes public holidays passed as objects with .date property', () => {
    const result = calculateWorkingDays('2026-01-05', '2026-01-09', [{ date: '2026-01-07' }]);
    expect(result.workingDays).toBe(4);
    expect(result.holidaysExcluded).toBe(1);
  });

  it('does not double-count weekend holidays', () => {
    // 2026-01-05 (Mon) to 2026-01-11 (Sun), holiday on Sat
    const result = calculateWorkingDays('2026-01-05', '2026-01-11', ['2026-01-10']);
    expect(result.workingDays).toBe(5); // Sat already excluded
    expect(result.holidaysExcluded).toBe(0);
  });

  it('handles multiple holidays in one week', () => {
    // 2026-01-05 (Mon) to 2026-01-09 (Fri), holidays on Mon and Fri
    const result = calculateWorkingDays('2026-01-05', '2026-01-09', ['2026-01-05', '2026-01-09']);
    expect(result.workingDays).toBe(3);
    expect(result.holidaysExcluded).toBe(2);
  });
});

// ── statusChipClass ──────────────────────────────────────────────

describe('statusChipClass() — Task 88', () => {
  it('approved → primary color', () => {
    expect(statusChipClass('approved')).toContain('text-primary');
    expect(statusChipClass('approved')).toContain('bg-primary-container');
  });

  it('pending → secondary color', () => {
    expect(statusChipClass('pending')).toContain('text-secondary');
    expect(statusChipClass('pending')).toContain('bg-secondary-container');
  });

  it('submitted → secondary color (same as pending)', () => {
    expect(statusChipClass('submitted')).toContain('text-secondary');
  });

  it('declined → error color', () => {
    expect(statusChipClass('declined')).toContain('text-error');
  });

  it('rejected → error color', () => {
    expect(statusChipClass('rejected')).toContain('text-error');
  });

  it('cancelled → outline color on surface', () => {
    expect(statusChipClass('cancelled')).toContain('text-outline');
    expect(statusChipClass('cancelled')).toContain('bg-surface-container');
  });

  it('unknown status defaults to secondary', () => {
    expect(statusChipClass('processing')).toContain('bg-secondary-container');
  });
});

// ── typeIcon ─────────────────────────────────────────────────────

describe('typeIcon()', () => {
  it('sick → sick icon', () => {
    expect(typeIcon('Sick Leave')).toBe('sick');
  });

  it('personal → person icon', () => {
    expect(typeIcon('personal')).toBe('person');
  });

  it('unpaid → money_off icon', () => {
    expect(typeIcon('Unpaid Leave')).toBe('money_off');
  });

  it('annual → beach_access icon', () => {
    expect(typeIcon('Annual Leave')).toBe('beach_access');
  });

  it('empty/null → beach_access default', () => {
    expect(typeIcon('')).toBe('beach_access');
    expect(typeIcon(null)).toBe('beach_access');
  });
});

// ── Reason field visibility ──────────────────────────────────────

describe('Reason field behaviour', () => {
  it('annual requires reason', () => {
    expect(isReasonRequired('annual')).toBe(true);
  });

  it('unpaid requires reason', () => {
    expect(isReasonRequired('unpaid')).toBe(true);
  });

  it('personal requires reason', () => {
    expect(isReasonRequired('personal')).toBe(true);
  });

  it('sick does NOT require reason', () => {
    expect(isReasonRequired('sick')).toBe(false);
  });

  it('bereavement does NOT require reason', () => {
    expect(isReasonRequired('bereavement')).toBe(false);
  });

  it('maternity hides reason field', () => {
    expect(isReasonHidden('maternity')).toBe(true);
  });

  it('paternity hides reason field', () => {
    expect(isReasonHidden('paternity')).toBe(true);
  });

  it('annual does NOT hide reason', () => {
    expect(isReasonHidden('annual')).toBe(false);
  });
});

// ── Form validation ──────────────────────────────────────────────

describe('Form validation', () => {
  it('requires leave type', () => {
    const errs = validate({ leaveTypeId: '', startDate: '2030-01-07', endDate: '2030-01-07', reason: 'Test', reasonRequired: false });
    expect(errs.leaveType).toBe('required');
  });

  it('requires start date', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '', endDate: '2030-01-07', reason: 'Test', reasonRequired: false });
    expect(errs.startDate).toBe('required');
  });

  it('rejects past start date', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '2020-01-01', endDate: '2020-01-02', reason: 'Test', reasonRequired: false });
    expect(errs.startDate).toBe('future');
  });

  it('requires end date', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '2030-01-07', endDate: '', reason: 'Test', reasonRequired: false });
    expect(errs.endDate).toBe('required');
  });

  it('rejects end date before start date', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '2030-01-10', endDate: '2030-01-05', reason: 'Test', reasonRequired: false });
    expect(errs.endDate).toBe('afterStart');
  });

  it('requires reason when reasonRequired is true', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '2030-01-07', endDate: '2030-01-07', reason: '   ', reasonRequired: true });
    expect(errs.reason).toBe('required');
  });

  it('accepts valid form with no errors', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '2030-01-07', endDate: '2030-01-10', reason: 'Holiday', reasonRequired: true });
    expect(Object.keys(errs)).toHaveLength(0);
  });

  it('accepts blank reason when not required', () => {
    const errs = validate({ leaveTypeId: '1', startDate: '2030-01-07', endDate: '2030-01-10', reason: '', reasonRequired: false });
    expect(errs.reason).toBeUndefined();
  });
});

// ── Balance warning ──────────────────────────────────────────────

describe('Balance warning logic', () => {
  function isBalanceExceeded(workingDays, available) {
    return workingDays > available;
  }

  it('warns when requesting more days than available', () => {
    expect(isBalanceExceeded(5, 3)).toBe(true);
  });

  it('no warning when within balance', () => {
    expect(isBalanceExceeded(3, 5)).toBe(false);
  });

  it('no warning when exactly at balance', () => {
    expect(isBalanceExceeded(5, 5)).toBe(false);
  });

  it('no warning when 0 days requested', () => {
    expect(isBalanceExceeded(0, 5)).toBe(false);
  });
});

// ── i18n keys ────────────────────────────────────────────────────

const enEss = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/locales/en/ess.json'), 'utf-8'));
const frEss = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/locales/fr/ess.json'), 'utf-8'));

describe('EN i18n — Task 88 keys', () => {
  const ml = enEss.mobile?.leave;

  it('has submitSuccess key', () => {
    expect(ml.submitSuccess).toBeTruthy();
  });

  it('has cancelSuccess key', () => {
    expect(ml.cancelSuccess).toBeTruthy();
  });

  it('has noRequestsHint key', () => {
    expect(ml.noRequestsHint).toBeTruthy();
  });

  it('has workingDays (singular)', () => {
    expect(ml.workingDays).toContain('{{count}}');
  });

  it('has workingDays_plural', () => {
    expect(ml.workingDays_plural).toContain('{{count}}');
  });

  it('has holidaysExcluded (singular)', () => {
    expect(ml.holidaysExcluded).toContain('{{count}}');
  });

  it('has holidaysExcluded_plural', () => {
    expect(ml.holidaysExcluded_plural).toContain('{{count}}');
  });

  it('has pendingDays (singular)', () => {
    expect(ml.pendingDays).toContain('{{count}}');
  });

  it('has pendingDays_plural', () => {
    expect(ml.pendingDays_plural).toContain('{{count}}');
  });

  it('has status.submitted', () => {
    expect(ml.status?.submitted).toBeTruthy();
  });

  it('has status.cancelled', () => {
    expect(ml.status?.cancelled).toBeTruthy();
  });

  it('has types.unpaid', () => {
    expect(ml.types?.unpaid).toBeTruthy();
  });

  it('has all validation keys', () => {
    expect(ml.validation?.leaveTypeRequired).toBeTruthy();
    expect(ml.validation?.startDateRequired).toBeTruthy();
    expect(ml.validation?.startDateFuture).toBeTruthy();
    expect(ml.validation?.endDateRequired).toBeTruthy();
    expect(ml.validation?.endDateAfterStart).toBeTruthy();
    expect(ml.validation?.reasonRequired).toBeTruthy();
  });
});

describe('FR i18n — Task 88 keys', () => {
  const ml = frEss.mobile?.leave;

  it('has submitSuccess key', () => {
    expect(ml.submitSuccess).toBeTruthy();
  });

  it('has cancelSuccess key', () => {
    expect(ml.cancelSuccess).toBeTruthy();
  });

  it('has noRequestsHint key', () => {
    expect(ml.noRequestsHint).toBeTruthy();
  });

  it('has workingDays and plural', () => {
    expect(ml.workingDays).toContain('{{count}}');
    expect(ml.workingDays_plural).toContain('{{count}}');
  });

  it('has all validation keys', () => {
    expect(ml.validation?.leaveTypeRequired).toBeTruthy();
    expect(ml.validation?.startDateRequired).toBeTruthy();
    expect(ml.validation?.startDateFuture).toBeTruthy();
    expect(ml.validation?.endDateRequired).toBeTruthy();
    expect(ml.validation?.endDateAfterStart).toBeTruthy();
    expect(ml.validation?.reasonRequired).toBeTruthy();
  });

  it('has status.submitted and status.cancelled', () => {
    expect(ml.status?.submitted).toBeTruthy();
    expect(ml.status?.cancelled).toBeTruthy();
  });
});

// ── requests namespace keys ──────────────────────────────────────

describe('requests namespace — balanceWarning and cancelConfirm', () => {
  it('EN has balanceWarning', () => {
    expect(enEss.requests?.balanceWarning).toBeTruthy();
  });

  it('EN has cancelConfirm', () => {
    expect(enEss.requests?.cancelConfirm).toBeTruthy();
  });

  it('FR has balanceWarning', () => {
    expect(frEss.requests?.balanceWarning).toBeTruthy();
  });

  it('FR has cancelConfirm', () => {
    expect(frEss.requests?.cancelConfirm).toBeTruthy();
  });
});

// ── Source structural assertions ─────────────────────────────────

const componentSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/pages/ess/mobile/MobileRequestsPage.jsx'),
  'utf-8'
);

describe('MobileRequestsPage source structure', () => {
  it('imports useEssLeaveBalance from useEssRequests', () => {
    expect(componentSrc).toMatch(/useEssLeaveBalance[\s\S]*from\s+['"].*useEssRequests['"]/);
  });

  it('imports useEssLeaveTypes from useEssRequests', () => {
    expect(componentSrc).toMatch(/useEssLeaveTypes/);
  });

  it('imports useEssLeaveRequests from useEssRequests', () => {
    expect(componentSrc).toMatch(/useEssLeaveRequests[\s\S]*from\s+['"].*useEssRequests['"]/);
  });

  it('imports useSubmitLeaveRequest from useEssRequests', () => {
    expect(componentSrc).toMatch(/useSubmitLeaveRequest/);
  });

  it('imports useCancelLeaveRequest from useEssRequests', () => {
    expect(componentSrc).toMatch(/useCancelLeaveRequest/);
  });

  it('imports calculateWorkingDays from dateUtils', () => {
    expect(componentSrc).toMatch(/calculateWorkingDays[\s\S]*from\s+['"].*dateUtils['"]/);
  });

  it('does NOT import from old useEssLeaveBalance hook', () => {
    expect(componentSrc).not.toMatch(/from\s+['"].*useEssLeaveBalance['"]/);
  });

  it('does NOT import from old useEssLeaveRequests hook', () => {
    expect(componentSrc).not.toMatch(/from\s+['"].*\/useEssLeaveRequests['"]/);
  });

  it('has data-testid="requests-page"', () => {
    expect(componentSrc).toContain('data-testid="requests-page"');
  });

  it('has data-testid="leave-balance-cards"', () => {
    expect(componentSrc).toContain('data-testid="leave-balance-cards"');
  });

  it('has data-testid="new-request-fab"', () => {
    expect(componentSrc).toContain('data-testid="new-request-fab"');
  });

  it('has data-testid="new-request-form"', () => {
    expect(componentSrc).toContain('data-testid="new-request-form"');
  });

  it('has data-testid="working-days-preview"', () => {
    expect(componentSrc).toContain('data-testid="working-days-preview"');
  });

  it('has data-testid="balance-warning"', () => {
    expect(componentSrc).toContain('data-testid="balance-warning"');
  });

  it('has data-testid="cancel-request-btn"', () => {
    expect(componentSrc).toContain('data-testid="cancel-request-btn"');
  });

  it('has data-testid="requests-empty"', () => {
    expect(componentSrc).toContain('data-testid="requests-empty"');
  });

  it('has data-testid="form-toast"', () => {
    expect(componentSrc).toContain('data-testid="form-toast"');
  });

  it('has data-testid="status-chip"', () => {
    expect(componentSrc).toContain('data-testid="status-chip"');
  });

  it('uses role="progressbar"', () => {
    expect(componentSrc).toContain('role="progressbar"');
  });

  it('uses role="dialog" and aria-modal="true"', () => {
    expect(componentSrc).toContain('role="dialog"');
    expect(componentSrc).toContain('aria-modal="true"');
  });

  it('uses aria-pressed for leave type pills', () => {
    expect(componentSrc).toContain('aria-pressed');
  });

  it('uses role="alert" for validation errors', () => {
    expect(componentSrc).toContain('role="alert"');
  });

  it('uses role="status" for toast', () => {
    expect(componentSrc).toContain('role="status"');
  });

  it('uses Magenta gradient', () => {
    expect(componentSrc).toContain('#da336b');
    expect(componentSrc).toContain('#8b2044');
  });

  it('exports MobileRequestsPage as named export', () => {
    expect(componentSrc).toMatch(/export\s+const\s+MobileRequestsPage/);
  });

  it('renders pending badge', () => {
    expect(componentSrc).toContain('pendingDays');
  });

  it('has noRequestsHint in empty state', () => {
    expect(componentSrc).toContain('noRequestsHint');
  });

  it('calls window.confirm for cancel', () => {
    expect(componentSrc).toContain('window.confirm');
  });
});
