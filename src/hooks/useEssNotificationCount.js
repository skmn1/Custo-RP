/**
 * useEssNotificationCount — Task 64 (A.3)
 *
 * Polls the ESS unread-count endpoint every 30 seconds.
 * Gracefully falls back to 0 if the API is unreachable or returns an error.
 *
 * Uses apiFetch so the Authorization header is included (fixes 403).
 */
import { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';

export function useEssNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await apiFetch('/ess/notifications/unread-count');
        if (!cancelled) {
          setUnreadCount(res?.data?.count ?? res?.count ?? 0);
        }
      } catch {
        // Network error, 403, or endpoint not implemented — keep previous count
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { unreadCount };
}
