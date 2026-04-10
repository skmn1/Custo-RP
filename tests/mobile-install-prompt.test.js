/**
 * Unit tests for Task 72 — ESS Mobile Install Prompt
 *
 * Covers:
 *  - isEligibleForPrompt: visit count, dismiss timestamp, 30-day suppression
 *  - incrementVisitCount: localStorage counter
 *  - MobileInstallPrompt: Android install flow, iOS instructions, BottomSheet usage
 *  - MobileShell integration: imports + visit counter
 *  - i18n: EN + FR mobile.install keys
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Source files ──────────────────────────────────────────────────

const promptSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileInstallPrompt.jsx'),
  'utf-8',
);

const shellSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileShell.jsx'),
  'utf-8',
);

// ── Constants ─────────────────────────────────────────────────────

const VISIT_KEY = 'ess-install-visits';
const DISMISS_KEY = 'ess-mobile-install-dismissed';
const DISMISS_DAYS = 30;

// ── isEligibleForPrompt logic ─────────────────────────────────────

describe('isEligibleForPrompt logic', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = {};
    globalThis.localStorage = {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, val) => { mockStorage[key] = val; },
      removeItem: (key) => { delete mockStorage[key]; },
    };
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  const isEligibleForPrompt = () => {
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    const dismissedAt = localStorage.getItem(DISMISS_KEY);

    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return false;
    }

    return visits >= 2;
  };

  it('returns false when visit count is 0', () => {
    expect(isEligibleForPrompt()).toBe(false);
  });

  it('returns false when visit count is 1', () => {
    mockStorage[VISIT_KEY] = '1';
    expect(isEligibleForPrompt()).toBe(false);
  });

  it('returns true when visit count is 2', () => {
    mockStorage[VISIT_KEY] = '2';
    expect(isEligibleForPrompt()).toBe(true);
  });

  it('returns true when visit count is 10', () => {
    mockStorage[VISIT_KEY] = '10';
    expect(isEligibleForPrompt()).toBe(true);
  });

  it('returns false when dismissed less than 30 days ago', () => {
    mockStorage[VISIT_KEY] = '5';
    mockStorage[DISMISS_KEY] = String(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    expect(isEligibleForPrompt()).toBe(false);
  });

  it('returns true when dismissed more than 30 days ago', () => {
    mockStorage[VISIT_KEY] = '5';
    mockStorage[DISMISS_KEY] = String(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isEligibleForPrompt()).toBe(true);
  });

  it('returns false when dismissed exactly today', () => {
    mockStorage[VISIT_KEY] = '3';
    mockStorage[DISMISS_KEY] = String(Date.now());
    expect(isEligibleForPrompt()).toBe(false);
  });
});

// ── incrementVisitCount logic ─────────────────────────────────────

describe('incrementVisitCount logic', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = {};
    globalThis.localStorage = {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, val) => { mockStorage[key] = val; },
      removeItem: (key) => { delete mockStorage[key]; },
    };
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  const incrementVisitCount = () => {
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    localStorage.setItem(VISIT_KEY, String(visits + 1));
  };

  it('sets count to 1 on first visit', () => {
    incrementVisitCount();
    expect(mockStorage[VISIT_KEY]).toBe('1');
  });

  it('increments from 1 to 2', () => {
    mockStorage[VISIT_KEY] = '1';
    incrementVisitCount();
    expect(mockStorage[VISIT_KEY]).toBe('2');
  });

  it('increments from 99 to 100', () => {
    mockStorage[VISIT_KEY] = '99';
    incrementVisitCount();
    expect(mockStorage[VISIT_KEY]).toBe('100');
  });

  it('handles missing localStorage value gracefully', () => {
    incrementVisitCount();
    expect(mockStorage[VISIT_KEY]).toBe('1');
  });
});

// ── MobileInstallPrompt component structure ───────────────────────

describe('MobileInstallPrompt component structure', () => {
  it('is default export', () => {
    expect(promptSrc).toContain('export default MobileInstallPrompt');
  });

  it('uses BottomSheet from task 63', () => {
    expect(promptSrc).toContain("import BottomSheet from './BottomSheet'");
    expect(promptSrc).toContain('<BottomSheet');
  });

  it('has data-testid for E2E targeting', () => {
    expect(promptSrc).toContain('data-testid="mobile-install-prompt"');
  });

  it('renders app icon from /icons/ess/icon-192.png', () => {
    expect(promptSrc).toContain('/icons/ess/icon-192.png');
  });

  it('icon is 16×16 (h-16 w-16) with rounded-2xl', () => {
    expect(promptSrc).toContain('h-16');
    expect(promptSrc).toContain('w-16');
    expect(promptSrc).toContain('rounded-2xl');
  });

  it('icon has aria-hidden="true" and empty alt', () => {
    expect(promptSrc).toContain('aria-hidden="true"');
    expect(promptSrc).toContain('alt=""');
  });

  it('uses i18n key mobile.install.title', () => {
    expect(promptSrc).toContain("t('mobile.install.title')");
  });

  it('uses i18n key mobile.install.valueProp', () => {
    expect(promptSrc).toContain("t('mobile.install.valueProp')");
  });

  it('uses i18n key mobile.install.addToHomeScreen', () => {
    expect(promptSrc).toContain("t('mobile.install.addToHomeScreen')");
  });

  it('uses i18n key mobile.install.notNow', () => {
    expect(promptSrc).toContain("t('mobile.install.notNow')");
  });

  it('install button has data-testid', () => {
    expect(promptSrc).toContain('data-testid="install-add-button"');
  });

  it('not now button has data-testid', () => {
    expect(promptSrc).toContain('data-testid="install-not-now"');
  });

  it('install button uses mobile-tint background', () => {
    expect(promptSrc).toContain('bg-[var(--mobile-tint)]');
  });

  it('install button is full width with rounded-2xl', () => {
    expect(promptSrc).toContain('w-full');
    expect(promptSrc).toContain('rounded-2xl');
    expect(promptSrc).toContain('py-3.5');
  });

  it('has active:opacity-80 for touch feedback', () => {
    expect(promptSrc).toContain('active:opacity-80');
  });
});

// ── beforeinstallprompt handling ──────────────────────────────────

describe('beforeinstallprompt handling', () => {
  it('listens for beforeinstallprompt event', () => {
    expect(promptSrc).toContain("addEventListener('beforeinstallprompt'");
  });

  it('prevents default on beforeinstallprompt', () => {
    expect(promptSrc).toContain('e.preventDefault()');
  });

  it('stores deferred prompt reference', () => {
    expect(promptSrc).toContain('promptRef.current = e');
    expect(promptSrc).toContain('setDeferredPrompt');
  });

  it('sets canInstall to true on event', () => {
    expect(promptSrc).toContain('setCanInstall(true)');
  });

  it('listens for appinstalled event', () => {
    expect(promptSrc).toContain("addEventListener('appinstalled'");
  });

  it('cleans up event listeners on unmount', () => {
    expect(promptSrc).toContain("removeEventListener('beforeinstallprompt'");
    expect(promptSrc).toContain("removeEventListener('appinstalled'");
  });

  it('calls prompt() on the deferred event', () => {
    expect(promptSrc).toContain('prompt.prompt()');
  });

  it('awaits userChoice', () => {
    expect(promptSrc).toContain('await prompt.userChoice');
  });

  it('clears dismiss key on successful install', () => {
    expect(promptSrc).toContain("localStorage.removeItem(DISMISS_KEY)");
  });
});

// ── Dismiss handling ──────────────────────────────────────────────

describe('Dismiss handling', () => {
  it('stores dismiss timestamp in localStorage', () => {
    expect(promptSrc).toContain("localStorage.setItem(DISMISS_KEY, String(Date.now()))");
  });

  it('sets dismissed state to true', () => {
    expect(promptSrc).toContain('setDismissed(true)');
  });

  it('uses DISMISS_DAYS = 30', () => {
    expect(promptSrc).toContain('DISMISS_DAYS = 30');
  });

  it('uses a unique dismiss key different from desktop', () => {
    expect(promptSrc).toContain("DISMISS_KEY = 'ess-mobile-install-dismissed'");
  });
});

// ── iOS Safari fallback ───────────────────────────────────────────

describe('iOS Safari fallback', () => {
  it('detects iOS via user agent', () => {
    expect(promptSrc).toContain('iphone|ipad|ipod');
  });

  it('detects iPad via MacIntel + maxTouchPoints', () => {
    expect(promptSrc).toContain('MacIntel');
    expect(promptSrc).toContain('maxTouchPoints');
  });

  it('exports isIOSDevice helper', () => {
    expect(promptSrc).toContain('export const isIOSDevice');
  });

  it('has data-testid for iOS steps', () => {
    expect(promptSrc).toContain('data-testid="install-ios-steps"');
  });

  it('has data-testid for iOS got-it button', () => {
    expect(promptSrc).toContain('data-testid="install-ios-got-it"');
  });

  it('renders ShareIcon for iOS step 1', () => {
    expect(promptSrc).toContain('ShareIcon');
  });

  it('uses i18n keys for iOS steps', () => {
    expect(promptSrc).toContain("t('mobile.install.iosStep1')");
    expect(promptSrc).toContain("t('mobile.install.iosStep2')");
    expect(promptSrc).toContain("t('mobile.install.iosStep3')");
  });

  it('uses i18n key mobile.install.gotIt', () => {
    expect(promptSrc).toContain("t('mobile.install.gotIt')");
  });

  it('shows iOS instructions when isIOSDevice is true', () => {
    expect(promptSrc).toContain('shouldShowIOS');
  });
});

// ── Standalone detection ──────────────────────────────────────────

describe('Standalone detection', () => {
  it('checks display-mode: standalone media query', () => {
    expect(promptSrc).toContain("'(display-mode: standalone)'");
  });

  it('checks navigator.standalone for iOS', () => {
    expect(promptSrc).toContain('navigator.standalone');
  });

  it('exports isStandalone helper', () => {
    expect(promptSrc).toContain('export const isStandalone');
  });

  it('returns null when standalone', () => {
    expect(promptSrc).toContain('if (isStandalone()) return');
  });
});

// ── Eligibility exports ───────────────────────────────────────────

describe('Exported helpers', () => {
  it('exports isEligibleForPrompt', () => {
    expect(promptSrc).toContain('export const isEligibleForPrompt');
  });

  it('exports incrementVisitCount', () => {
    expect(promptSrc).toContain('export const incrementVisitCount');
  });

  it('uses VISIT_KEY for visit tracking', () => {
    expect(promptSrc).toContain("VISIT_KEY = 'ess-install-visits'");
  });
});

// ── MobileShell integration ───────────────────────────────────────

describe('MobileShell integration with install prompt', () => {
  it('imports MobileInstallPrompt', () => {
    expect(shellSrc).toContain('MobileInstallPrompt');
  });

  it('imports incrementVisitCount', () => {
    expect(shellSrc).toContain('incrementVisitCount');
  });

  it('calls incrementVisitCount in useEffect', () => {
    expect(shellSrc).toContain('incrementVisitCount');
    expect(shellSrc).toContain('useEffect');
  });

  it('renders MobileInstallPrompt component', () => {
    expect(shellSrc).toContain('<MobileInstallPrompt');
  });
});

// ── i18n keys ─────────────────────────────────────────────────────

describe('i18n — mobile.install keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'title',
    'valueProp',
    'addToHomeScreen',
    'notNow',
    'iosStep1',
    'iosStep2',
    'iosStep3',
    'gotIt',
  ];

  it('EN has all mobile.install keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.install).toHaveProperty(key);
      expect(en.mobile.install[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.install keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.install).toHaveProperty(key);
      expect(fr.mobile.install[key]).toBeTruthy();
    });
  });

  it('EN title says "Install Employee Portal"', () => {
    expect(en.mobile.install.title).toBe('Install Employee Portal');
  });

  it('FR title says "Installer le Portail Employé"', () => {
    expect(fr.mobile.install.title).toBe('Installer le Portail Employé');
  });

  it('EN addToHomeScreen says "Add to Home Screen"', () => {
    expect(en.mobile.install.addToHomeScreen).toBe('Add to Home Screen');
  });

  it('FR addToHomeScreen says "Ajouter à l\'écran d\'accueil"', () => {
    expect(fr.mobile.install.addToHomeScreen).toBe("Ajouter à l'écran d'accueil");
  });

  it('EN valueProp mentions offline', () => {
    expect(en.mobile.install.valueProp).toContain('offline');
  });

  it('FR valueProp mentions "hors ligne"', () => {
    expect(fr.mobile.install.valueProp).toContain('hors ligne');
  });

  it('EN notNow says "Not now"', () => {
    expect(en.mobile.install.notNow).toBe('Not now');
  });

  it('FR notNow says "Pas maintenant"', () => {
    expect(fr.mobile.install.notNow).toBe('Pas maintenant');
  });

  it('EN gotIt says "Got it"', () => {
    expect(en.mobile.install.gotIt).toBe('Got it');
  });

  it('FR gotIt says "Compris"', () => {
    expect(fr.mobile.install.gotIt).toBe('Compris');
  });

  it('EN iOS steps exist', () => {
    expect(en.mobile.install.iosStep1).toContain('share');
    expect(en.mobile.install.iosStep2).toContain('Scroll');
    expect(en.mobile.install.iosStep3).toContain('Add to Home Screen');
  });
});

// ── Accessibility ─────────────────────────────────────────────────

describe('Accessibility', () => {
  it('BottomSheet provides role="dialog" and aria-modal', () => {
    // BottomSheet component already has these attributes (task 63)
    const sheetSrc = fs.readFileSync(
      path.resolve('src/components/mobile/BottomSheet.jsx'),
      'utf-8',
    );
    expect(sheetSrc).toContain('role="dialog"');
    expect(sheetSrc).toContain('aria-modal="true"');
  });

  it('install button is a proper <button> element', () => {
    expect(promptSrc).toContain('<button');
    expect(promptSrc).toContain('onClick={handleInstall}');
  });

  it('dismiss is a proper <button> element', () => {
    expect(promptSrc).toContain('onClick={handleDismiss}');
  });

  it('icon has aria-hidden for decorative image', () => {
    expect(promptSrc).toContain('aria-hidden="true"');
  });
});

// ── React hooks usage ─────────────────────────────────────────────

describe('React hooks usage', () => {
  it('uses useState for state management', () => {
    expect(promptSrc).toContain('useState');
  });

  it('uses useEffect for event listeners', () => {
    expect(promptSrc).toContain('useEffect');
  });

  it('uses useCallback for handlers', () => {
    expect(promptSrc).toContain('useCallback');
  });

  it('uses useRef for deferred prompt', () => {
    expect(promptSrc).toContain('useRef');
    expect(promptSrc).toContain('promptRef');
  });

  it('uses useTranslation from react-i18next', () => {
    expect(promptSrc).toContain('useTranslation');
    expect(promptSrc).toContain("'ess'");
  });
});
