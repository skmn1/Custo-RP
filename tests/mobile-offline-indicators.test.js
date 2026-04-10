/**
 * Unit tests for Task 71 — ESS Mobile Offline & Sync Indicators
 *
 * Covers:
 *  - MobileOfflineBanner: structure, accessibility, positioning, animation
 *  - QueuedActionsNotice: inline notice, testid, i18n usage
 *  - QueuedBadge: amber dot, absolute positioning, aria-hidden
 *  - useSyncToast / SyncToast: success/warning variants, auto-dismiss
 *  - MobileShell integration: imports MobileOfflineBanner + useSyncToast
 *  - BottomNav integration: imports QueuedBadge, profile tab badge
 *  - MobileProfile integration: imports QueuedActionsNotice
 *  - MobileNotifications integration: imports QueuedActionsNotice
 *  - i18n: EN + FR mobile.offline keys
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Source files ──────────────────────────────────────────────────

const indicatorsSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileOfflineIndicators.jsx'),
  'utf-8',
);

const shellSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileShell.jsx'),
  'utf-8',
);

const navSrc = fs.readFileSync(
  path.resolve('src/components/mobile/BottomNav.jsx'),
  'utf-8',
);

const profileSrc = fs.readFileSync(
  path.resolve('src/components/ess/profile/MobileProfile.jsx'),
  'utf-8',
);

const notificationsSrc = fs.readFileSync(
  path.resolve('src/components/ess/notifications/MobileNotifications.jsx'),
  'utf-8',
);

// ── MobileOfflineBanner ───────────────────────────────────────────

describe('MobileOfflineBanner component', () => {
  it('exports MobileOfflineBanner', () => {
    expect(indicatorsSrc).toContain('export const MobileOfflineBanner');
  });

  it('consumes useEssConnectivity for online status', () => {
    expect(indicatorsSrc).toContain('useEssConnectivity');
    expect(indicatorsSrc).toContain('isOnline');
  });

  it('has role="status" for screen reader announcements', () => {
    expect(indicatorsSrc).toContain('role="status"');
  });

  it('has aria-live="polite"', () => {
    expect(indicatorsSrc).toContain('aria-live="polite"');
  });

  it('has data-testid for E2E targeting', () => {
    expect(indicatorsSrc).toContain('data-testid="mobile-offline-banner"');
  });

  it('uses z-[45] to sit above content but below bottom nav', () => {
    expect(indicatorsSrc).toContain('z-[45]');
  });

  it('positions above bottom nav with safe-area-inset', () => {
    expect(indicatorsSrc).toContain('bottom-[calc(env(safe-area-inset-bottom,0px)+4rem)]');
  });

  it('uses amber-500 background', () => {
    expect(indicatorsSrc).toContain('bg-amber-500');
  });

  it('has backdrop-blur for frosted effect', () => {
    expect(indicatorsSrc).toContain('backdrop-blur-sm');
  });

  it('uses translate-y for slide animation', () => {
    expect(indicatorsSrc).toContain('translate-y-0');
    expect(indicatorsSrc).toContain('translate-y-full');
  });

  it('applies transition-transform for smooth animation', () => {
    expect(indicatorsSrc).toContain('transition-transform');
    expect(indicatorsSrc).toContain('duration-150');
  });

  it('renders ExclamationTriangleIcon', () => {
    expect(indicatorsSrc).toContain('ExclamationTriangleIcon');
  });

  it('uses i18n key mobile.offline.youAreOffline', () => {
    expect(indicatorsSrc).toContain("t('mobile.offline.youAreOffline')");
  });

  it('uses requestAnimationFrame for enter animation', () => {
    expect(indicatorsSrc).toContain('requestAnimationFrame');
  });

  it('returns null when not visible', () => {
    expect(indicatorsSrc).toContain('if (!visible) return null');
  });
});

// ── QueuedActionsNotice ───────────────────────────────────────────

describe('QueuedActionsNotice component', () => {
  it('exports QueuedActionsNotice', () => {
    expect(indicatorsSrc).toContain('export const QueuedActionsNotice');
  });

  it('consumes useEssSyncStatus for pendingCount', () => {
    expect(indicatorsSrc).toContain('useEssSyncStatus');
    expect(indicatorsSrc).toContain('pendingCount');
  });

  it('renders nothing when pendingCount is 0', () => {
    expect(indicatorsSrc).toContain('if (pendingCount === 0) return null');
  });

  it('has data-testid for E2E targeting', () => {
    expect(indicatorsSrc).toContain('data-testid="queued-actions-notice"');
  });

  it('uses amber-50 background in light mode', () => {
    expect(indicatorsSrc).toContain('bg-amber-50');
  });

  it('uses dark:bg-amber-900/20 for dark mode', () => {
    expect(indicatorsSrc).toContain('dark:bg-amber-900/20');
  });

  it('renders ArrowUpTrayIcon', () => {
    expect(indicatorsSrc).toContain('ArrowUpTrayIcon');
  });

  it('uses i18n key mobile.offline.queuedActions with count', () => {
    expect(indicatorsSrc).toContain("t('mobile.offline.queuedActions'");
    expect(indicatorsSrc).toContain('count: pendingCount');
  });

  it('uses rounded-xl styling', () => {
    expect(indicatorsSrc).toContain('rounded-xl');
  });
});

// ── QueuedBadge ───────────────────────────────────────────────────

describe('QueuedBadge component', () => {
  it('exports QueuedBadge', () => {
    expect(indicatorsSrc).toContain('export const QueuedBadge');
  });

  it('uses absolute positioning for overlay on nav tab', () => {
    expect(indicatorsSrc).toContain('absolute');
    expect(indicatorsSrc).toContain('-top-0.5');
    expect(indicatorsSrc).toContain('-right-0.5');
  });

  it('is 2×2 amber dot', () => {
    expect(indicatorsSrc).toContain('h-2');
    expect(indicatorsSrc).toContain('w-2');
    expect(indicatorsSrc).toContain('rounded-full');
    expect(indicatorsSrc).toContain('bg-amber-500');
  });

  it('is aria-hidden to avoid noise for screen readers', () => {
    expect(indicatorsSrc).toContain('aria-hidden="true"');
  });

  it('has data-testid for E2E targeting', () => {
    expect(indicatorsSrc).toContain('data-testid="queued-badge"');
  });

  it('renders nothing when pendingCount is 0', () => {
    // The same pattern: if (pendingCount === 0) return null
    const badgeSection = indicatorsSrc.split('export const QueuedBadge')[1];
    expect(badgeSection).toContain('if (pendingCount === 0) return null');
  });
});

// ── SyncToast / useSyncToast ──────────────────────────────────────

describe('SyncToast and useSyncToast', () => {
  it('exports useSyncToast hook', () => {
    expect(indicatorsSrc).toContain('export const useSyncToast');
  });

  it('has internal SyncToast component', () => {
    expect(indicatorsSrc).toContain('const SyncToast');
  });

  it('SyncToast has data-testid', () => {
    expect(indicatorsSrc).toContain('data-testid="sync-toast"');
  });

  it('SyncToast uses z-[60] for highest layer', () => {
    expect(indicatorsSrc).toContain('z-[60]');
  });

  it('SyncToast positions at bottom-24', () => {
    expect(indicatorsSrc).toContain('bottom-24');
  });

  it('success variant uses green-600', () => {
    expect(indicatorsSrc).toContain('bg-green-600');
  });

  it('warning variant uses amber-600', () => {
    expect(indicatorsSrc).toContain('bg-amber-600');
  });

  it('renders CheckCircleIcon for success', () => {
    expect(indicatorsSrc).toContain('CheckCircleIcon');
  });

  it('renders ExclamationTriangleIcon for warning', () => {
    expect(indicatorsSrc).toContain('ExclamationTriangleIcon');
  });

  it('tracks previous online state with useRef', () => {
    expect(indicatorsSrc).toContain('prevOnline');
    expect(indicatorsSrc).toContain('useRef');
  });

  it('detects reconnection (came back online)', () => {
    expect(indicatorsSrc).toContain('!prevOnline.current && isOnline');
  });

  it('consumes syncResults and syncedCount from useEssSyncStatus', () => {
    expect(indicatorsSrc).toContain('syncResults');
    expect(indicatorsSrc).toContain('syncedCount');
  });

  it('uses i18n key mobile.offline.syncSuccess', () => {
    expect(indicatorsSrc).toContain("t('mobile.offline.syncSuccess'");
  });

  it('uses i18n key mobile.offline.syncFailed', () => {
    expect(indicatorsSrc).toContain("t('mobile.offline.syncFailed'");
  });

  it('auto-dismisses success toast after 3000ms', () => {
    expect(indicatorsSrc).toContain('3000');
    expect(indicatorsSrc).toContain("toast.variant === 'success'");
  });

  it('warning toast supports retry via triggerSync', () => {
    expect(indicatorsSrc).toContain('triggerSync');
    expect(indicatorsSrc).toContain('handleRetry');
  });

  it('returns toastElement from hook', () => {
    expect(indicatorsSrc).toContain('return { toastElement }');
  });
});

// ── MobileShell integration ───────────────────────────────────────

describe('MobileShell integration with offline indicators', () => {
  it('imports MobileOfflineBanner', () => {
    expect(shellSrc).toContain('MobileOfflineBanner');
  });

  it('imports useSyncToast', () => {
    expect(shellSrc).toContain('useSyncToast');
  });

  it('renders MobileOfflineBanner between content and BottomNav', () => {
    expect(shellSrc).toContain('<MobileOfflineBanner');
  });

  it('renders toastElement from useSyncToast', () => {
    expect(shellSrc).toContain('toastElement');
  });
});

// ── BottomNav integration ─────────────────────────────────────────

describe('BottomNav integration with QueuedBadge', () => {
  it('imports QueuedBadge from MobileOfflineIndicators', () => {
    expect(navSrc).toContain('QueuedBadge');
  });

  it('NavLink has relative class for badge positioning', () => {
    expect(navSrc).toContain('relative');
  });

  it('renders QueuedBadge on profile tab', () => {
    expect(navSrc).toContain("id === 'profile'");
    expect(navSrc).toContain('<QueuedBadge');
  });
});

// ── MobileProfile integration ─────────────────────────────────────

describe('MobileProfile integration with QueuedActionsNotice', () => {
  it('imports QueuedActionsNotice', () => {
    expect(profileSrc).toContain('QueuedActionsNotice');
  });

  it('renders QueuedActionsNotice component', () => {
    expect(profileSrc).toContain('<QueuedActionsNotice');
  });
});

// ── MobileNotifications integration ───────────────────────────────

describe('MobileNotifications integration with QueuedActionsNotice', () => {
  it('imports QueuedActionsNotice', () => {
    expect(notificationsSrc).toContain('QueuedActionsNotice');
  });

  it('renders QueuedActionsNotice component', () => {
    expect(notificationsSrc).toContain('<QueuedActionsNotice');
  });
});

// ── i18n keys ─────────────────────────────────────────────────────

describe('i18n — mobile.offline keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'youAreOffline',
    'queuedActions',
    'queuedActions_plural',
    'syncSuccess',
    'syncSuccess_plural',
    'syncFailed',
    'syncFailed_plural',
  ];

  it('EN has all mobile.offline keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.offline).toHaveProperty(key);
      expect(en.mobile.offline[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.offline keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.offline).toHaveProperty(key);
      expect(fr.mobile.offline[key]).toBeTruthy();
    });
  });

  it('EN youAreOffline is user-friendly', () => {
    expect(en.mobile.offline.youAreOffline).toContain('offline');
  });

  it('FR youAreOffline says "hors ligne"', () => {
    expect(fr.mobile.offline.youAreOffline).toContain('hors ligne');
  });

  it('EN queuedActions uses {{count}} interpolation', () => {
    expect(en.mobile.offline.queuedActions).toContain('{{count}}');
    expect(en.mobile.offline.queuedActions_plural).toContain('{{count}}');
  });

  it('FR queuedActions uses {{count}} interpolation', () => {
    expect(fr.mobile.offline.queuedActions).toContain('{{count}}');
    expect(fr.mobile.offline.queuedActions_plural).toContain('{{count}}');
  });

  it('EN syncSuccess uses {{count}} interpolation', () => {
    expect(en.mobile.offline.syncSuccess).toContain('{{count}}');
    expect(en.mobile.offline.syncSuccess_plural).toContain('{{count}}');
  });

  it('EN syncFailed uses {{count}} interpolation', () => {
    expect(en.mobile.offline.syncFailed).toContain('{{count}}');
    expect(en.mobile.offline.syncFailed_plural).toContain('{{count}}');
  });

  it('FR syncFailed mentions retry ("réessayer")', () => {
    expect(fr.mobile.offline.syncFailed).toContain('réessayer');
  });
});

// ── Heroicons imports ─────────────────────────────────────────────

describe('Required Heroicons are imported', () => {
  it('imports ExclamationTriangleIcon', () => {
    expect(indicatorsSrc).toContain('ExclamationTriangleIcon');
  });

  it('imports ArrowUpTrayIcon', () => {
    expect(indicatorsSrc).toContain('ArrowUpTrayIcon');
  });

  it('imports CheckCircleIcon', () => {
    expect(indicatorsSrc).toContain('CheckCircleIcon');
  });

  it('imports from @heroicons/react/24/outline', () => {
    expect(indicatorsSrc).toContain("@heroicons/react/24/outline");
  });
});

// ── Hook dependencies ─────────────────────────────────────────────

describe('Hook dependencies', () => {
  it('imports useEssConnectivity context', () => {
    expect(indicatorsSrc).toContain('useEssConnectivity');
    expect(indicatorsSrc).toContain('EssConnectivityContext');
  });

  it('imports useEssSyncStatus hook', () => {
    expect(indicatorsSrc).toContain('useEssSyncStatus');
  });

  it('imports useTranslation from react-i18next', () => {
    expect(indicatorsSrc).toContain('useTranslation');
    expect(indicatorsSrc).toContain('react-i18next');
  });

  it('imports React hooks: useEffect, useRef, useState, useCallback', () => {
    expect(indicatorsSrc).toContain('useEffect');
    expect(indicatorsSrc).toContain('useRef');
    expect(indicatorsSrc).toContain('useState');
    expect(indicatorsSrc).toContain('useCallback');
  });
});
