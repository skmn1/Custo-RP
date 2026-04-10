import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { enqueueMutation } from '../lib/essOfflineQueue';

// Helper: get employee ID from the profile or localStorage user cache
function getEmployeeId(profile) {
  if (profile?.id) return profile.id;
  if (profile?.employeeId) return profile.employeeId;
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.employee_id ?? payload.sub ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * useEssProfile — data-fetching hook for the ESS profile page.
 *
 * Fetches /api/ess/profile (full profile overview) and exposes
 * CRUD operations for experience, qualifications, and change requests.
 */
export function useEssProfile() {
  const [profile, setProfile] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Local optimistic queue entries (queued offline change requests)
  const [queuedRequests, setQueuedRequests] = useState([]);

  // ── Fetch full profile ───────────────────────────────────

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ess/profile');
      setProfile(res);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Change requests ──────────────────────────────────────

  const fetchChangeRequests = useCallback(async () => {
    try {
      const res = await apiFetch('/ess/profile/change-requests');
      setChangeRequests(res || []);
    } catch (err) {
      console.error('Failed to load change requests:', err);
    }
  }, []);

  const submitChangeRequest = useCallback(async ({ fieldName, fieldLabel, oldValue, newValue }) => {
    if (!navigator.onLine) {
      // Queue offline — add an optimistic entry immediately
      const employeeId = getEmployeeId(profile);
      const mutationId = await enqueueMutation({
        employeeId,
        type:   'profile-change-request',
        url:    '/api/ess/profile/change-request',
        method: 'POST',
        body:   { fieldName, fieldLabel, oldValue, newValue },
      });
      const optimistic = {
        id:         `queued-${mutationId}`,
        mutationId,
        fieldName,
        fieldLabel,
        oldValue:   oldValue ?? '',
        newValue,
        status:     'queued',
        isQueued:   true,
        createdAt:  new Date().toISOString(),
      };
      setQueuedRequests((prev) => [...prev, optimistic]);
      return optimistic;
    }

    const res = await apiFetch('/ess/profile/change-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldName, fieldLabel, oldValue, newValue }),
    });
    await fetchChangeRequests();
    await fetchProfile();
    return res;
  }, [fetchChangeRequests, fetchProfile, profile]);

  const cancelChangeRequest = useCallback(async (id) => {
    await apiFetch(`/ess/profile/change-requests/${id}`, { method: 'DELETE' });
    await fetchChangeRequests();
    await fetchProfile();
  }, [fetchChangeRequests, fetchProfile]);

  // ── Experience CRUD ──────────────────────────────────────

  const addExperience = useCallback(async (data) => {
    const res = await apiFetch('/ess/profile/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchProfile();
    return res;
  }, [fetchProfile]);

  const updateExperience = useCallback(async (id, data) => {
    const res = await apiFetch(`/ess/profile/experience/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchProfile();
    return res;
  }, [fetchProfile]);

  const deleteExperience = useCallback(async (id) => {
    await apiFetch(`/ess/profile/experience/${id}`, { method: 'DELETE' });
    await fetchProfile();
  }, [fetchProfile]);

  // ── Qualifications CRUD ──────────────────────────────────

  const addQualification = useCallback(async (data) => {
    const res = await apiFetch('/ess/profile/qualifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchProfile();
    return res;
  }, [fetchProfile]);

  const updateQualification = useCallback(async (id, data) => {
    const res = await apiFetch(`/ess/profile/qualifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchProfile();
    return res;
  }, [fetchProfile]);

  const deleteQualification = useCallback(async (id) => {
    await apiFetch(`/ess/profile/qualifications/${id}`, { method: 'DELETE' });
    await fetchProfile();
  }, [fetchProfile]);

  // ── Initial load ─────────────────────────────────────────

  useEffect(() => {
    fetchProfile();
    fetchChangeRequests();
  }, [fetchProfile, fetchChangeRequests]);

  return {
    profile,
    changeRequests,
    queuedRequests,
    isLoading,
    error,
    fetchProfile,
    fetchChangeRequests,
    submitChangeRequest,
    cancelChangeRequest,
    addExperience,
    updateExperience,
    deleteExperience,
    addQualification,
    updateQualification,
    deleteQualification,
  };
}
