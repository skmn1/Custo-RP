import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * Hook to fetch the current user's accessible apps from the backend.
 * Returns { apps, loading, error, refresh }.
 */
export function useAppAccess() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccess = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/apps/my-access');
      setApps(data);
      setError(null);
    } catch (err) {
      setError(err);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  return { apps, loading, error, refresh: fetchAccess };
}
