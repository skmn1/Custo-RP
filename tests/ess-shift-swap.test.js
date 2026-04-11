/**
 * Task 90 — ESS Shift Swap Request (Mobile)
 *
 * Tests for:
 * - i18n swap keys (EN + FR)
 * - SwapRequestSheet in MobileSchedulePage (2-step flow)
 * - SwapTab in MobileRequestsPage (sent/received, peer actions, cancel)
 * - SwapCard and ShiftMiniCard components
 * - Colleagues API + hooks
 * - Swap status chip mapping
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

const enSwap = flatten(enJson.swap || {}, 'swap');
const frSwap = flatten(frJson.swap || {}, 'swap');

describe('i18n — swap keys', () => {
  it('EN has at least 24 swap keys', () => {
    expect(enSwap.length).toBeGreaterThanOrEqual(24);
  });

  it('FR has same count as EN', () => {
    expect(frSwap.length).toBe(enSwap.length);
  });

  it('every EN swap key has FR translation', () => {
    const missing = enSwap.filter(k => !frSwap.includes(k));
    expect(missing).toEqual([]);
  });

  const requiredKeys = [
    'swap.title',
    'swap.yourShift',
    'swap.step1',
    'swap.step2',
    'swap.searchColleague',
    'swap.shiftsThisWeek',
    'swap.noColleagueShifts',
    'swap.conflictWarning',
    'swap.reason',
    'swap.reasonPlaceholder',
    'swap.sendRequest',
    'swap.submitSuccess',
    'swap.sentRequests',
    'swap.receivedRequests',
    'swap.accept',
    'swap.decline',
    'swap.cancel',
    'swap.accepted',
    'swap.declined',
    'swap.declineConfirm',
    'swap.noSwaps',
    'swap.noSwapsHint',
    'swap.approved',
    'swap.rejected',
  ];

  it.each(requiredKeys)('EN has key: %s', (key) => {
    expect(enSwap).toContain(key);
  });
});

describe('i18n — sub-tab / status keys from task-87', () => {
  it('requests.tabSwap exists', () => {
    expect(enJson.requests?.tabSwap).toBeTruthy();
  });
  it('requests.statusPendingPeer exists', () => {
    expect(enJson.requests?.statusPendingPeer).toBeTruthy();
  });
  it('requests.statusPendingManager exists', () => {
    expect(enJson.requests?.statusPendingManager).toBeTruthy();
  });
  it('requests.statusPeerDeclined exists', () => {
    expect(enJson.requests?.statusPeerDeclined).toBeTruthy();
  });
});

// ── MobileSchedulePage source ─────────────────────────────────────

const scheduleSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/pages/ess/mobile/MobileSchedulePage.jsx'), 'utf8'
);

describe('MobileSchedulePage — swap entry point', () => {
  it('imports useSubmitSwapRequest', () => {
    expect(scheduleSrc).toContain('useSubmitSwapRequest');
  });

  it('imports useColleagues', () => {
    expect(scheduleSrc).toContain('useColleagues');
  });

  it('imports useColleagueSchedule', () => {
    expect(scheduleSrc).toContain('useColleagueSchedule');
  });

  it('ShiftCard accepts onRequestSwap prop', () => {
    expect(scheduleSrc).toContain('onRequestSwap');
  });

  it('"Request Swap" button calls onRequestSwap', () => {
    expect(scheduleSrc).toContain('onRequestSwap?.(shift)');
  });

  it('renders SwapRequestSheet', () => {
    expect(scheduleSrc).toContain('SwapRequestSheet');
  });
});

describe('MobileSchedulePage — SwapRequestSheet', () => {
  it('defines SwapRequestSheet component', () => {
    expect(scheduleSrc).toMatch(/const\s+SwapRequestSheet\s*=/);
  });

  it('has data-testid="swap-request-sheet"', () => {
    expect(scheduleSrc).toContain('data-testid="swap-request-sheet"');
  });

  it('has 2-step flow (step 1 + step 2)', () => {
    expect(scheduleSrc).toContain('data-testid="swap-step-1"');
    expect(scheduleSrc).toContain('data-testid="swap-step-2"');
  });

  it('has colleague search input', () => {
    expect(scheduleSrc).toContain('data-testid="colleague-search"');
  });

  it('colleague rows have role="option"', () => {
    expect(scheduleSrc).toContain('role="option"');
  });

  it('colleague list has role="listbox"', () => {
    expect(scheduleSrc).toContain('role="listbox"');
  });

  it('shift picker rows have role="radio" with aria-checked', () => {
    expect(scheduleSrc).toContain('role="radio"');
    expect(scheduleSrc).toContain('aria-checked');
  });

  it('shift picker has role="radiogroup"', () => {
    expect(scheduleSrc).toContain('role="radiogroup"');
  });

  it('has conflict warning for overlapping shifts', () => {
    expect(scheduleSrc).toContain('conflictWarning');
  });

  it('has reason textarea', () => {
    expect(scheduleSrc).toContain('data-testid="swap-reason"');
  });

  it('has submit button', () => {
    expect(scheduleSrc).toContain('data-testid="submit-swap-btn"');
  });

  it('navigates to requests tab=swap after submit', () => {
    expect(scheduleSrc).toContain("'/app/ess/requests?tab=swap'");
  });

  it('sorts same-department colleagues first', () => {
    expect(scheduleSrc).toContain('departmentId');
  });

  it('handles 409 conflict on submit', () => {
    expect(scheduleSrc).toContain('status === 409');
  });
});

describe('MobileSchedulePage — ShiftMiniCard', () => {
  it('defines ShiftMiniCard component', () => {
    expect(scheduleSrc).toMatch(/const\s+ShiftMiniCard\s*=/);
  });

  it('has data-testid="shift-mini-card"', () => {
    expect(scheduleSrc).toContain('data-testid="shift-mini-card"');
  });

  it('displays date, time range, and location', () => {
    expect(scheduleSrc).toContain('startTime');
    expect(scheduleSrc).toContain('endTime');
    expect(scheduleSrc).toContain('locationName');
  });
});

// ── MobileRequestsPage source ─────────────────────────────────────

const requestsSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/pages/ess/mobile/MobileRequestsPage.jsx'), 'utf8'
);

describe('MobileRequestsPage — SwapTab', () => {
  it('imports useEssSwapRequests', () => {
    expect(requestsSrc).toContain('useEssSwapRequests');
  });

  it('imports usePeerAcceptSwap', () => {
    expect(requestsSrc).toContain('usePeerAcceptSwap');
  });

  it('imports usePeerDeclineSwap', () => {
    expect(requestsSrc).toContain('usePeerDeclineSwap');
  });

  it('imports useCancelSwapRequest', () => {
    expect(requestsSrc).toContain('useCancelSwapRequest');
  });

  it('SwapTab is a full component (not placeholder)', () => {
    expect(requestsSrc).toContain('useEssSwapRequests');
    expect(requestsSrc).toContain('data-testid="swaps-content"');
  });

  it('splits swaps into sent and received', () => {
    expect(requestsSrc).toContain('requesterId');
    expect(requestsSrc).toContain('recipientId');
  });

  it('shows sent requests section', () => {
    expect(requestsSrc).toContain('swap.sentRequests');
  });

  it('shows received requests section', () => {
    expect(requestsSrc).toContain('swap.receivedRequests');
  });

  it('shows empty state with data-testid="swaps-empty"', () => {
    expect(requestsSrc).toContain('data-testid="swaps-empty"');
  });

  it('shows loading skeleton', () => {
    expect(requestsSrc).toContain('data-testid="swaps-skeleton"');
  });

  it('reads tab from URL search params', () => {
    expect(requestsSrc).toContain('useSearchParams');
    expect(requestsSrc).toContain("searchParams.get('tab')");
  });
});

describe('MobileRequestsPage — SwapCard', () => {
  it('defines SwapCard component', () => {
    expect(requestsSrc).toMatch(/const\s+SwapCard\s*=/);
  });

  it('has data-testid="swap-card"', () => {
    expect(requestsSrc).toContain('data-testid="swap-card"');
  });

  it('shows accept button for received pending_peer', () => {
    expect(requestsSrc).toContain('data-testid="swap-accept-btn"');
  });

  it('shows decline button for received pending_peer', () => {
    expect(requestsSrc).toContain('data-testid="swap-decline-btn"');
  });

  it('shows cancel button for sent pending_peer', () => {
    expect(requestsSrc).toContain('data-testid="swap-cancel-btn"');
  });

  it('accept/decline buttons have aria-label with colleague name', () => {
    expect(requestsSrc).toContain('swap.requesterName');
  });

  it('shows status chip', () => {
    expect(requestsSrc).toContain('data-testid="swap-status-chip"');
  });

  it('shows swap arrows icon', () => {
    expect(requestsSrc).toContain('swap_horiz');
  });

  it('renders reason if present', () => {
    expect(requestsSrc).toContain('swap.reason');
  });
});

describe('MobileRequestsPage — SwapShiftMini', () => {
  it('defines SwapShiftMini component', () => {
    expect(requestsSrc).toMatch(/const\s+SwapShiftMini\s*=/);
  });

  it('has data-testid="swap-shift-mini"', () => {
    expect(requestsSrc).toContain('data-testid="swap-shift-mini"');
  });
});

describe('MobileRequestsPage — swap status chip classes', () => {
  it('defines swapStatusChipClass function', () => {
    expect(requestsSrc).toContain('function swapStatusChipClass');
  });

  it('handles pending_peer status', () => {
    expect(requestsSrc).toContain("'pending_peer'");
  });

  it('handles pending_manager status', () => {
    expect(requestsSrc).toContain("'pending_manager'");
  });

  it('handles approved status', () => {
    expect(requestsSrc).toContain("'approved'");
  });

  it('handles rejected status', () => {
    expect(requestsSrc).toContain("'rejected'");
  });

  it('handles peer_declined status', () => {
    expect(requestsSrc).toContain("'peer_declined'");
  });

  it('handles cancelled status', () => {
    expect(requestsSrc).toContain("'cancelled'");
  });
});

// ── API Layer ─────────────────────────────────────────────────────

const apiSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/api/requestsApi.js'), 'utf8'
);

describe('requestsApi — swap + colleague endpoints', () => {
  it('has getColleagues method', () => {
    expect(apiSrc).toContain('getColleagues');
  });

  it('getColleagues calls /planning/employees/colleagues', () => {
    expect(apiSrc).toContain('/planning/employees/colleagues');
  });

  it('has getColleagueSchedule method', () => {
    expect(apiSrc).toContain('getColleagueSchedule');
  });

  it('getColleagueSchedule calls /planning/schedule with employeeId', () => {
    expect(apiSrc).toContain('/planning/schedule?month=');
    expect(apiSrc).toContain('employeeId');
  });

  it('has submitSwapRequest method', () => {
    expect(apiSrc).toContain('submitSwapRequest');
  });

  it('has peerAcceptSwap method', () => {
    expect(apiSrc).toContain('peerAcceptSwap');
  });

  it('has peerDeclineSwap method', () => {
    expect(apiSrc).toContain('peerDeclineSwap');
  });

  it('has cancelSwapRequest method', () => {
    expect(apiSrc).toContain('cancelSwapRequest');
  });
});

// ── Hooks Layer ───────────────────────────────────────────────────

const hooksSrc = fs.readFileSync(
  path.resolve(__dirname, '../src/hooks/useEssRequests.js'), 'utf8'
);

describe('useEssRequests — swap + colleague hooks', () => {
  it('exports useEssSwapRequests', () => {
    expect(hooksSrc).toContain('export function useEssSwapRequests');
  });

  it('exports useSubmitSwapRequest', () => {
    expect(hooksSrc).toContain('export function useSubmitSwapRequest');
  });

  it('exports usePeerAcceptSwap', () => {
    expect(hooksSrc).toContain('export function usePeerAcceptSwap');
  });

  it('exports usePeerDeclineSwap', () => {
    expect(hooksSrc).toContain('export function usePeerDeclineSwap');
  });

  it('exports useCancelSwapRequest', () => {
    expect(hooksSrc).toContain('export function useCancelSwapRequest');
  });

  it('exports useColleagues', () => {
    expect(hooksSrc).toContain('export function useColleagues');
  });

  it('exports useColleagueSchedule', () => {
    expect(hooksSrc).toContain('export function useColleagueSchedule');
  });

  it('useColleagueSchedule is disabled when no employeeId', () => {
    expect(hooksSrc).toContain('enabled:');
    expect(hooksSrc).toContain('!!employeeId');
  });

  it('useColleagueSchedule has staleTime 0 (fresh each open)', () => {
    const schedBlock = hooksSrc.split('useColleagueSchedule')[1]?.split('export')[0] || '';
    expect(schedBlock).toContain('staleTime: 0');
  });
});

// ── Decline confirmation ──────────────────────────────────────────

describe('Peer decline flow', () => {
  it('shows confirmation before declining', () => {
    expect(requestsSrc).toContain('confirm');
    expect(requestsSrc).toContain('swap.declineConfirm');
  });
});

// ── Cancel only for pending_peer ──────────────────────────────────

describe('Cancel sent swap', () => {
  it('cancel button only shown for pending_peer status', () => {
    const cancelSection = requestsSrc.split('swap-cancel-btn')[0]?.split('swap.status').pop() || '';
    expect(cancelSection).toContain("'pending_peer'");
  });
});
