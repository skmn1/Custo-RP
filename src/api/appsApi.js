import { api } from './config';

/**
 * Apps API — badge counts and launcher data.
 */
export const appsApi = {
  /** Get per-app badge counts for the current user. */
  getBadges: () => api.get('/apps/badges'),
};
