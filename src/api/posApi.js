import { api } from './config';

/**
 * PoS API client — mirrors the REST controller at /api/pos.
 * Replaces the in-memory posApi mock from data/pos.js.
 */
export const posApi = {
  // ── Terminal-scoped endpoints ──

  /** List terminals assigned to the current user. */
  myTerminals: () => api.get('/pos/my-terminals'),

  /** Get dashboard KPIs for a terminal. */
  dashboardKpis: (terminalId) => api.get(`/pos/${terminalId}/dashboard-kpis`),

  /** Get daily sales report for a terminal. */
  dailySales: (terminalId, date) => {
    const qs = date ? `?date=${date}` : '';
    return api.get(`/pos/${terminalId}/reports/daily-sales${qs}`);
  },

  /** Get period summary report for a terminal. */
  periodSummary: (terminalId, from, to) =>
    api.get(`/pos/${terminalId}/reports/period-summary?from=${from}&to=${to}`),

  // ── PoS CRUD ──

  /** List PoS locations. */
  list: (includeInactive = false) =>
    api.get(`/pos${includeInactive ? '?includeInactive=true' : ''}`),

  /** Get PoS detail by ID (includes dashboard data). */
  getById: (id) => api.get(`/pos/${id}`),

  /** Create a new PoS. */
  create: (data) => api.post('/pos', data),

  /** Update a PoS. */
  update: (id, data) => api.put(`/pos/${id}`, data),

  /** Delete (soft-delete) a PoS. */
  delete: (id) => api.delete(`/pos/${id}`),

  /** List all employees flagged as managers. */
  listManagers: () => api.get('/pos/managers'),

  /** List employees assigned to a PoS. */
  listEmployees: (posId) => api.get(`/pos/${posId}/employees`),

  /** Add an employee to a PoS. */
  addEmployee: (posId, data) => api.post(`/pos/${posId}/employees`, data),

  /** Assign an existing employee to a PoS. */
  assignEmployee: (posId, empId) => api.put(`/pos/${posId}/employees/${empId}/assign`),

  /** Update an employee within a PoS. */
  updateEmployee: (posId, empId, data) =>
    api.put(`/pos/${posId}/employees/${empId}`, data),

  /** Remove an employee from a PoS. */
  removeEmployee: (posId, empId) =>
    api.delete(`/pos/${posId}/employees/${empId}`),

  /** Swap two employees within a PoS. */
  swapEmployee: (posId, currentEmpId, newEmpId) =>
    api.put(`/pos/${posId}/employees/${currentEmpId}/swap`, { newEmpId }),

  /** List employees available to be assigned to a PoS. */
  listAvailableEmployees: (posId) =>
    api.get(`/pos/${posId}/available-employees`),

  // ── Profile ──

  /** Get terminal profile (identity + fiscal + Google reviews). */
  getProfile: (id) => api.get(`/pos/${id}/profile`),

  /** Update terminal profile (identity + fiscal fields). */
  updateProfile: (id, data) => api.put(`/pos/${id}/profile`, data),

  /** Update terminal photo key. */
  updatePhoto: (id, photoKey) => api.put(`/pos/${id}/photo`, { photoKey }),

  /** Update Google reviews data. */
  updateGoogleReviews: (id, data) => api.put(`/pos/${id}/google-reviews`, data),

  // ── Incidents ──

  /** List incidents for a terminal with optional filters. */
  listIncidents: (posId, { status, category, severity } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (severity) params.set('severity', severity);
    const qs = params.toString();
    return api.get(`/pos/${posId}/incidents${qs ? `?${qs}` : ''}`);
  },

  /** Declare a new incident. */
  createIncident: (posId, data) => api.post(`/pos/${posId}/incidents`, data),

  /** Get a single incident. */
  getIncident: (posId, incidentId) => api.get(`/pos/${posId}/incidents/${incidentId}`),

  /** Update an incident. */
  updateIncident: (posId, incidentId, data) =>
    api.put(`/pos/${posId}/incidents/${incidentId}`, data),

  /** List all incidents across terminals (admin). */
  listAllIncidents: (status) => {
    const qs = status ? `?status=${status}` : '';
    return api.get(`/pos/admin/incidents${qs}`);
  },

  // ── Stock lookup (read-only for PoS) ──

  /** Search stock items (pos_manager read access). */
  searchStock: (search) =>
    api.get(`/stock/items${search ? `?search=${encodeURIComponent(search)}` : ''}`),
};
