import { useTranslation } from 'react-i18next';
import { WifiIcon } from '@heroicons/react/24/outline';

/**
 * EssOfflineFallback — Task 58
 *
 * Shown when an ESS page has no cached data and the device is offline.
 * "Retry" performs a hard reload so the browser can re-attempt the fetch
 * (the SW will try the network first, or serve from cache if available).
 *
 * Props:
 *   title  — optional override for the heading
 *   body   — optional override for the body paragraph
 */
export default function EssOfflineFallback({ title, body }) {
  const { t } = useTranslation('ess');

  return (
    <div
      data-testid="ess-offline-fallback"
      className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <WifiIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-semibold text-slate-800">
        {title ?? t('pwa.offline.fallbackTitle', 'No cached data available')}
      </h2>

      <p className="max-w-sm text-sm text-slate-500">
        {body ?? t(
          'pwa.offline.fallbackBody',
          'This page requires an internet connection for the first visit. Please reconnect and try again.'
        )}
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:ring-offset-2"
      >
        {t('pwa.offline.retryBtn', 'Retry')}
      </button>
    </div>
  );
}
