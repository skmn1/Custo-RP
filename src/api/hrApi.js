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
};
