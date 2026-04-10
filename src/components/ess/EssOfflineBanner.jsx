import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';

/**
 * EssOfflineBanner — Task 58
 *
 * Shows an amber banner when the device is offline.
 * When connectivity is restored, briefly shows a "Back online" toast for 3s.
 *
 * Rendered by EssLayout directly above the AppShell children.
 */
export default function EssOfflineBanner() {
  const { isOnline, wasOffline } = useEssConnectivity();
  const { t } = useTranslation('ess');
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  return (
    <>
      {/* Offline amber bar */}
      {!isOnline && (
        <div
          role="status"
          aria-live="assertive"
          data-testid="ess-offline-banner"
          className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900 px-4 py-2 text-sm
                     text-amber-800 dark:text-amber-100"
        >
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{t('pwa.offline.banner', "You're offline \u2014 showing cached data")}</span>
        </div>
      )}

      {/* "Back online" toast — bottom-right, auto-dismiss */}
      {showBackOnline && (
        <div
          role="status"
          aria-live="polite"
          data-testid="ess-back-online-toast"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-600
                     px-4 py-3 text-sm font-medium text-white shadow-xl
                     animate-in slide-in-from-right-4 duration-300"
        >
          <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t('pwa.offline.backOnline', 'Back online \u2014 data refreshed')}
        </div>
      )}
    </>
  );
}
