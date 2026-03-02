import { api } from './config';

/**
 * PoS API client — mirrors the REST controller at /api/pos.
 * Replaces the in-memory posApi mock from data/pos.js.
 */
export const posApi = {
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

  /** Update an employee within a PoS. */
  updateEmployee: (posId, empId, data) =>
    api.put(`/pos/${posId}/employees/${empId}`, data),

  /** Remove an employee from a PoS. */
  removeEmployee: (posId, empId) =>
    api.delete(`/pos/${posId}/employees/${empId}`),

  /** Swap two employees within a PoS. */
  swapEmployee: (posId, currentEmpId, newEmpId) =>
    api.post(`/pos/${posId}/employees/swap`, { currentEmpId, newEmpId }),

  /** List employees available to be assigned to a PoS. */
  listAvailableEmployees: (posId) =>
    api.get(`/pos/${posId}/available-employees`),
};
