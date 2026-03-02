import { api } from './config';

/**
 * Shift API client — mirrors the REST controller at /api/shifts.
 */
export const shiftsApi = {
  /** List shifts with optional filters. */
  list: ({ startDate, endDate, employeeId, department, type } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (employeeId) params.set('employeeId', employeeId);
    if (department) params.set('department', department);
    if (type) params.set('type', type);
    const qs = params.toString();
    return api.get(`/shifts${qs ? `?${qs}` : ''}`);
  },

  /** Get a single shift by ID. */
  getById: (id) => api.get(`/shifts/${id}`),

  /** Create a new shift. */
  create: (data) => api.post('/shifts', data),

  /** Update a shift. */
  update: (id, data) => api.put(`/shifts/${id}`, data),

  /** Move / drag-drop a shift (PATCH). */
  move: (id, moveData) => api.patch(`/shifts/${id}/move`, moveData),

  /** Delete a shift. */
  delete: (id) => api.delete(`/shifts/${id}`),
};
