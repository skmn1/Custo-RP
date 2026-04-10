import { api, apiFetch } from './config';

/**
 * HR API client — mirrors the REST controller at /api/hr.
 */
export const hrApi = {
  /** Get the org chart tree (recursive employee hierarchy). */
  orgChart: () => api.get('/hr/org-chart'),

  /** List documents for a specific employee. */
  listDocuments: (employeeId) => api.get(`/hr/employees/${employeeId}/documents`),

  /**
   * Upload a document for an employee.
   * @param {string} employeeId
   * @param {FormData} formData  Must contain a 'file' field and optionally 'description'.
   */
  uploadDocument: (employeeId, formData) =>
    apiFetch(`/hr/employees/${employeeId}/documents`, {
      method: 'POST',
      body: formData,
      // Omit Content-Type so the browser sets the multipart/form-data boundary automatically
      headers: { 'Content-Type': undefined },
    }),

  /** Get a signed download URL for a document (valid 15 minutes). */
  getDownloadUrl: (documentId) => api.get(`/hr/documents/${documentId}/download`),

  /** Delete a document (super_admin only). */
  deleteDocument: (documentId) => api.delete(`/hr/documents/${documentId}`),

  // ── Candidates ─────────────────────────────────────────────────

  listCandidates: (status) =>
    api.get(`/hr/candidates${status ? `?status=${status}` : ''}`),

  createCandidate: (data) => api.post('/hr/candidates', data),

  getCandidate: (id) => api.get(`/hr/candidates/${id}`),

  updateCandidate: (id, data) => api.put(`/hr/candidates/${id}`, data),

  updateCandidateStatus: (id, status) =>
    api.put(`/hr/candidates/${id}/status`, { status }),

  rejectCandidate: (id) => api.put(`/hr/candidates/${id}/reject`),

  archiveCandidate: (id) => api.put(`/hr/candidates/${id}/archive`),

  // ── Candidate onboarding steps ─────────────────────────────────

  getCandidateSteps: (id) => api.get(`/hr/candidates/${id}/steps`),

  updateCandidateStep: (candidateId, stepId, data) =>
    api.put(`/hr/candidates/${candidateId}/steps/${stepId}`, data),

  getStepDefinitions: () => api.get('/hr/candidates/step-definitions'),

  // ── Candidate documents ────────────────────────────────────────

  listCandidateDocuments: (id) => api.get(`/hr/candidates/${id}/documents`),

  uploadCandidateDocument: (candidateId, formData) =>
    apiFetch(`/hr/candidates/${candidateId}/documents`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    }),

  getCandidateDocumentUrl: (candidateId, docId) =>
    api.get(`/hr/candidates/${candidateId}/documents/${docId}/url`),

  verifyCandidateDocument: (candidateId, docId) =>
    api.put(`/hr/candidates/${candidateId}/documents/${docId}/verify`),

  deleteCandidateDocument: (candidateId, docId) =>
    api.delete(`/hr/candidates/${candidateId}/documents/${docId}`),

  // ── Activation ─────────────────────────────────────────────────

  activateCandidate: (id) => api.post(`/hr/candidates/${id}/activate`),

  resendCandidateInvite: (id) => api.post(`/hr/candidates/${id}/resend-invite`),
};
