/**
 * MobileInstallPrompt — Task 72
 *
 * Custom mobile-native install prompt using BottomSheet.
 * - Android/Chrome: captures beforeinstallprompt, shows branded sheet with install button
 * - iOS Safari: shows manual install instructions (share → Add to Home Screen)
 * - Eligibility: visit count ≥ 2, not dismissed within 30 days, not standalone, mobile viewport
 *
 * Consumes BottomSheet from task 63 and existing PWA infrastructure from task 56.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareIcon } from '@heroicons/react/24/outline';
import BottomSheet from './BottomSheet';

// ── Constants ─────────────────────────────────────────────────────

const VISIT_KEY = 'ess-install-visits';
const DISMISS_KEY = 'ess-mobile-install-dismissed';
const DISMISS_DAYS = 30;

// ── Eligibility helpers ───────────────────────────────────────────

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export const isIOSDevice = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isEligibleForPrompt = () => {
  const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
  const dismissedAt = localStorage.getItem(DISMISS_KEY);

  if (dismissedAt) {
    const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
    if (daysSince < DISMISS_DAYS) return false;
  }

  return visits >= 2;
};

export const incrementVisitCount = () => {
  try {
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    localStorage.setItem(VISIT_KEY, String(visits + 1));
  } catch { /* storage full or blocked */ }
};

// ── Component ─────────────────────────────────────────────────────

const MobileInstallPrompt = () => {
  const { t } = useTranslation('ess');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const promptRef = useRef(null);

  // Capture beforeinstallprompt or detect iOS
  useEffect(() => {
    if (isStandalone()) return;

    if (isIOSDevice()) {
      setShowIOS(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      promptRef.current = e;
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const installedHandler = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      promptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
    setDismissed(true);
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      try { localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
    }
    promptRef.current = null;
    setDeferredPrompt(null);
    setCanInstall(false);
  }, []);

  // Determine visibility
  const eligible = isEligibleForPrompt();
  const shouldShowAndroid = canInstall && !dismissed && eligible;
  const shouldShowIOS = showIOS && !dismissed && eligible && !isStandalone();
  const isOpen = shouldShowAndroid || shouldShowIOS;

  if (!isOpen) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleDismiss}
      title={t('mobile.install.title')}
    >
      <div
        className="flex flex-col items-center px-2 py-2"
        data-testid="mobile-install-prompt"
      >
        <img
          src="/icons/ess/icon-192.png"
          alt=""
          aria-hidden="true"
          className="h-16 w-16 rounded-2xl shadow-md"
        />
        <h2
          className="text-mobile-title2 text-[var(--mobile-label-primary)] mt-4 text-center"
          data-testid="install-prompt-title"
        >
          {t('mobile.install.title')}
        </h2>

        {shouldShowIOS ? (
          /* ── iOS manual instructions ── */
          <div className="w-full mt-4" data-testid="install-ios-steps">
            <ol className="space-y-3 text-mobile-body text-[var(--mobile-label-secondary)]">
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-tint)]/10 text-xs font-bold text-[var(--mobile-tint)]">
                  1
                </span>
                <span>
                  {t('mobile.install.iosStep1')}{' '}
                  <ShareIcon className="inline h-4 w-4 text-[var(--mobile-tint)]" aria-hidden="true" />
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-tint)]/10 text-xs font-bold text-[var(--mobile-tint)]">
                  2
                </span>
                <span>{t('mobile.install.iosStep2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-tint)]/10 text-xs font-bold text-[var(--mobile-tint)]">
                  3
                </span>
                <span>{t('mobile.install.iosStep3')}</span>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full mt-6 bg-[var(--mobile-tint)] text-white rounded-2xl py-3.5 text-mobile-body font-semibold active:opacity-80"
              data-testid="install-ios-got-it"
            >
              {t('mobile.install.gotIt')}
            </button>
          </div>
        ) : (
          /* ── Android/Chrome install flow ── */
          <>
            <p className="text-mobile-body text-[var(--mobile-label-secondary)] mt-2 text-center max-w-[280px]">
              {t('mobile.install.valueProp')}
            </p>
            <button
              onClick={handleInstall}
              className="w-full mt-6 bg-[var(--mobile-tint)] text-white rounded-2xl py-3.5 text-mobile-body font-semibold active:opacity-80"
              data-testid="install-add-button"
            >
              {t('mobile.install.addToHomeScreen')}
            </button>
            <button
              onClick={handleDismiss}
              className="mt-3 mb-2 text-mobile-subheadline text-[var(--mobile-label-secondary)]"
              data-testid="install-not-now"
            >
              {t('mobile.install.notNow')}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
};

export default MobileInstallPrompt;
