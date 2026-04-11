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
 */
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
      setError(err.message || 'Failed to load leave balance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { data, isLoading, error, refetch: fetchBalance };
}
