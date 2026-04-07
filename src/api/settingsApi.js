import { api } from './config';

export const settingsApi = {
  // ── App Settings ──────────────────────────────────────────────────
  getAll: () => api.get('/settings'),
  getByCategory: (category) => api.get(`/settings/${category}`),
  updateCategory: (category, settings) => api.put(`/settings/${category}`, settings),
  resetCategory: (category) => api.post(`/settings/${category}/reset`),
  getPublic: () => api.get('/settings/public'),

  // ── Feature Flags ─────────────────────────────────────────────────
  getFeatureFlags: () => api.get('/settings/feature-flags'),

  // ── Navigation Items ──────────────────────────────────────────────
  getNavItems: () => api.get('/settings/navigation'),
  saveNavItems: (items) => api.post('/settings/navigation', items),

  // ── User Preferences ──────────────────────────────────────────────
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
  resetPreferences: () => api.post('/user/preferences/reset'),

  // ── Departments ───────────────────────────────────────────────────
  getDepartments: () => api.get('/departments'),
  createDepartment: (dept) => api.post('/departments', dept),
  updateDepartment: (id, dept) => api.put(`/departments/${id}`, dept),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  // ── Shift Types ───────────────────────────────────────────────────
  getShiftTypes: () => api.get('/shift-types'),
  createShiftType: (st) => api.post('/shift-types', st),
  updateShiftType: (id, st) => api.put(`/shift-types/${id}`, st),
  deleteShiftType: (id) => api.delete(`/shift-types/${id}`),
};
