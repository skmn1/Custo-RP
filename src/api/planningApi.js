import { api } from './config';

/**
 * Planning reports API.
 * Endpoints restricted to super_admin, hr_manager, planner.
 */
export const planningApi = {
  /** Weekly coverage: headcount-per-day vs target */
  getCoverage: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/planning/reports/coverage${qs ? `?${qs}` : ''}`);
  },

  /** Overtime summary: employees exceeding weekly threshold */
  getOvertime: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/planning/reports/overtime${qs ? `?${qs}` : ''}`);
  },
};
