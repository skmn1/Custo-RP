import { useState, useEffect, useCallback } from 'react';
import { hrApi } from '../api/hrApi';

// ── Candidate list + CRUD ────────────────────────────────────────

export function useCandidates(initialStatus) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialStatus || null);

  const load = useCallback(async (status) => {
    try {
      setLoading(true);
      const data = await hrApi.listCandidates(status || null);
      setCandidates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(statusFilter); }, [load, statusFilter]);

  const create = useCallback(async (data) => {
    const result = await hrApi.createCandidate(data);
    load(statusFilter);
    return result;
  }, [load, statusFilter]);

  const update = useCallback(async (id, data) => {
    const result = await hrApi.updateCandidate(id, data);
    load(statusFilter);
    return result;
  }, [load, statusFilter]);

  const updateStatus = useCallback(async (id, status) => {
    const result = await hrApi.updateCandidateStatus(id, status);
    load(statusFilter);
    return result;
  }, [load, statusFilter]);

  const reject = useCallback(async (id) => {
    const result = await hrApi.rejectCandidate(id);
    load(statusFilter);
    return result;
  }, [load, statusFilter]);

  const archive = useCallback(async (id) => {
    const result = await hrApi.archiveCandidate(id);
    load(statusFilter);
    return result;
  }, [load, statusFilter]);

  return {
    candidates, loading, error,
    statusFilter, setStatusFilter,
    refresh: () => load(statusFilter),
    create, update, updateStatus, reject, archive,
  };
}

// ── Single candidate detail ──────────────────────────────────────

export function useCandidate(id) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await hrApi.getCandidate(id);
      setCandidate(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateStep = useCallback(async (stepId, data) => {
    await hrApi.updateCandidateStep(id, stepId, data);
    load();
  }, [id, load]);

  const uploadDocument = useCallback(async (formData) => {
    await hrApi.uploadCandidateDocument(id, formData);
    load();
  }, [id, load]);

  const verifyDocument = useCallback(async (docId) => {
    await hrApi.verifyCandidateDocument(id, docId);
    load();
  }, [id, load]);

  const deleteDocument = useCallback(async (docId) => {
    await hrApi.deleteCandidateDocument(id, docId);
    load();
  }, [id, load]);

  const activate = useCallback(async () => {
    const result = await hrApi.activateCandidate(id);
    load();
    return result;
  }, [id, load]);

  const resendInvite = useCallback(async () => {
    const result = await hrApi.resendCandidateInvite(id);
    load();
    return result;
  }, [id, load]);

  const updateInfo = useCallback(async (data) => {
    await hrApi.updateCandidate(id, data);
    load();
  }, [id, load]);

  const updateStatus = useCallback(async (status) => {
    await hrApi.updateCandidateStatus(id, status);
    load();
  }, [id, load]);

  const rejectCandidate = useCallback(async () => {
    await hrApi.rejectCandidate(id);
    load();
  }, [id, load]);

  return {
    candidate, loading, error, refresh: load,
    updateStep, uploadDocument, verifyDocument, deleteDocument,
    activate, resendInvite, updateInfo, updateStatus, rejectCandidate,
  };
}
