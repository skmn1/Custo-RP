import { api } from './config';

/**
 * PoS API client — mirrors the REST controller at /api/pos.
 * Replaces the in-memory posApi mock from data/pos.js.
 */
export const posApi = {
  // ── PoS Location endpoints ──

  /** List PoS locations assigned to the current user. */
  myPosLocations: () => api.get('/pos/my-pos-locations'),

  /** @deprecated Use myPosLocations() instead. */
  myTerminals: () => api.get('/pos/my-pos-locations'),

  /** Get expanded dashboard KPIs for a PoS location (Sales + Operations + People rows). */
  dashboardKpis: (posLocationId) => api.get(`/pos/${posLocationId}/dashboard-kpis`),

  /** Get daily sales report for a PoS location. */
  dailySales: (posLocationId, date) => {
    const qs = date ? `?date=${date}` : '';
    return api.get(`/pos/${posLocationId}/reports/daily-sales${qs}`);
  },

  /** Get period summary report for a PoS location. */
  periodSummary: (posLocationId, from, to) =>
    api.get(`/pos/${posLocationId}/reports/period-summary?from=${from}&to=${to}`),

  // ── Scoped sub-domain endpoints ──

  /** Get stock items for a PoS location. */
  getStock: (posLocationId, search) => {
    const qs = search ? `?search=${encodeURIComponent(search)}&posLocationId=${posLocationId}` : `?posLocationId=${posLocationId}`;
    return api.get(`/stock/items${qs}`);
  },

  /** Get purchase orders for a PoS location. */
  getPurchases: (posLocationId) => api.get(`/pos/${posLocationId}/purchases`),

  /** Create a purchase order for a PoS location. */
  createPurchase: (posLocationId, data) => api.post(`/pos/${posLocationId}/purchases`, data),

  /** Get staff list for a PoS location. */
  getHrStaff: (posLocationId) => api.get(`/pos/${posLocationId}/hr/staff`),

  /** Get schedule for a PoS location. */
  getSchedule: (posLocationId, from, to) =>
    api.get(`/pos/${posLocationId}/schedule?from=${from}&to=${to}`),

  /** Get payroll summary for a PoS location. */
  getPayrollSummary: (posLocationId) => api.get(`/pos/${posLocationId}/payroll/summary`),

  /** Get accounting summary for a PoS location. */
  getAccountingSummary: (posLocationId) => api.get(`/pos/${posLocationId}/accounting/summary`),

  /** Get staff hours report for a PoS location. */
  getStaffHoursReport: (posLocationId, from, to) =>
    api.get(`/pos/${posLocationId}/reports/staff-hours?from=${from}&to=${to}`),

  /** Get stock summary report for a PoS location. */
  getStockSummaryReport: (posLocationId, from, to) =>
    api.get(`/pos/${posLocationId}/reports/stock-summary?from=${from}&to=${to}`),

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

  /** List all PoS locations with status — super_admin only. */
  listAllPosLocations: (includeInactive = false) =>
    api.get(`/pos${includeInactive ? '?includeInactive=true' : ''}`),
};
