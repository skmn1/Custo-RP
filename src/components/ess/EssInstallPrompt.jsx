import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ArrowDownTrayIcon, ShareIcon, PlusIcon } from '@heroicons/react/24/outline';

const DISMISS_KEY  = 'ess-pwa-install-dismissed';
const DISMISS_DAYS = 7;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * EssInstallPrompt — shows an install banner for Chrome/Edge/Android
 * and an instructional bottom sheet for iOS Safari.
 */
export default function EssInstallPrompt() {
  const { t } = useTranslation('ess');

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [showIOS, setShowIOS]               = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    if (isIOS()) {
      setShowIOS(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShowBanner(false));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setShowBanner(false);
    setShowIOS(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      try { localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  }, [deferredPrompt]);

  /* ── Android/Chrome install banner ── */
  if (showBanner) {
    return (
      <div
        role="region"
        aria-label={t('pwa.installBanner.ariaLabel', 'Install app banner')}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 bg-blue-600 px-4 py-3 shadow-lg
                   sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-xl sm:max-w-sm sm:w-full"
      >
        <img
          src="/icons/ess/icon-72.png"
          alt=""
          aria-hidden="true"
          className="h-10 w-10 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {t('pwa.installBanner.title', 'Install Employee Portal')}
          </p>
          <p className="truncate text-xs text-blue-200">
            {t('pwa.installBanner.subtitle', 'Add to your home screen for quick access')}
          </p>
        </div>
        <button
          onClick={install}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold
                     text-blue-700 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {t('pwa.installBanner.installButton', 'Install')}
        </button>
        <button
          onClick={dismiss}
          aria-label={t('pwa.installBanner.dismissAriaLabel', 'Dismiss install prompt')}
          className="shrink-0 rounded-full p-1 text-blue-200 hover:bg-blue-500 hover:text-white
                     focus:outline-none focus:ring-2 focus:ring-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  /* ── iOS instructional bottom sheet ── */
  if (showIOS) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('pwa.iosSheet.ariaLabel', 'iOS install instructions')}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white px-5 pb-8 pt-4 shadow-2xl
                  "
      >
        {/* drag handle */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icons/ess/icon-72.png"
              alt=""
              aria-hidden="true"
              className="h-12 w-12 rounded-xl shadow"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {t('pwa.iosSheet.title', 'Install Employee Portal')}
              </p>
              <p className="text-xs text-slate-500">
                {t('pwa.iosSheet.subtitle', 'Add to your home screen')}
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label={t('pwa.installBanner.dismissAriaLabel', 'Dismiss install prompt')}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <ol className="mt-4 space-y-3">
          <li className="flex items-center gap-3 text-sm text-slate-700">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              1
            </span>
            <span>
              {t('pwa.iosSheet.step1', 'Tap the')}&nbsp;
              <ShareIcon className="inline h-4 w-4 text-blue-500" aria-hidden="true" />
              &nbsp;<strong>{t('pwa.iosSheet.shareButton', 'Share')}</strong>&nbsp;
              {t('pwa.iosSheet.step1Suffix', 'button in Safari')}
            </span>
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-700">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              2
            </span>
            <span>
              {t('pwa.iosSheet.step2', 'Select')}&nbsp;
              <PlusIcon className="inline h-4 w-4 text-blue-500" aria-hidden="true" />
              &nbsp;<strong>{t('pwa.iosSheet.addToHomeScreen', 'Add to Home Screen')}</strong>
            </span>
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-700">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              3
            </span>
            <span>{t('pwa.iosSheet.step3', 'Tap Add to confirm')}</span>
          </li>
        </ol>
      </div>
    );
  }

  return null;
}
