/**
 * useEssSyncStatus — Task 59
 *
 * Drives the background sync lifecycle for ESS offline write operations.
 *
 * Responsibilities:
 *  - Track how many mutations are pending in the IndexedDB queue
 *  - Trigger replay (auto on reconnect; manual via `triggerSync`)
 *  - Expose per-mutation results after replay
 *  - Clean up synced entries automatically
 *  - Listen for SW 'ESS_SYNC_COMPLETE' messages (Workbox queues)
 *  - Reset the failed/conflict entries on "Retry"
 *  - Discard individual entries on "Discard"
 *
 * Auth token strategy:
 *  The custom queue always reads a fresh token from localStorage at replay
 *  time — never uses the token from when the mutation was enqueued.
 *  This prevents 401 failures from expired tokens.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useEssConnectivity } from '../contexts/EssConnectivityContext';
import {
  getPendingMutations,
  getAllMutations,
  replayQueue,
  clearSyncedMutations,
  discardMutation,
  retryMutation,
} from '../lib/essOfflineQueue';

/** Read the current access token from localStorage (fresh at call time). */
function getAuthToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Not authenticated');
  return Promise.resolve(token);
}

export function useEssSyncStatus() {
  const { user } = useAuth();
  const { isOnline } = useEssConnectivity();

  const [pendingCount,  setPendingCount]  = useState(0);
  const [failedCount,   setFailedCount]   = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [allMutations,  setAllMutations]  = useState([]);
  const [syncResults,   setSyncResults]   = useState(null); // Array<{id, status}> | null
  const [isSyncing,     setIsSyncing]     = useState(false);

  const employeeId = user?.employee_id ?? user?.employeeId ?? user?.id ?? null;

  // ── Refresh local counts from IndexedDB ─────────────────────────────────

  const refreshCounts = useCallback(async () => {
    if (!employeeId) return;
    try {
      const [pending, all] = await Promise.all([
        getPendingMutations(employeeId),
        getAllMutations(employeeId),
      ]);
      setPendingCount(pending.length);
      setAllMutations(all);
      setFailedCount(all.filter((m) => m.status === 'failed').length);
      setConflictCount(all.filter((m) => m.status === 'conflict').length);
    } catch (err) {
      console.error('[EssSyncStatus] refreshCounts failed:', err);
    }
  }, [employeeId]);

  // Bootstrap counts on mount and when user changes
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // ── Manual / auto replay ─────────────────────────────────────────────────

  const triggerSync = useCallback(async () => {
    if (!employeeId || isSyncing) return;
    setIsSyncing(true);
    setSyncResults(null);
    try {
      const results = await replayQueue(employeeId, getAuthToken);
      setSyncResults(results);
      await clearSyncedMutations(employeeId);
    } catch (err) {
      console.error('[EssSyncStatus] replayQueue failed:', err);
    } finally {
      setIsSyncing(false);
      await refreshCounts();
    }
  }, [employeeId, isSyncing, refreshCounts]);

  // Auto-sync when connectivity is restored and there are pending items
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      triggerSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // ── Listen for SW ESS_SYNC_COMPLETE messages (Workbox BG sync) ──────────

  useEffect(() => {
    if (!navigator.serviceWorker) return;

    const handler = (event) => {
      if (event.data?.type === 'ESS_SYNC_COMPLETE') {
        refreshCounts();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [refreshCounts]);

  // ── Discard / Retry individual mutations ─────────────────────────────────

  const discard = useCallback(async (id) => {
    await discardMutation(id);
    await refreshCounts();
  }, [refreshCounts]);

  const retry = useCallback(async (id) => {
    await retryMutation(id);
    await refreshCounts();
    // Immediately re-try if we're online
    if (isOnline) triggerSync();
  }, [refreshCounts, isOnline, triggerSync]);

  // ── Derived summary stats ────────────────────────────────────────────────

  const syncedCount  = syncResults ? syncResults.filter((r) => r.status === 'synced').length   : 0;
  const resultConflicts = syncResults ? syncResults.filter((r) => r.status === 'conflict').length : 0;
  const resultFailed    = syncResults ? syncResults.filter((r) => r.status === 'failed').length  : 0;

  return {
    // Counts
    pendingCount,
    failedCount,
    conflictCount,
    // All mutations (for UI display: queued badges on change requests)
    allMutations,
    // Sync state
    isSyncing,
    syncResults,
    syncedCount,
    resultConflicts,
    resultFailed,
    // Actions
    triggerSync,
    discard,
    retry,
    refreshCounts,
  };
}
