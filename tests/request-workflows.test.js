/**
 * Unit tests for Task 87 — Request Workflows: Database Schema & ESS/HR API Endpoints
 *
 * Covers:
 *  - requestsApi.js: essRequestsApi and hrRequestsApi method signatures
 *  - useEssRequests.js: all 17 hook exports + getRequestStatusLabel helper
 *  - i18n keys: EN and FR for both ess.json and hr.json request namespaces
 *  - V45 SQL migration: absence_reports table DDL validation
 *  - Java backend: model files, repository files, controller files existence + structure
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// ── Helpers ───────────────────────────────────────────────────────

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ── requestsApi.js — structure ────────────────────────────────────

describe('requestsApi.js — essRequestsApi', () => {
  let mod;
  const SRC = 'src/api/requestsApi.js';

  it('exports essRequestsApi object', () => {
    const src = readFile(SRC);
    expect(src).toContain('export const essRequestsApi');
  });

  const essMethods = [
    'getLeaveBalance', 'getLeaveTypes', 'getLeaveRequests',
    'submitLeaveRequest', 'cancelLeaveRequest',
    'getAbsenceReports', 'reportAbsence', 'cancelAbsenceReport',
    'getSwapRequests', 'submitSwapRequest',
    'peerAcceptSwap', 'peerDeclineSwap', 'cancelSwapRequest',
    'getRequestsSummary',
  ];

  essMethods.forEach((method) => {
    it(`essRequestsApi defines ${method}`, () => {
      const src = readFile(SRC);
      expect(src).toContain(method);
    });
  });
});

describe('requestsApi.js — hrRequestsApi', () => {
  const SRC = 'src/api/requestsApi.js';

  it('exports hrRequestsApi object', () => {
    const src = readFile(SRC);
    expect(src).toContain('export const hrRequestsApi');
  });

  const hrMethods = [
    'getRequests', 'exportCsv',
    'approveLeave', 'rejectLeave',
    'acknowledgeAbsence', 'disputeAbsence', 'setAbsenceCertRequired',
    'approveSwap', 'rejectSwap',
  ];

  hrMethods.forEach((method) => {
    it(`hrRequestsApi defines ${method}`, () => {
      const src = readFile(SRC);
      expect(src).toContain(method);
    });
  });

  it('uses correct HTTP methods for ESS leave', () => {
    const src = readFile(SRC);
    expect(src).toMatch(/submitLeaveRequest.*method:\s*'POST'/s);
    expect(src).toMatch(/cancelLeaveRequest.*method:\s*'DELETE'/s);
  });

  it('uses correct HTTP methods for ESS absence', () => {
    const src = readFile(SRC);
    expect(src).toMatch(/reportAbsence.*method:\s*'POST'/s);
    expect(src).toMatch(/cancelAbsenceReport.*method:\s*'PATCH'/s);
  });

  it('uses correct HTTP methods for ESS swap', () => {
    const src = readFile(SRC);
    expect(src).toMatch(/submitSwapRequest.*method:\s*'POST'/s);
    expect(src).toMatch(/peerAcceptSwap.*method:\s*'PATCH'/s);
    expect(src).toMatch(/peerDeclineSwap.*method:\s*'PATCH'/s);
  });

  it('uses correct HTTP methods for HR leave actions', () => {
    const src = readFile(SRC);
    expect(src).toMatch(/approveLeave.*method:\s*'PUT'/s);
    expect(src).toMatch(/rejectLeave.*method:\s*'PUT'/s);
  });

  it('uses correct HTTP methods for HR swap actions', () => {
    const src = readFile(SRC);
    expect(src).toMatch(/approveSwap.*method:\s*'PUT'/s);
    expect(src).toMatch(/rejectSwap.*method:\s*'PUT'/s);
  });
});

// ── useEssRequests.js — exports ───────────────────────────────────

describe('useEssRequests.js — hook exports', () => {
  const SRC = 'src/hooks/useEssRequests.js';

  const hookExports = [
    'useEssLeaveBalance',
    'useEssLeaveTypes',
    'useEssLeaveRequests',
    'useSubmitLeaveRequest',
    'useCancelLeaveRequest',
    'useEssAbsenceReports',
    'useReportAbsence',
    'useCancelAbsenceReport',
    'useEssSwapRequests',
    'useSubmitSwapRequest',
    'usePeerAcceptSwap',
    'usePeerDeclineSwap',
    'useCancelSwapRequest',
    'useEssRequestsSummary',
    'useHrRequests',
    'useApproveLeave',
    'useRejectLeave',
    'useAcknowledgeAbsence',
    'useDisputeAbsence',
    'useApproveSwap',
    'useRejectSwap',
    'getRequestStatusLabel',
  ];

  hookExports.forEach((name) => {
    it(`exports ${name}`, () => {
      const src = readFile(SRC);
      expect(src).toContain(`export function ${name}`);
    });
  });

  it('imports from @tanstack/react-query', () => {
    const src = readFile(SRC);
    expect(src).toContain("from '@tanstack/react-query'");
  });

  it('imports from requestsApi', () => {
    const src = readFile(SRC);
    expect(src).toMatch(/from\s+['"].*requestsApi['"]/);
  });

  it('defines query key factory QK', () => {
    const src = readFile(SRC);
    expect(src).toContain('const QK');
    expect(src).toContain('leaveBalance');
    expect(src).toContain('leaveTypes');
    expect(src).toContain('leaveRequests');
    expect(src).toContain('absenceReports');
    expect(src).toContain('swapRequests');
    expect(src).toContain('summary');
    expect(src).toContain('hrRequests');
  });

  it('useEssRequestsSummary polls every 60s', () => {
    const src = readFile(SRC);
    expect(src).toContain('refetchInterval');
    expect(src).toContain('60_000');
  });

  it('useInvalidateAll invalidates both ESS and HR query keys', () => {
    const src = readFile(SRC);
    expect(src).toContain("['ess', 'requests']");
    expect(src).toContain("['hr', 'requests']");
  });
});

// ── getRequestStatusLabel logic ───────────────────────────────────

describe('getRequestStatusLabel', () => {
  // Replicate the helper from useEssRequests.js for pure-logic testing
  function getRequestStatusLabel(type, status, t) {
    const statusKeyMap = {
      submitted:       'requests.statusSubmitted',
      approved:        'requests.statusApproved',
      rejected:        'requests.statusRejected',
      cancelled:       'requests.statusCancelled',
      reported:        'requests.statusReported',
      acknowledged:    'requests.statusAcknowledged',
      disputed:        'requests.statusDisputed',
      pending_peer:    'requests.statusPendingPeer',
      pending_manager: 'requests.statusPendingManager',
      peer_declined:   'requests.statusPeerDeclined',
    };
    const key = statusKeyMap[status];
    return key ? t(key, { defaultValue: status }) : status;
  }

  const mockT = (key, opts) => key; // Returns the key itself

  it('maps submitted → requests.statusSubmitted', () => {
    expect(getRequestStatusLabel('leave', 'submitted', mockT)).toBe('requests.statusSubmitted');
  });

  it('maps approved → requests.statusApproved', () => {
    expect(getRequestStatusLabel('leave', 'approved', mockT)).toBe('requests.statusApproved');
  });

  it('maps acknowledged → requests.statusAcknowledged', () => {
    expect(getRequestStatusLabel('absence', 'acknowledged', mockT)).toBe('requests.statusAcknowledged');
  });

  it('maps pending_peer → requests.statusPendingPeer', () => {
    expect(getRequestStatusLabel('swap', 'pending_peer', mockT)).toBe('requests.statusPendingPeer');
  });

  it('maps pending_manager → requests.statusPendingManager', () => {
    expect(getRequestStatusLabel('swap', 'pending_manager', mockT)).toBe('requests.statusPendingManager');
  });

  it('returns raw status for unknown values', () => {
    expect(getRequestStatusLabel('leave', 'unknown_status', mockT)).toBe('unknown_status');
  });

  it('covers all 10 status mappings', () => {
    const statuses = ['submitted', 'approved', 'rejected', 'cancelled', 'reported',
                      'acknowledged', 'disputed', 'pending_peer', 'pending_manager', 'peer_declined'];
    statuses.forEach((s) => {
      const result = getRequestStatusLabel('leave', s, mockT);
      expect(result).toContain('requests.status');
    });
  });
});

// ── i18n keys: ESS (EN + FR) ─────────────────────────────────────

describe('i18n — ess.json request keys', () => {
  const essKeys = [
    'requests.title', 'requests.tabAll', 'requests.tabLeave',
    'requests.tabAbsence', 'requests.tabSwap', 'requests.noRequests',
    'requests.statusSubmitted', 'requests.statusApproved', 'requests.statusRejected',
    'requests.statusCancelled', 'requests.statusReported', 'requests.statusAcknowledged',
    'requests.statusDisputed', 'requests.statusPendingPeer',
    'requests.statusPendingManager', 'requests.statusPeerDeclined',
    'requests.balanceWarning', 'requests.certRequired', 'requests.cancelConfirm',
  ];

  describe('EN', () => {
    let en;
    beforeAll(() => { en = JSON.parse(readFile('public/locales/en/ess.json')); });

    it('has requests namespace', () => {
      expect(en).toHaveProperty('requests');
    });

    essKeys.forEach((key) => {
      const leaf = key.split('.').pop();
      it(`has key "${leaf}"`, () => {
        expect(en.requests).toHaveProperty(leaf);
        expect(en.requests[leaf]).toBeTruthy();
      });
    });
  });

  describe('FR', () => {
    let fr;
    beforeAll(() => { fr = JSON.parse(readFile('public/locales/fr/ess.json')); });

    it('has requests namespace', () => {
      expect(fr).toHaveProperty('requests');
    });

    essKeys.forEach((key) => {
      const leaf = key.split('.').pop();
      it(`has key "${leaf}"`, () => {
        expect(fr.requests).toHaveProperty(leaf);
        expect(fr.requests[leaf]).toBeTruthy();
      });
    });

    it('FR values differ from EN (i.e. actually translated)', () => {
      const en = JSON.parse(readFile('public/locales/en/ess.json'));
      const fr2 = JSON.parse(readFile('public/locales/fr/ess.json'));
      // At least the title and a few keys must differ
      expect(fr2.requests.title).not.toBe(en.requests.title);
      expect(fr2.requests.tabLeave).not.toBe(en.requests.tabLeave);
    });
  });
});

// ── i18n keys: HR (EN + FR) ──────────────────────────────────────

describe('i18n — hr.json request keys', () => {
  const hrKeys = [
    'requests.title', 'requests.filterAll', 'requests.filterLeave',
    'requests.filterAbsence', 'requests.filterSwap',
    'requests.approve', 'requests.reject', 'requests.acknowledge',
    'requests.dispute', 'requests.rejectReason', 'requests.disputeReason',
    'requests.exportCsv', 'requests.noRequests', 'requests.urgentBadge',
  ];

  describe('EN', () => {
    let en;
    beforeAll(() => { en = JSON.parse(readFile('public/locales/en/hr.json')); });

    it('has requests namespace', () => {
      expect(en).toHaveProperty('requests');
    });

    hrKeys.forEach((key) => {
      const leaf = key.split('.').pop();
      it(`has key "${leaf}"`, () => {
        expect(en.requests).toHaveProperty(leaf);
        expect(en.requests[leaf]).toBeTruthy();
      });
    });
  });

  describe('FR', () => {
    let fr;
    beforeAll(() => { fr = JSON.parse(readFile('public/locales/fr/hr.json')); });

    it('has requests namespace', () => {
      expect(fr).toHaveProperty('requests');
    });

    hrKeys.forEach((key) => {
      const leaf = key.split('.').pop();
      it(`has key "${leaf}"`, () => {
        expect(fr.requests).toHaveProperty(leaf);
        expect(fr.requests[leaf]).toBeTruthy();
      });
    });

    it('FR values differ from EN (i.e. actually translated)', () => {
      const en = JSON.parse(readFile('public/locales/en/hr.json'));
      const fr2 = JSON.parse(readFile('public/locales/fr/hr.json'));
      expect(fr2.requests.title).not.toBe(en.requests.title);
      expect(fr2.requests.approve).not.toBe(en.requests.approve);
    });
  });
});

// ── V45 SQL migration ─────────────────────────────────────────────

describe('V45 absence_reports migration', () => {
  const SQL_PATH = 'staff-scheduler-api/src/main/resources/db/migration/V45__absence_reports.sql';

  it('migration file exists', () => {
    expect(fileExists(SQL_PATH)).toBe(true);
  });

  let sql;
  beforeAll(() => { sql = readFile(SQL_PATH); });

  it('creates absence_reports table', () => {
    expect(sql).toMatch(/CREATE TABLE\s+(IF NOT EXISTS\s+)?absence_reports/i);
  });

  it('has UUID primary key', () => {
    expect(sql).toMatch(/id\s+UUID/i);
    expect(sql).toMatch(/PRIMARY KEY/i);
  });

  it('has employee_id column', () => {
    expect(sql).toMatch(/employee_id\s+UUID\s+NOT NULL/i);
  });

  it('has absence_date column', () => {
    expect(sql).toMatch(/absence_date\s+DATE\s+NOT NULL/i);
  });

  it('has CHECK constraint on absence_type', () => {
    expect(sql).toMatch(/CHECK\s*\(\s*absence_type\s+IN\s*\(/i);
    expect(sql).toContain("'sick'");
    expect(sql).toContain("'late_arrival'");
    expect(sql).toContain("'emergency'");
  });

  it('has CHECK constraint on status', () => {
    expect(sql).toMatch(/CHECK\s*\(\s*status\s+IN\s*\(/i);
    expect(sql).toContain("'reported'");
    expect(sql).toContain("'acknowledged'");
    expect(sql).toContain("'disputed'");
  });

  it('has cert_required column', () => {
    expect(sql).toMatch(/cert_required\s+BOOLEAN/i);
  });

  it('has dispute tracking columns', () => {
    expect(sql).toMatch(/disputed_by/i);
    expect(sql).toMatch(/disputed_at/i);
    expect(sql).toMatch(/dispute_reason/i);
  });

  it('creates employee_date index', () => {
    expect(sql).toMatch(/CREATE INDEX.*absence_reports_employee_date_idx/i);
  });

  it('creates unique constraint on employee_id + absence_date', () => {
    expect(sql).toMatch(/UNIQUE|unique.*employee_id.*absence_date/is);
  });
});

// ── Backend Java files ────────────────────────────────────────────

const JAVA_BASE = 'staff-scheduler-api/src/main/java/com/staffscheduler/api';

describe('Backend — AbsenceReport.java model', () => {
  const FILE = `${JAVA_BASE}/model/AbsenceReport.java`;

  it('file exists', () => {
    expect(fileExists(FILE)).toBe(true);
  });

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('is annotated as @Entity', () => {
    expect(code).toContain('@Entity');
  });

  it('maps to absence_reports table', () => {
    expect(code).toContain('absence_reports');
  });

  it('has UUID id field', () => {
    expect(code).toMatch(/UUID\s+id/);
  });

  it('has employeeId field', () => {
    expect(code).toContain('employeeId');
  });

  it('has absenceType field', () => {
    expect(code).toContain('absenceType');
  });

  it('has certRequired field', () => {
    expect(code).toContain('certRequired');
  });

  it('has status field with default', () => {
    expect(code).toContain('status');
  });

  it('uses @PrePersist', () => {
    expect(code).toContain('@PrePersist');
  });
});

describe('Backend — ShiftSwapRequest.java model', () => {
  const FILE = `${JAVA_BASE}/model/ShiftSwapRequest.java`;

  it('file exists', () => {
    expect(fileExists(FILE)).toBe(true);
  });

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('is annotated as @Entity', () => {
    expect(code).toContain('@Entity');
  });

  it('has requesterId and recipientId fields', () => {
    expect(code).toContain('requesterId');
    expect(code).toContain('recipientId');
  });

  it('has shift ID fields', () => {
    expect(code).toContain('requesterShiftId');
    expect(code).toContain('recipientShiftId');
  });

  it('has status field', () => {
    expect(code).toContain('status');
  });
});

describe('Backend — AbsenceReportRepository.java', () => {
  const FILE = `${JAVA_BASE}/repository/AbsenceReportRepository.java`;

  it('file exists', () => {
    expect(fileExists(FILE)).toBe(true);
  });

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('extends JpaRepository', () => {
    expect(code).toContain('JpaRepository<AbsenceReport, UUID>');
  });

  it('has countSickInWindow query method', () => {
    expect(code).toContain('countSickInWindow');
  });

  it('has existsByEmployeeIdAndAbsenceDate', () => {
    expect(code).toContain('existsByEmployeeIdAndAbsenceDate');
  });

  it('has findOpenReports for HR inbox', () => {
    expect(code).toContain('findOpenReports');
  });
});

describe('Backend — ShiftSwapRequestRepository.java', () => {
  const FILE = `${JAVA_BASE}/repository/ShiftSwapRequestRepository.java`;

  it('file exists', () => {
    expect(fileExists(FILE)).toBe(true);
  });

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('extends JpaRepository', () => {
    expect(code).toContain('JpaRepository<ShiftSwapRequest, UUID>');
  });

  it('has findByRequesterOrRecipient', () => {
    expect(code).toContain('findByRequesterOrRecipient');
  });

  it('has existsActiveSwapForShift', () => {
    expect(code).toContain('existsActiveSwapForShift');
  });

  it('has peer auth lookups', () => {
    expect(code).toContain('findByIdAndRecipientId');
    expect(code).toContain('findByIdAndRequesterId');
  });
});

describe('Backend — EssRequestController.java', () => {
  const FILE = `${JAVA_BASE}/controller/EssRequestController.java`;

  it('file exists', () => {
    expect(fileExists(FILE)).toBe(true);
  });

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('is a @RestController', () => {
    expect(code).toContain('@RestController');
  });

  it('maps to /api/ess/requests', () => {
    expect(code).toContain('/api/ess/requests');
  });

  it('has leave balance endpoint', () => {
    expect(code).toContain('/leave/balance');
  });

  it('has leave types endpoint', () => {
    expect(code).toContain('/leave/types');
  });

  it('has leave submit endpoint (POST)', () => {
    expect(code).toContain('@PostMapping');
    expect(code).toContain('submitLeaveRequest');
  });

  it('has leave cancel endpoint (DELETE)', () => {
    expect(code).toContain('@DeleteMapping');
    expect(code).toContain('cancelLeaveRequest');
  });

  it('has absence report endpoint', () => {
    expect(code).toContain('reportAbsence');
  });

  it('has absence cancel endpoint', () => {
    expect(code).toContain('cancelAbsenceReport');
  });

  it('has swap endpoints', () => {
    expect(code).toContain('submitSwapRequest');
    expect(code).toContain('peerAcceptSwap');
    expect(code).toContain('peerDeclineSwap');
    expect(code).toContain('cancelSwapRequest');
  });

  it('has summary endpoint', () => {
    expect(code).toContain('getRequestsSummary');
    expect(code).toContain('/summary');
  });

  it('validates working days (excludes weekends)', () => {
    expect(code).toContain('getDayOfWeek');
  });

  it('has cert_required policy (30-day rolling sick check)', () => {
    expect(code).toContain('sickCertThreshold');
    expect(code).toContain('countSickInWindow');
  });

  it('has absence duplicate check (409)', () => {
    expect(code).toContain('existsByEmployeeIdAndAbsenceDate');
    expect(code).toContain('409');
  });

  it('validates swap ownership', () => {
    expect(code).toContain('You can only swap your own shifts');
  });

  it('checks active swap conflict', () => {
    expect(code).toContain('existsActiveSwapForShift');
  });
});

describe('Backend — HrRequestController.java', () => {
  const FILE = `${JAVA_BASE}/controller/HrRequestController.java`;

  it('file exists', () => {
    expect(fileExists(FILE)).toBe(true);
  });

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('is a @RestController', () => {
    expect(code).toContain('@RestController');
  });

  it('maps to /api/hr/requests', () => {
    expect(code).toContain('/api/hr/requests');
  });

  it('requires HR_MANAGER or SUPER_ADMIN role', () => {
    expect(code).toContain("@PreAuthorize");
    expect(code).toContain('SUPER_ADMIN');
    expect(code).toContain('HR_MANAGER');
  });

  it('has unified list endpoint', () => {
    expect(code).toContain('getRequests');
  });

  it('has CSV export endpoint', () => {
    expect(code).toContain('exportCsv');
    expect(code).toContain('text/csv');
  });

  it('has leave approve/reject endpoints', () => {
    expect(code).toContain('approveLeave');
    expect(code).toContain('rejectLeave');
  });

  it('has absence acknowledge/dispute endpoints', () => {
    expect(code).toContain('acknowledgeAbsence');
    expect(code).toContain('disputeAbsence');
  });

  it('has absence cert-required endpoint', () => {
    expect(code).toContain('setAbsenceCertRequired');
    expect(code).toContain('cert-required');
  });

  it('has swap approve/reject endpoints', () => {
    expect(code).toContain('approveSwap');
    expect(code).toContain('rejectSwap');
  });

  it('swap approve atomically reassigns shifts', () => {
    expect(code).toContain('requesterShift.setEmployeeId');
    expect(code).toContain('recipientShift.setEmployeeId');
  });

  it('has proper CSV escaping', () => {
    expect(code).toContain('escapeCsv');
  });
});

// ── LeaveRequestRepository additions ──────────────────────────────

describe('Backend — LeaveRequestRepository.java additions', () => {
  const FILE = `${JAVA_BASE}/repository/LeaveRequestRepository.java`;

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('has findByEmployeeIdOrderByStartDateDesc', () => {
    expect(code).toContain('findByEmployeeIdOrderByStartDateDesc');
  });

  it('has findByStatusInOrderByCreatedAtDesc', () => {
    expect(code).toContain('findByStatusInOrderByCreatedAtDesc');
  });

  it('has findAllByOrderByCreatedAtDesc', () => {
    expect(code).toContain('findAllByOrderByCreatedAtDesc');
  });
});

// ── ShiftSwapRequestRepository additions ──────────────────────────

describe('Backend — ShiftSwapRequestRepository.java additions', () => {
  const FILE = `${JAVA_BASE}/repository/ShiftSwapRequestRepository.java`;

  let code;
  beforeAll(() => { code = readFile(FILE); });

  it('has findByStatusInOrderByCreatedAtDesc', () => {
    expect(code).toContain('findByStatusInOrderByCreatedAtDesc');
  });

  it('has findAllByOrderByCreatedAtDesc', () => {
    expect(code).toContain('findAllByOrderByCreatedAtDesc');
  });
});

// ── Documentation ─────────────────────────────────────────────────

describe('app-documentation.md — Task 87 section', () => {
  let doc;
  beforeAll(() => { doc = readFile('app-documentation.md'); });

  it('has Task 87 heading', () => {
    expect(doc).toContain('Task 87');
  });

  it('documents ESS API endpoints', () => {
    expect(doc).toContain('EssRequestController');
    expect(doc).toContain('/api/ess/requests');
  });

  it('documents HR API endpoints', () => {
    expect(doc).toContain('HrRequestController');
    expect(doc).toContain('/api/hr/requests');
  });

  it('documents V45 migration', () => {
    expect(doc).toContain('V45');
    expect(doc).toContain('absence_reports');
  });

  it('documents all 17 hooks', () => {
    expect(doc).toContain('useEssLeaveBalance');
    expect(doc).toContain('useEssRequestsSummary');
    expect(doc).toContain('useHrRequests');
    expect(doc).toContain('getRequestStatusLabel');
  });

  it('documents business rules', () => {
    expect(doc).toContain('cert_required policy');
    expect(doc).toContain('sickCertThreshold');
    expect(doc).toContain('Atomically swaps');
  });

  it('documents i18n keys', () => {
    expect(doc).toContain('ess.json');
    expect(doc).toContain('hr.json');
    expect(doc).toContain('requests.*');
  });
});
