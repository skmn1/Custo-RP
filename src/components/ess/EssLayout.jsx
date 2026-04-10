import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import EssInstallPrompt from './EssInstallPrompt';
import EssUpdateBanner from './EssUpdateBanner';
import EssOfflineBanner from './EssOfflineBanner';
import EssSyncStatusBanner from './EssSyncStatusBanner';
import EssPushPermissionPrompt from './EssPushPermissionPrompt';
import { registerEssServiceWorker } from '../../lib/essServiceWorker';
import { EssConnectivityProvider } from '../../contexts/EssConnectivityContext';

/**
 * EssLayout — Task 56 / 57 / 58
 *
 * Injects PWA manifest link and Apple-specific meta tags, registers the ESS
 * service worker (scoped to /app/ess/), provides the connectivity context,
 * and mounts the offline banner, update banner, and install prompt.
 */
export default function EssLayout({ children }) {
  const { t } = useTranslation('ess');
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    registerEssServiceWorker();

    // Increment visit counter for push permission prompt gating
    const count = parseInt(localStorage.getItem('ess-visit-count') || '0', 10);
    localStorage.setItem('ess-visit-count', String(count + 1));
  }, []);

  return (
    <EssConnectivityProvider>
      <Helmet>
        {/* PWA manifest scoped to /app/ess/ */}
        <link rel="manifest" href="/ess-manifest.json" />

        {/* Theme colour for browser chrome */}
        <meta name="theme-color" content="#3B82F6" />

        {/* Apple-specific PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={t('appName')} />
        <link rel="apple-touch-icon" href="/icons/ess/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/ess/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/ess/icon-512.png" />

        {/* Microsoft tiles */}
        <meta name="msapplication-TileImage" content="/icons/ess/icon-144.png" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </Helmet>

      {/* Offline status banner (amber, above sync banner) */}
      <EssOfflineBanner />

      {/* Background sync status (pending count, syncing, results) */}
      <EssSyncStatusBanner />

      {/* SW update notification (shown above the app shell content) */}
      <EssUpdateBanner />

      {/* Push permission prompt (shown after 3 visits, not dismissed) */}
      {!pushSubscribed && (
        <EssPushPermissionPrompt onSubscribed={() => setPushSubscribed(true)} />
      )}

      {children}

      {/* PWA install prompt (Android banner / iOS bottom sheet) */}
      <EssInstallPrompt />
    </EssConnectivityProvider>
  );
}
