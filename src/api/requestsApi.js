import { apiFetch, API_BASE_URL } from './config';

/**
 * Request Workflows API — Task 87
 *
 * All ESS endpoints require a valid JWT (employee role).
 * All HR endpoints require a valid JWT with hr_manager, planner, or super_admin role.
 */

// ── ESS Leave ────────────────────────────────────────────────────

export const essRequestsApi = {
  // Leave
  getLeaveBalance:   ()             => apiFetch('/ess/requests/leave/balance'),
  getLeaveTypes:     ()             => apiFetch('/ess/requests/leave/types'),
  getLeaveRequests:  (params = {})  => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/ess/requests/leave${qs ? `?${qs}` : ''}`);
  },
  submitLeaveRequest: (body)        => apiFetch('/ess/requests/leave', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  cancelLeaveRequest: (id)          => apiFetch(`/ess/requests/leave/${id}`, { method: 'DELETE' }),

  // Absence
  getAbsenceReports: (params = {})  => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/ess/requests/absence${qs ? `?${qs}` : ''}`);
  },
  reportAbsence:     (body)         => apiFetch('/ess/requests/absence', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  cancelAbsenceReport: (id)         => apiFetch(`/ess/requests/absence/${id}/cancel`, { method: 'PATCH' }),
  uploadAbsenceCert: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${API_BASE_URL}/ess/requests/absence/${id}/certificate`;
    const accessToken = localStorage.getItem('accessToken');
    return fetch(url, {
      method: 'POST',
      headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      body: formData,
    }).then(res => { if (!res.ok) throw new Error(`Upload failed: ${res.status}`); return res.json(); });
  },

  // Swap
  getSwapRequests:   ()             => apiFetch('/ess/requests/swap'),
  submitSwapRequest: (body)         => apiFetch('/ess/requests/swap', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  peerAcceptSwap:  (id)             => apiFetch(`/ess/requests/swap/${id}/peer-accept`, { method: 'PATCH' }),
  peerDeclineSwap: (id)             => apiFetch(`/ess/requests/swap/${id}/peer-decline`, { method: 'PATCH' }),
  cancelSwapRequest: (id)           => apiFetch(`/ess/requests/swap/${id}/cancel`, { method: 'PATCH' }),

  // Summary badge
  getRequestsSummary: ()            => apiFetch('/ess/requests/summary'),
};

// ── HR Management ────────────────────────────────────────────────

export const hrRequestsApi = {
  // Unified list
  getRequests: (params = {})        => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return apiFetch(`/hr/requests${qs ? `?${qs}` : ''}`);
  },

  // CSV export
  exportCsv: (params = {})          => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return `/api/hr/requests/export${qs ? `?${qs}` : ''}`;
  },

  // Leave actions
  approveLeave: (id)                => apiFetch(`/hr/requests/leave/${id}/approve`, { method: 'PUT' }),
  rejectLeave:  (id, body)          => apiFetch(`/hr/requests/leave/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  // Absence actions
  acknowledgeAbsence:   (id, body)  => apiFetch(`/hr/requests/absence/${id}/acknowledge`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  disputeAbsence:       (id, body)  => apiFetch(`/hr/requests/absence/${id}/dispute`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  setAbsenceCertRequired: (id, body) => apiFetch(`/hr/requests/absence/${id}/set-cert-required`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),

  // Swap actions
  approveSwap: (id)                 => apiFetch(`/hr/requests/swap/${id}/approve`, { method: 'PUT' }),
  rejectSwap:  (id, body)           => apiFetch(`/hr/requests/swap/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
};
