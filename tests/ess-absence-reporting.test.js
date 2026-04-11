/**
 * Task 89 — ESS Absence Reporting (Mobile)
 *
 * Tests for:
 * - Sub-tab navigation (Leave/Absence/Swap pills)
 * - Report Absence form validation
 * - Absence list rendering
 * - Certificate upload mechanics
 * - Same-day cancel logic
 * - i18n absence keys
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ── i18n ──────────────────────────────────────────────────────────

const enJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/locales/en/ess.json'), 'utf8'));
const frJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/locales/fr/ess.json'), 'utf8'));

function flatten(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) keys.push(...flatten(v, p));
    else keys.push(p);
  }
  return keys;
}

const enAbsence = flatten(enJson.mobile?.absence || {}, 'mobile.absence');
const frAbsence = flatten(frJson.mobile?.absence || {}, 'mobile.absence');

describe('i18n — mobile.absence keys', () => {
  it('EN has at least 35 absence keys', () => {
    expect(enAbsence.length).toBeGreaterThanOrEqual(35);
  });

  it('FR has same count as EN', () => {
    expect(frAbsence.length).toBe(enAbsence.length);
  });

  it('every EN absence key has FR translation', () => {
    const missing = enAbsence.filter(k => !frAbsence.includes(k));
    expect(missing).toEqual([]);
  });

  const requiredKeys = [
    'mobile.absence.title',
    'mobile.absence.dateLabel',
    'mobile.absence.typeLabel',
    'mobile.absence.expectedStart',
    'mobile.absence.actualArrival',
    'mobile.absence.reason',
    'mobile.absence.submitReport',
    'mobile.absence.submitSuccess',
    'mobile.absence.duplicateDate',
    'mobile.absence.certRequired',
    'mobile.absence.certRequiredToast',
    'mobile.absence.certUploadHint',
    'mobile.absence.certUploaded',
    'mobile.absence.upload',
    'mobile.absence.cancel',
    'mobile.absence.cancelSuccess',
    'mobile.absence.noAbsences',
    'mobile.absence.noAbsencesHint',
    'mobile.absence.newReportAriaLabel',
    'mobile.absence.type.sick',
    'mobile.absence.type.late_arrival',
    'mobile.absence.type.emergency',
    'mobile.absence.type.personal',
    'mobile.absence.type.other',
    'mobile.absence.status.reported',
    'mobile.absence.status.acknowledged',
    'mobile.absence.status.disputed',
    'mobile.absence.status.cancelled',
    'mobile.absence.validation.dateRequired',
    'mobile.absence.validation.dateFuture',
    'mobile.absence.validation.typeRequired',
    'mobile.absence.validation.expectedStartRequired',
    'mobile.absence.validation.actualArrivalRequired',
    'mobile.absence.validation.actualAfterExpected',
    'mobile.absence.validation.reasonRequired',
  ];

  it.each(requiredKeys)('EN has key: %s', (key) => {
    expect(enAbsence).toContain(key);
  });
});

// ── Sub-tab keys ──────────────────────────────────────────────────

describe('i18n — sub-tab keys from task-87', () => {
  it('requests.tabLeave exists in EN', () => {
    expect(enJson.requests?.tabLeave).toBeTruthy();
  });
  it('requests.tabAbsence exists in EN', () => {
    expect(enJson.requests?.tabAbsence).toBeTruthy();
  });
  it('requests.tabSwap exists in EN', () => {
    expect(enJson.requests?.tabSwap).toBeTruthy();
  });
});

// ── Component source structure ────────────────────────────────────

const pageSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/pages/ess/mobile/MobileRequestsPage.jsx'), 'utf8'
);

describe('MobileRequestsPage — sub-tab navigation', () => {
  it('defines REQUEST_TABS constant with leave, absence, swap', () => {
    expect(pageSrc).toContain("REQUEST_TABS");
    expect(pageSrc).toMatch(/key:\s*'leave'/);
    expect(pageSrc).toMatch(/key:\s*'absence'/);
    expect(pageSrc).toMatch(/key:\s*'swap'/);
  });

  it('renders role="tablist"', () => {
    expect(pageSrc).toContain('role="tablist"');
  });

  it('renders individual tabs with role="tab"', () => {
    expect(pageSrc).toContain('role="tab"');
  });

  it('uses aria-selected for active tab', () => {
    expect(pageSrc).toContain('aria-selected');
  });

  it('renders tabpanel', () => {
    expect(pageSrc).toContain('role="tabpanel"');
  });
});

describe('MobileRequestsPage — AbsenceTab component', () => {
  it('defines AbsenceTab component', () => {
    expect(pageSrc).toMatch(/const\s+AbsenceTab\s*=/);
  });

  it('calls useEssAbsenceReports', () => {
    expect(pageSrc).toContain('useEssAbsenceReports');
  });

  it('calls useCancelAbsenceReport', () => {
    expect(pageSrc).toContain('useCancelAbsenceReport');
  });

  it('calls useUploadAbsenceCert', () => {
    expect(pageSrc).toContain('useUploadAbsenceCert');
  });

  it('has a report absence FAB', () => {
    expect(pageSrc).toContain('data-testid="report-absence-fab"');
  });

  it('has file input for cert upload', () => {
    expect(pageSrc).toContain('data-testid="cert-file-input"');
  });

  it('accepts pdf, jpg, jpeg, png file types', () => {
    expect(pageSrc).toContain('.pdf,.jpg,.jpeg,.png');
  });
});

describe('MobileRequestsPage — ReportAbsenceSheet', () => {
  it('defines ReportAbsenceSheet component', () => {
    expect(pageSrc).toMatch(/const\s+ReportAbsenceSheet\s*=/);
  });

  it('renders a form with data-testid="report-absence-form"', () => {
    expect(pageSrc).toContain('data-testid="report-absence-form"');
  });

  it('has date input constrained to today max', () => {
    expect(pageSrc).toContain('max={todayString()}');
    expect(pageSrc).toContain('data-testid="absence-date-input"');
  });

  it('defines 5 absence types', () => {
    expect(pageSrc).toContain("'sick'");
    expect(pageSrc).toContain("'late_arrival'");
    expect(pageSrc).toContain("'emergency'");
    expect(pageSrc).toContain("'personal'");
    expect(pageSrc).toContain("'other'");
  });

  it('shows time pickers only for late_arrival', () => {
    expect(pageSrc).toMatch(/showTimePickers\s*=\s*absenceType\s*===\s*'late_arrival'/);
  });

  it('validates: date required, future, type required', () => {
    expect(pageSrc).toContain('validation.dateRequired');
    expect(pageSrc).toContain('validation.dateFuture');
    expect(pageSrc).toContain('validation.typeRequired');
  });

  it('handles 409 conflict (duplicate date)', () => {
    expect(pageSrc).toContain('status === 409');
    expect(pageSrc).toContain('duplicateDate');
  });

  it('handles certRequired response', () => {
    expect(pageSrc).toContain('certRequired');
    expect(pageSrc).toContain('certRequiredToast');
  });

  it('has submit button with testid', () => {
    expect(pageSrc).toContain('data-testid="submit-absence-btn"');
  });
});

describe('MobileRequestsPage — AbsenceList', () => {
  it('defines AbsenceList component', () => {
    expect(pageSrc).toMatch(/const\s+AbsenceList\s*=/);
  });

  it('renders absence rows with data-testid="absence-row"', () => {
    expect(pageSrc).toContain('data-testid="absence-row"');
  });

  it('renders status chips', () => {
    expect(pageSrc).toContain('data-testid="absence-status-chip"');
  });

  it('shows empty state when no absences', () => {
    expect(pageSrc).toContain('data-testid="absences-empty"');
  });

  it('cancel button only for same-day reported absences', () => {
    expect(pageSrc).toMatch(/status\s*===\s*'reported'\s*&&.*todayString/);
  });

  it('has cancel button with testid', () => {
    expect(pageSrc).toContain('data-testid="cancel-absence-btn"');
  });
});

describe('MobileRequestsPage — Certificate upload', () => {
  it('shows cert-required-badge when certRequired && !certUploaded', () => {
    expect(pageSrc).toContain('data-testid="cert-required-badge"');
  });

  it('shows cert-uploaded-badge when certRequired && certUploaded', () => {
    expect(pageSrc).toContain('data-testid="cert-uploaded-badge"');
  });

  it('has upload button', () => {
    expect(pageSrc).toContain('data-testid="cert-upload-btn"');
  });

  it('enforces 5 MB max file size', () => {
    expect(pageSrc).toContain('5 * 1024 * 1024');
  });
});

// ── API Layer ─────────────────────────────────────────────────────

const apiSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/api/requestsApi.js'), 'utf8'
);

describe('requestsApi — absence endpoints', () => {
  it('exports uploadAbsenceCert method', () => {
    expect(apiSrc).toContain('uploadAbsenceCert');
  });

  it('uses FormData for upload', () => {
    expect(apiSrc).toContain('new FormData');
    expect(apiSrc).toContain("formData.append('file'");
  });

  it('posts to /ess/requests/absence/:id/certificate', () => {
    expect(apiSrc).toContain('/ess/requests/absence/${id}/certificate');
  });

  it('uses raw fetch (not apiFetch) for multipart', () => {
    // The upload function uses fetch() directly — verify it's not going through apiFetch
    const uploadBlock = apiSrc.split('uploadAbsenceCert')[1]?.split('},')[0] || '';
    expect(uploadBlock).toContain('fetch(url');
  });
});

// ── Hooks Layer ───────────────────────────────────────────────────

const hooksSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/hooks/useEssRequests.js'), 'utf8'
);

describe('useEssRequests — absence hooks', () => {
  it('exports useEssAbsenceReports', () => {
    expect(hooksSrc).toContain('export function useEssAbsenceReports');
  });

  it('exports useReportAbsence', () => {
    expect(hooksSrc).toContain('export function useReportAbsence');
  });

  it('exports useCancelAbsenceReport', () => {
    expect(hooksSrc).toContain('export function useCancelAbsenceReport');
  });

  it('exports useUploadAbsenceCert', () => {
    expect(hooksSrc).toContain('export function useUploadAbsenceCert');
  });
});

// ── LeaveTab separation ────────────────────────────────────────────

describe('MobileRequestsPage — LeaveTab component', () => {
  it('defines LeaveTab component', () => {
    expect(pageSrc).toMatch(/const\s+LeaveTab\s*=/);
  });

  it('LeaveTab uses useEssLeaveBalance', () => {
    expect(pageSrc).toContain('useEssLeaveBalance');
  });

  it('LeaveTab renders LeaveBalanceCards', () => {
    expect(pageSrc).toContain('LeaveBalanceCards');
  });

  it('LeaveTab renders NewRequestSheet', () => {
    expect(pageSrc).toContain('NewRequestSheet');
  });
});

// ── SwapTab placeholder ─────────────────────────────────────────────

describe('MobileRequestsPage — SwapTab placeholder', () => {
  it('defines SwapTab component', () => {
    expect(pageSrc).toMatch(/const\s+SwapTab\s*=/);
  });

  it('SwapTab shows empty state', () => {
    expect(pageSrc).toContain('data-testid="swaps-empty"');
  });
});
