import { api } from './config';

export const settingsApi = {
  /** Get all app settings grouped by category (Admin) */
  getAll: () => api.get('/settings'),

  /** Get settings for a specific category */
  getByCategory: (category) => api.get(`/settings/${category}`),

  /** Update settings for a category (Admin) */
  updateCategory: (category, settings) => api.put(`/settings/${category}`, settings),

  /** Reset a category to defaults (Admin) */
  resetCategory: (category) => api.post(`/settings/${category}/reset`),

  /** Get public (non-sensitive) settings */
  getPublic: () => api.get('/settings/public'),

  /** Get current user's preferences */
  getPreferences: () => api.get('/user/preferences'),

  /** Update current user's preferences */
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),

  /** Reset current user's preferences to defaults */
  resetPreferences: () => api.post('/user/preferences/reset'),
};
