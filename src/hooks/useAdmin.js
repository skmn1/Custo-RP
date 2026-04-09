import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboardKpis,
  fetchActivityFeed,
  fetchUsers,
  fetchUser,
  suspendUser,
  unsuspendUser,
  resetUserPassword,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  fetchInvitations,
  createInvitation,
  rescindInvitation,
  fetchAppAccessMatrix,
  updateAppAccessMatrix,
  fetchAdminPosTerminals,
  createPosTerminal,
  updatePosTerminal,
  deactivatePosTerminal,
  fetchAuditLog,
  fetchSystemHealth,
} from '../api/adminApi';

// ── Dashboard KPIs + Activity Feed ──────────────────────────────

export function useAdminDashboard(refreshInterval = 60000) {
  const [kpis, setKpis] = useState(null);
  const [kpiError, setKpiError] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [feed, setFeed] = useState([]);
  const [feedError, setFeedError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const loadKpis = useCallback(async () => {
    try {
      setKpiLoading(true);
      const data = await fetchDashboardKpis();
      setKpis(data);
      setKpiError(null);
    } catch (err) {
      setKpiError(err.message);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const loadFeed = useCallback(async (limit = 20) => {
    try {
      const data = await fetchActivityFeed(limit);
      setFeed(data);
      setFeedError(null);
    } catch (err) {
      setFeedError(err.message);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadKpis(), loadFeed()]);
    setLastUpdated(new Date());
  }, [loadKpis, loadFeed]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [refresh, refreshInterval]);

  return { kpis, kpiError, kpiLoading, feed, feedError, lastUpdated, refresh };
}

// ── User Management ─────────────────────────────────────────────

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const getUser = useCallback(async (id) => {
    return fetchUser(id);
  }, []);

  const suspend = useCallback(async (id) => {
    await suspendUser(id);
    loadUsers();
  }, [loadUsers]);

  const unsuspend = useCallback(async (id) => {
    await unsuspendUser(id);
    loadUsers();
  }, [loadUsers]);

  const resetPassword = useCallback(async (id) => {
    return resetUserPassword(id);
  }, []);

  const create = useCallback(async (data) => {
    await createUser(data);
    loadUsers();
  }, [loadUsers]);

  const update = useCallback(async (id, data) => {
    await updateUser(id, data);
    loadUsers();
  }, [loadUsers]);

  const changeRole = useCallback(async (id, role) => {
    await updateUserRole(id, role);
    loadUsers();
  }, [loadUsers]);

  const remove = useCallback(async (id) => {
    await deleteUser(id);
    loadUsers();
  }, [loadUsers]);

  return {
    users, loading, error, refresh: loadUsers,
    getUser, suspend, unsuspend, resetPassword,
    create, update, changeRole, remove,
  };
}

// ── Invitations ─────────────────────────────────────────────────

export function useAdminInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchInvitations();
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const invite = useCallback(async (data) => {
    await createInvitation(data);
    load();
  }, [load]);

  const rescind = useCallback(async (id) => {
    await rescindInvitation(id);
    load();
  }, [load]);

  return { invitations, loading, error, refresh: load, invite, rescind };
}

// ── App Access Matrix ───────────────────────────────────────────

export function useAppAccessMatrix() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAppAccessMatrix();
      setMatrix(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (updatedMatrix) => {
    await updateAppAccessMatrix(updatedMatrix);
    setMatrix(updatedMatrix);
  }, []);

  return { matrix, loading, error, refresh: load, save };
}

// ── PoS Terminal Management ─────────────────────────────────────

export function useAdminTerminals() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdminPosTerminals();
      setTerminals(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data) => {
    await createPosTerminal(data);
    load();
  }, [load]);

  const update = useCallback(async (id, data) => {
    await updatePosTerminal(id, data);
    load();
  }, [load]);

  const deactivate = useCallback(async (id) => {
    await deactivatePosTerminal(id);
    load();
  }, [load]);

  return { terminals, loading, error, refresh: load, create, update, deactivate };
}

// ── Audit Log ───────────────────────────────────────────────────

export function useAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await fetchAuditLog(params);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { logs, loading, error, refresh: load };
}

// ── System Health ───────────────────────────────────────────────

export function useSystemHealth(refreshInterval = 30000) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSystemHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [load, refreshInterval]);

  return { health, loading, error, refresh: load };
}
