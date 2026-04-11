/**
 * EssSyncStatusBanner — Task 59
 *
 * Displays sync status for offline-queued ESS write operations:
 *
 *   Pending (offline):
 *     [📤] 2 pending change(s) — will sync when back online
 *
 *   Syncing:
 *     [🔄] Syncing 2 pending change(s)…
 *
 *   All synced (3s auto-dismiss toast):
 *     [✓] 2 change(s) synced
 *
 *   Partial conflict (3s auto-dismiss warning toast):
 *     [⚠] 1 synced, 1 conflict(s) — already processed by HR
 *
 *   Failed (persistent, with Retry / Discard per item):
 *     [✕] 1 change(s) failed to sync   [Retry] [Discard]
 *
 * Rendered by EssLayout just after EssOfflineBanner. Hidden when there are
 * no pending, syncing, or recently completed items.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useEssSyncStatus } from '../../hooks/useEssSyncStatus';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';

// ─── Toast helper ───────────────────────────────────────────────────────────

function useResultToast(syncResults, syncedCount, resultConflicts) {
  const [toast, setToast] = useState(null); // null | 'success' | 'conflict'

  useEffect(() => {
    if (!syncResults || syncResults.length === 0) return;

    if (resultConflicts > 0) {
      setToast('conflict');
    } else if (syncedCount > 0) {
      setToast('success');
    }

    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [syncResults]); // only re-run when new results arrive

  return toast;
}

// ─── EssSyncStatusBanner ────────────────────────────────────────────────────

export default function EssSyncStatusBanner() {
  const { t } = useTranslation('ess');
  const { isOnline } = useEssConnectivity();

  const {
    pendingCount,
    failedCount,
    allMutations,
    isSyncing,
    syncResults,
    syncedCount,
    resultConflicts,
    discard,
    retry,
  } = useEssSyncStatus();

  const toast = useResultToast(syncResults, syncedCount, resultConflicts);

  // Pending items list (for per-item failed/conflict display)
  const failedItems   = allMutations.filter((m) => m.status === 'failed');
  const conflictItems = allMutations.filter((m) => m.status === 'conflict');

  const [discardConfirm, setDiscardConfirm] = useState(null); // mutation id pending discard confirmation

  const handleDiscard = async (id) => {
    if (discardConfirm === id) {
      await discard(id);
      setDiscardConfirm(null);
    } else {
      setDiscardConfirm(id);
    }
  };

  // ── Syncing bar ──────────────────────────────────────────────────────────
  if (isSyncing) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="ess-sync-syncing-banner"
        className="flex items-center gap-2 bg-indigo-50 border-b border-indigo-200
                   px-4 py-2 text-sm text-indigo-700"
      >
        <ArrowPathIcon className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        <span>{t('pwa.sync.syncing', { count: pendingCount })}</span>
      </div>
    );
  }

  // ── Pending bar (offline + pending items) ───────────────────────────────
  const showPending = !isOnline && pendingCount > 0;
  const showFailed  = failedItems.length > 0 || conflictItems.length > 0;

  return (
    <>
      {/* Pending banner */}
      {showPending && (
        <div
          role="status"
          aria-live="polite"
          data-testid="ess-sync-pending-banner"
          className="flex items-center gap-2 bg-blue-50 border-b border-blue-200
                     px-4 py-2 text-sm text-blue-700"
        >
          <PaperAirplaneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('pwa.sync.pending', { count: pendingCount })}</span>
        </div>
      )}

      {/* Failed / conflict persistent banner */}
      {showFailed && (
        <div
          role="alert"
          data-testid="ess-sync-failed-banner"
          className="border-b border-red-200 bg-red-50 px-4 py-3
                     text-sm text-red-700 space-y-2"
        >
          {/* Failed items */}
          {failedItems.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <XCircleIcon className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                <span>
                  {t('pwa.sync.failed', { count: 1 })}
                  {m.lastError && <span className="ml-1 text-xs opacity-75">({m.lastError})</span>}
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => retry(m.id)}
                  className="rounded px-2 py-0.5 text-xs font-medium bg-red-100
                             hover:bg-red-200 transition-colors"
                >
                  {t('pwa.sync.retryBtn')}
                </button>
                <button
                  onClick={() => handleDiscard(m.id)}
                  className="rounded px-2 py-0.5 text-xs font-medium bg-gray-100
                             hover:bg-gray-200 text-gray-700
                             transition-colors"
                >
                  {discardConfirm === m.id
                    ? t('pwa.sync.confirmDiscard', { defaultValue: 'Sure?' })
                    : t('pwa.sync.discardBtn')}
                </button>
              </span>
            </div>
          ))}

          {/* Conflict items */}
          {conflictItems.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span className="text-amber-700">
                  {t('pwa.sync.conflictBadge')}
                  {m.lastError && <span className="ml-1 text-xs opacity-75">— {m.lastError}</span>}
                </span>
              </span>
              <button
                onClick={() => handleDiscard(m.id)}
                className="rounded px-2 py-0.5 text-xs font-medium bg-gray-100
                           hover:bg-gray-200 text-gray-700
                           transition-colors shrink-0"
              >
                {discardConfirm === m.id
                  ? t('pwa.sync.confirmDiscard', { defaultValue: 'Sure?' })
                  : t('pwa.sync.discardBtn')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Success toast — bottom-right, auto-dismiss */}
      {toast === 'success' && (
        <div
          role="status"
          aria-live="polite"
          data-testid="ess-sync-success-toast"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-600
                     px-4 py-3 text-sm font-medium text-white shadow-xl
                     animate-in slide-in-from-right-4 duration-300"
        >
          <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t('pwa.sync.synced', { count: syncedCount })}
        </div>
      )}

      {/* Conflict toast — bottom-right, auto-dismiss */}
      {toast === 'conflict' && (
        <div
          role="status"
          aria-live="polite"
          data-testid="ess-sync-conflict-toast"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500
                     px-4 py-3 text-sm font-medium text-white shadow-xl
                     animate-in slide-in-from-right-4 duration-300"
        >
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t('pwa.sync.conflict', { synced: syncedCount, conflicts: resultConflicts })}
        </div>
      )}
    </>
  );
}
