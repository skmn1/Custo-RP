import { useState, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssUpdateProfile — sends a PATCH /api/ess/profile with partial profile data.
 * Used by MobileEditProfilePage to update contact details and work preferences.
 */
export function useEssUpdateProfile() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (fields) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ess/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      return res;
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, isLoading, error };
}
