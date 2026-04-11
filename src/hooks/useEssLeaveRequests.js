import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/config';

/**
 * useEssLeaveRequests — fetches the employee's leave request list.
 *
 * Calls GET /api/ess/leave/requests
 * Each item:
 *   { id, type, startDate, endDate, status, reason, createdAt }
 *
 * Also exposes createRequest for POST /api/ess/leave/requests.
 *
 * Falls back to an empty array when the endpoint is unavailable (500).
 */
export function useEssLeaveRequests() {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ess/requests/leave');
      setData(res.data ?? res ?? []);
    } catch (err) {
      // If the endpoint is not yet implemented (500) silently fall back
      // to an empty list so the UI renders normally.
      if (err.status === 500 || err.status === 501 || err.status === 404) {
        setData([]);
      } else {
        setError(err.message || 'Failed to load leave requests');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async ({ type, startDate, endDate, reason }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch('/ess/requests/leave', {
        method: 'POST',
        body: JSON.stringify({ type, startDate, endDate, reason }),
      });
      await fetchRequests();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit request');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRequests,
    createRequest,
    isSubmitting,
    submitError,
  };
}
