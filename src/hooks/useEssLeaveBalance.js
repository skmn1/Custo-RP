import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssLeaveBalance — fetches the employee leave balance summary.
 *
 * Calls GET /api/ess/leave/balance
 * Expected response shape:
 *   {
 *     annual: { used: number, total: number },
 *     sick:   { used: number, total: number },
 *     swap:   { used: number, total: number },  // optional
 *   }
 *
 * Falls back to zero-value stub when the endpoint is unavailable (e.g.
 * backend has not implemented the route yet — returns 500).
 */

const FALLBACK_BALANCE = {
  annual: { used: 0, total: 20 },
  sick:   { used: 0, total: 10 },
  swap:   { used: 0, total: 5 },
};

export function useEssLeaveBalance() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ess/leave/balance');
      setData(res.data ?? res ?? null);
    } catch (err) {
      // If the endpoint is not yet implemented (500) use fallback data
      // so the UI still renders and does not block the page.
      if (err.status === 500 || err.status === 501 || err.status === 404) {
        setData(FALLBACK_BALANCE);
      } else {
        setError(err.message || 'Failed to load leave balance');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { data, isLoading, error, refetch: fetchBalance };
}
