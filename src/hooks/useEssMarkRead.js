import { useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssMarkRead — marks ESS notifications as read.
 * PATCH /api/ess/notifications/:id/read  (single)
 * PATCH /api/ess/notifications/mark-all-read  (bulk)
 */
export function useEssMarkRead() {
  const markRead = useCallback(async (id) => {
    await apiFetch(`/ess/notifications/${id}/read`, { method: 'PATCH' });
  }, []);

  const markAllRead = useCallback(async () => {
    await apiFetch('/ess/notifications/mark-all-read', { method: 'PATCH' });
  }, []);

  return { markRead, markAllRead };
}
