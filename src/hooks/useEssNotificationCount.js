/**
 * useEssNotificationCount — Task 64 (A.3)
 *
 * Polls the ESS unread-count endpoint every 30 seconds.
 * Gracefully falls back to 0 if the API is unreachable.
 */
import { useState, useEffect } from 'react';

export function useEssNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/ess/notifications/unread-count', {
          signal: controller.signal,
        });
        if (res.ok) {
          const { data } = await res.json();
          setUnreadCount(data?.count ?? 0);
        }
      } catch {
        // Network error or aborted — keep previous count
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return { unreadCount };
}
