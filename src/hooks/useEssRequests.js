/**
 * useEssRequests — Task 87
 *
 * React Query hooks for the Request Workflows feature.
 * Covers leave requests, absence reports, and shift swaps for both
 * the ESS employee-facing layer and the HR management layer.
 *
 * All mutations invalidate:
 *   ['ess', 'requests', '*'] — ESS-side cached lists
 *   ['hr', 'requests']       — HR inbox
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { essRequestsApi, hrRequestsApi } from '../api/requestsApi';

// ── Query key factory ─────────────────────────────────────────────

const QK = {
  leaveBalance:    () => ['ess', 'requests', 'leave', 'balance'],
  leaveTypes:      () => ['ess', 'requests', 'leave', 'types'],
  leaveRequests:   (f) => ['ess', 'requests', 'leave', 'list', f ?? {}],
  absenceReports:  (f) => ['ess', 'requests', 'absence', 'list', f ?? {}],
  swapRequests:    () => ['ess', 'requests', 'swap', 'list'],
  summary:         () => ['ess', 'requests', 'summary'],
  hrRequests:      (f) => ['hr', 'requests', f ?? {}],
};

/**
 * Invalidate all ESS request lists + HR inbox after any mutation.
 */
function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['ess', 'requests'] });
    qc.invalidateQueries({ queryKey: ['hr', 'requests'] });
  };
}

// ── ESS — Leave ───────────────────────────────────────────────────

/** GET /api/ess/requests/leave/balance */
export function useEssLeaveBalance() {
  return useQuery({
    queryKey: QK.leaveBalance(),
    queryFn:  () => essRequestsApi.getLeaveBalance(),
    staleTime: 5 * 60 * 1000,
  });
}

/** GET /api/ess/requests/leave/types */
export function useEssLeaveTypes() {
  return useQuery({
    queryKey: QK.leaveTypes(),
    queryFn:  () => essRequestsApi.getLeaveTypes(),
    staleTime: 10 * 60 * 1000,
  });
}

/** GET /api/ess/requests/leave — optional { year, status } filters */
export function useEssLeaveRequests(filters) {
  return useQuery({
    queryKey: QK.leaveRequests(filters),
    queryFn:  () => essRequestsApi.getLeaveRequests(filters),
    staleTime: 2 * 60 * 1000,
  });
}

/** POST /api/ess/requests/leave */
export function useSubmitLeaveRequest() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (body) => essRequestsApi.submitLeaveRequest(body),
    onSuccess:  invalidate,
  });
}

/** DELETE /api/ess/requests/leave/:id */
export function useCancelLeaveRequest() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => essRequestsApi.cancelLeaveRequest(id),
    onSuccess:  invalidate,
  });
}

// ── ESS — Absence ─────────────────────────────────────────────────

/** GET /api/ess/requests/absence — optional { year } filter */
export function useEssAbsenceReports(filters) {
  return useQuery({
    queryKey: QK.absenceReports(filters),
    queryFn:  () => essRequestsApi.getAbsenceReports(filters),
    staleTime: 2 * 60 * 1000,
  });
}

/** POST /api/ess/requests/absence */
export function useReportAbsence() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (body) => essRequestsApi.reportAbsence(body),
    onSuccess:  invalidate,
  });
}

/** PATCH /api/ess/requests/absence/:id/cancel */
export function useCancelAbsenceReport() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => essRequestsApi.cancelAbsenceReport(id),
    onSuccess:  invalidate,
  });
}

// ── ESS — Swap ────────────────────────────────────────────────────

/** GET /api/ess/requests/swap — sent and received */
export function useEssSwapRequests() {
  return useQuery({
    queryKey: QK.swapRequests(),
    queryFn:  () => essRequestsApi.getSwapRequests(),
    staleTime: 2 * 60 * 1000,
  });
}

/** POST /api/ess/requests/swap */
export function useSubmitSwapRequest() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (body) => essRequestsApi.submitSwapRequest(body),
    onSuccess:  invalidate,
  });
}

/** PATCH /api/ess/requests/swap/:id/peer-accept */
export function usePeerAcceptSwap() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => essRequestsApi.peerAcceptSwap(id),
    onSuccess:  invalidate,
  });
}

/** PATCH /api/ess/requests/swap/:id/peer-decline */
export function usePeerDeclineSwap() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => essRequestsApi.peerDeclineSwap(id),
    onSuccess:  invalidate,
  });
}

/** PATCH /api/ess/requests/swap/:id/cancel */
export function useCancelSwapRequest() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => essRequestsApi.cancelSwapRequest(id),
    onSuccess:  invalidate,
  });
}

// ── ESS — Summary badge ───────────────────────────────────────────

/**
 * GET /api/ess/requests/summary
 * Polls every 60 seconds to keep the bottom-nav badge current.
 */
export function useEssRequestsSummary() {
  return useQuery({
    queryKey:       QK.summary(),
    queryFn:        () => essRequestsApi.getRequestsSummary(),
    refetchInterval: 60_000,
    staleTime:       30_000,
  });
}

// ── HR Management ─────────────────────────────────────────────────

/**
 * GET /api/hr/requests — paginated unified request list.
 * Filters: { type, status, employeeId, departmentId, from, to, page, pageSize }
 */
export function useHrRequests(filters) {
  return useQuery({
    queryKey: QK.hrRequests(filters),
    queryFn:  () => hrRequestsApi.getRequests(filters),
    staleTime: 60 * 1000,
  });
}

/** PUT /api/hr/requests/leave/:id/approve */
export function useApproveLeave() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => hrRequestsApi.approveLeave(id),
    onSuccess:  invalidate,
  });
}

/** PUT /api/hr/requests/leave/:id/reject */
export function useRejectLeave() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, rejectionReason }) => hrRequestsApi.rejectLeave(id, { rejectionReason }),
    onSuccess:  invalidate,
  });
}

/** PATCH /api/hr/requests/absence/:id/acknowledge */
export function useAcknowledgeAbsence() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, certRequired }) => hrRequestsApi.acknowledgeAbsence(id, { certRequired }),
    onSuccess:  invalidate,
  });
}

/** PATCH /api/hr/requests/absence/:id/dispute */
export function useDisputeAbsence() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, disputeReason }) => hrRequestsApi.disputeAbsence(id, { disputeReason }),
    onSuccess:  invalidate,
  });
}

/** PUT /api/hr/requests/swap/:id/approve */
export function useApproveSwap() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => hrRequestsApi.approveSwap(id),
    onSuccess:  invalidate,
  });
}

/** PUT /api/hr/requests/swap/:id/reject */
export function useRejectSwap() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, reviewNotes }) => hrRequestsApi.rejectSwap(id, { reviewNotes }),
    onSuccess:  invalidate,
  });
}

// ── i18n helper ───────────────────────────────────────────────────

/**
 * Returns the localised status label for a request.
 *
 * @param {'leave'|'absence'|'swap'} type
 * @param {string} status
 * @param {Function} t  useTranslation('ess').t
 * @returns {string}
 */
export function getRequestStatusLabel(type, status, t) {
  const statusKeyMap = {
    // Leave
    submitted:       'requests.statusSubmitted',
    approved:        'requests.statusApproved',
    rejected:        'requests.statusRejected',
    cancelled:       'requests.statusCancelled',
    // Absence
    reported:        'requests.statusReported',
    acknowledged:    'requests.statusAcknowledged',
    disputed:        'requests.statusDisputed',
    // Swap
    pending_peer:    'requests.statusPendingPeer',
    pending_manager: 'requests.statusPendingManager',
    peer_declined:   'requests.statusPeerDeclined',
  };
  const key = statusKeyMap[status];
  return key ? t(key, { defaultValue: status }) : status;
}
