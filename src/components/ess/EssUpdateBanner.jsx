import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getEssServiceWorkerRegistration } from '../../lib/essServiceWorker';

/**
 * EssUpdateBanner — Task 57
 *
 * Appears when the `ess-sw-update-available` event fires (a new service
 * worker version is waiting to take over).
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────┐
 *  │  ↻  A new version is available.       [Update] ✕ │
 *  └──────────────────────────────────────────────────┘
 *
 * Clicking "Update":
 *  1. Sends SKIP_WAITING to the waiting service worker
 *  2. The SW's `controllerchange` listener in essServiceWorker.js reloads
 *
 * Clicking "Later" (✕) dismisses the banner for the session.
 */
export default function EssUpdateBanner() {
  const { t } = useTranslation('ess');
  const [visible, setVisible] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const handler = async (event) => {
      // event.detail.registration may be provided by essServiceWorker.js
      const reg = event?.detail?.registration ?? (await getEssServiceWorkerRegistration());
      setRegistration(reg ?? null);
      setVisible(true);
    };

    window.addEventListener('ess-sw-update-available', handler);
    return () => window.removeEventListener('ess-sw-update-available', handler);
  }, []);

  const handleUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // Reload is triggered by the controllerchange listener in essServiceWorker.js
    } else {
      // If waiting worker reference is lost, do a hard reload
      window.location.reload();
    }
    setVisible(false);
  }, [registration]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('pwa.update.available', 'A new version is available')}
      className="relative z-40 flex items-center gap-3 bg-blue-600 px-4 py-2.5 text-sm text-white
                 dark:bg-blue-700"
    >
      <ArrowPathIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 font-medium">
        {t('pwa.update.available', 'A new version is available')}
      </span>
      <button
        onClick={handleUpdate}
        className="shrink-0 rounded-md bg-white px-3 py-1 text-xs font-semibold text-blue-700
                   shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        {t('pwa.update.updateBtn', 'Update')}
      </button>
      <button
        onClick={handleDismiss}
        aria-label={t('pwa.update.dismiss', 'Later')}
        className="shrink-0 rounded-full p-1 text-blue-200 hover:bg-blue-500 hover:text-white
                   focus:outline-none focus:ring-2 focus:ring-white"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
