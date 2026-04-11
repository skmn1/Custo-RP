import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssNotifications — fetches the ESS notification feed.
 * GET /api/ess/notifications
 * Returns notifications with: id, type, title, body, createdAt, read,
 *   actionType ('navigate' | 'swapRequest' | null), actionPayload
 */
export function useEssNotifications() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ess/notifications');
      setData(res ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { data, isLoading, error, refetch: fetchNotifications };
}
