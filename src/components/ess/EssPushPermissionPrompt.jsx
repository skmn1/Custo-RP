/**
 * EssPushPermissionPrompt — Task 60
 *
 * Banner that asks the user to enable push notifications.
 *
 * Shown when:
 *   1. User is authenticated (handled by parent — only rendered inside EssLayout)
 *   2. Notification.permission === 'default' (not yet asked)
 *   3. The user has not dismissed this prompt in the last 14 days
 *   4. The app is running in standalone mode OR the user has visited ESS ≥ 3 times
 *   5. serviceWorker and PushManager are available
 */

import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { subscribeToPush, isDismissedRecently } from '../../lib/essPushSubscription';

const DISMISS_KEY     = 'ess-push-dismissed';
const DISMISS_DAYS    = 14;
const VISIT_MIN_COUNT = 3;

const EssPushPermissionPrompt = ({ onSubscribed }) => {
  const { t } = useTranslation('ess');
  const [show, setShow]         = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    // Guard: API availability
    if (typeof Notification === 'undefined' || !('PushManager' in window)) return;
    if (Notification.permission !== 'default') return;
    if (isDismissedRecently(DISMISS_KEY, DISMISS_DAYS)) return;

    // Stand-alone mode or enough visits
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    const visitCount = parseInt(localStorage.getItem('ess-visit-count') || '0', 10);

    if (isStandalone || visitCount >= VISIT_MIN_COUNT) {
      setShow(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPush();
        onSubscribed?.('success');
      } else if (permission === 'denied') {
        onSubscribed?.('denied');
      }
    } catch {
      // Push subscribe failed (e.g. VAPID not set) — silently ignore
    } finally {
      setLoading(false);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="bg-blue-50 border border-blue-200
                 rounded-xl p-4 flex items-start gap-3 shadow-sm"
      role="banner"
      aria-label={t('pwa.push.title')}
      data-testid="ess-push-permission-prompt"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <BellIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900 leading-snug">
          {t('pwa.push.title')}
        </p>
        <p className="text-sm text-blue-700 mt-0.5 leading-relaxed">
          {t('pwa.push.body')}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-60 transition-colors"
            data-testid="ess-push-enable-btn"
          >
            {isLoading ? '…' : t('pwa.push.enableBtn')}
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-blue-600 hover:underline"
            data-testid="ess-push-dismiss-btn"
          >
            {t('pwa.push.dismissBtn')}
          </button>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-blue-400 hover:text-blue-600
                   focus:outline-none"
        aria-label="Dismiss"
      >
        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default EssPushPermissionPrompt;
