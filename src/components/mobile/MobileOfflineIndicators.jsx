/**
 * MobileOfflineIndicators — Task 71
 *
 * Mobile-native offline UI components:
 * - MobileOfflineBanner: compact amber banner above bottom nav when offline
 * - QueuedActionsNotice: inline notice showing queued action count
 * - QueuedBadge: amber dot on bottom nav tabs with queued actions
 * - useSyncToast: fires success/failure toast on reconnect + sync
 *
 * Consumes useEssOnlineStatus (task 58) and useEssSyncStatus (task 59).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import { useEssSyncStatus } from '../../hooks/useEssSyncStatus';

// ── MobileOfflineBanner ──────────────────────────────────────

export const MobileOfflineBanner = () => {
  const { isOnline } = useEssConnectivity();
  const { t } = useTranslation('ess');
  const [visible, setVisible] = useState(!isOnline);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4rem)] left-0 right-0 z-[45] bg-amber-500/90 backdrop-blur-sm px-4 py-2 text-center transition-transform duration-150 ${
        animating ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="status"
      aria-live="polite"
      data-testid="mobile-offline-banner"
    >
      <span className="text-mobile-footnote font-medium text-white flex items-center justify-center gap-1.5">
        <ExclamationTriangleIcon className="h-4 w-4" />
        {t('mobile.offline.youAreOffline')}
      </span>
    </div>
  );
};

// ── QueuedActionsNotice ──────────────────────────────────────

export const QueuedActionsNotice = () => {
  const { pendingCount } = useEssSyncStatus();
  const { t } = useTranslation('ess');

  if (pendingCount === 0) return null;

  return (
    <div
      className="mx-4 mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
      data-testid="queued-actions-notice"
    >
      <span className="text-mobile-footnote text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
        <ArrowUpTrayIcon className="h-4 w-4" />
        {t('mobile.offline.queuedActions', { count: pendingCount })}
      </span>
    </div>
  );
};

// ── QueuedBadge ──────────────────────────────────────────────

export const QueuedBadge = () => {
  const { pendingCount } = useEssSyncStatus();

  if (pendingCount === 0) return null;

  return (
    <span
      className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500"
      aria-hidden="true"
      data-testid="queued-badge"
    />
  );
};

// ── SyncToast ────────────────────────────────────────────────

const SyncToast = ({ message, variant, onRetry, onDismiss }) => (
  <div
    className={`fixed bottom-24 left-4 right-4 z-[60] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl transition-all duration-300 ${
      variant === 'success' ? 'bg-green-600' : 'bg-amber-600'
    }`}
    role="status"
    aria-live="polite"
    data-testid="sync-toast"
    onClick={onRetry || onDismiss}
  >
    {variant === 'success' ? (
      <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
    ) : (
      <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
    )}
    <span className="flex-1">{message}</span>
  </div>
);

// ── useSyncToast hook ────────────────────────────────────────

export const useSyncToast = () => {
  const { isOnline } = useEssConnectivity();
  const { syncResults, syncedCount, resultFailed, triggerSync } = useEssSyncStatus();
  const { t } = useTranslation('ess');
  const prevOnline = useRef(isOnline);
  const [toast, setToast] = useState(null);

  // Detect reconnection and sync results
  useEffect(() => {
    const cameBackOnline = !prevOnline.current && isOnline;
    prevOnline.current = isOnline;

    if (cameBackOnline && syncResults) {
      if (syncedCount > 0 && resultFailed === 0) {
        setToast({
          message: t('mobile.offline.syncSuccess', { count: syncedCount }),
          variant: 'success',
        });
      } else if (resultFailed > 0) {
        setToast({
          message: t('mobile.offline.syncFailed', { count: resultFailed }),
          variant: 'warning',
          retry: true,
        });
      }
    }
  }, [isOnline, syncResults, syncedCount, resultFailed, t]);

  // Auto-dismiss success toasts
  useEffect(() => {
    if (toast && toast.variant === 'success') {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRetry = useCallback(() => {
    setToast(null);
    triggerSync();
  }, [triggerSync]);

  const handleDismiss = useCallback(() => {
    setToast(null);
  }, []);

  const toastElement = toast ? (
    <SyncToast
      message={toast.message}
      variant={toast.variant}
      onRetry={toast.retry ? handleRetry : undefined}
      onDismiss={handleDismiss}
    />
  ) : null;

  return { toastElement };
};
