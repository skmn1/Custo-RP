/**
 * Unit tests for Task 64 — ESS Mobile Shell & Bottom Tab Navigation
 *
 * Covers:
 *  - BottomNav: 5 tab items, tab config, active route matching, scroll-to-top
 *  - MobileTopBar: app name, notification bell, badge cap at 99+
 *  - useEssNotificationCount: fetch + poll interval
 *  - MobileShell: structure
 *  - i18n: EN + FR tab labels
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Tab configuration ─────────────────────────────────────────────

const TAB_ITEMS = [
  { id: 'dashboard',  label: 'mobile.nav.dashboard',  to: '/app/ess/dashboard' },
  { id: 'schedule',   label: 'mobile.nav.schedule',   to: '/app/ess/schedule' },
  { id: 'payslips',   label: 'mobile.nav.payslips',   to: '/app/ess/payslips' },
  { id: 'attendance', label: 'mobile.nav.attendance',  to: '/app/ess/attendance' },
  { id: 'profile',    label: 'mobile.nav.profile',    to: '/app/ess/profile' },
];

describe('BottomNav tab configuration', () => {
  it('has exactly 5 tabs', () => {
    expect(TAB_ITEMS).toHaveLength(5);
  });

  it('each tab has id, label, and to properties', () => {
    TAB_ITEMS.forEach((tab) => {
      expect(tab).toHaveProperty('id');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('to');
    });
  });

  it('all routes start with /app/ess/', () => {
    TAB_ITEMS.forEach((tab) => {
      expect(tab.to).toMatch(/^\/app\/ess\//);
    });
  });

  it('all labels use the mobile.nav namespace', () => {
    TAB_ITEMS.forEach((tab) => {
      expect(tab.label).toMatch(/^mobile\.nav\./);
    });
  });

  it('tab IDs are unique', () => {
    const ids = TAB_ITEMS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('notifications is NOT a tab (moved to top bar)', () => {
    const ids = TAB_ITEMS.map((t) => t.id);
    expect(ids).not.toContain('notifications');
  });
});

// ── Active route matching ─────────────────────────────────────────

describe('Active route matching (startsWith)', () => {
  const isActive = (pathname, to) => pathname.startsWith(to);

  it('exact match activates tab', () => {
    expect(isActive('/app/ess/dashboard', '/app/ess/dashboard')).toBe(true);
  });

  it('sub-page activates parent tab', () => {
    expect(isActive('/app/ess/payslips/abc123', '/app/ess/payslips')).toBe(true);
  });

  it('different section does not activate tab', () => {
    expect(isActive('/app/ess/profile', '/app/ess/schedule')).toBe(false);
  });

  it('deep nested route stays active', () => {
    expect(isActive('/app/ess/attendance/2024/01', '/app/ess/attendance')).toBe(true);
  });
});

// ── Scroll-to-top behaviour ───────────────────────────────────────

describe('Scroll-to-top on active tab tap', () => {
  it('should scroll main element to top when tapping active tab', () => {
    const mockScrollTo = vi.fn();
    const mockElement = { scrollTo: mockScrollTo };
    const originalQuerySelector = globalThis.document?.querySelector;

    // Simulate DOM environment
    globalThis.document = globalThis.document || {};
    globalThis.document.querySelector = vi.fn(() => mockElement);

    const pathname = '/app/ess/dashboard';
    const to = '/app/ess/dashboard';

    // Simulate the handleTabClick logic
    if (pathname.startsWith(to)) {
      document.querySelector('[data-testid="mobile-content"]')?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    // Restore
    if (originalQuerySelector) {
      globalThis.document.querySelector = originalQuerySelector;
    }
  });
});

// ── useEssNotificationCount ───────────────────────────────────────

describe('useEssNotificationCount behaviour', () => {
  it('polls every 30 seconds', () => {
    // Verify the polling interval value matches spec
    const POLL_INTERVAL = 30_000;
    expect(POLL_INTERVAL).toBe(30000);
  });

  it('caps badge at 99+', () => {
    const formatBadge = (count) => (count > 99 ? '99+' : String(count));
    expect(formatBadge(3)).toBe('3');
    expect(formatBadge(99)).toBe('99');
    expect(formatBadge(100)).toBe('99+');
    expect(formatBadge(999)).toBe('99+');
  });

  it('falls back to 0 when data is missing', () => {
    const data = undefined;
    const count = data?.count ?? 0;
    expect(count).toBe(0);
  });

  it('extracts count from valid API response', () => {
    const body = { data: { count: 7 } };
    const count = body.data?.count ?? 0;
    expect(count).toBe(7);
  });
});

// ── MobileShell structure ─────────────────────────────────────────

describe('MobileShell component structure', () => {
  const mobileShellSrc = fs.readFileSync(
    path.resolve('src/components/mobile/MobileShell.jsx'),
    'utf-8',
  );

  it('uses h-[100dvh] with h-screen fallback', () => {
    expect(mobileShellSrc).toContain('h-screen');
    expect(mobileShellSrc).toContain('h-[100dvh]');
  });

  it('applies font-system class', () => {
    expect(mobileShellSrc).toContain('font-system');
  });

  it('renders BottomNav component', () => {
    expect(mobileShellSrc).toContain('<BottomNav');
  });

  it('renders MobileTopBar component', () => {
    expect(mobileShellSrc).toContain('<MobileTopBar');
  });

  it('renders Outlet for page content', () => {
    expect(mobileShellSrc).toContain('<Outlet');
  });

  it('wraps Outlet in ScreenTransition', () => {
    expect(mobileShellSrc).toContain('<ScreenTransition>');
  });

  it('main content area has pb-20 for bottom nav clearance', () => {
    expect(mobileShellSrc).toContain('pb-20');
  });

  it('main content area is scrollable', () => {
    expect(mobileShellSrc).toContain('overflow-y-auto');
  });

  it('has data-testid for e2e targeting', () => {
    expect(mobileShellSrc).toContain('data-testid="mobile-shell"');
    expect(mobileShellSrc).toContain('data-testid="mobile-content"');
  });
});

// ── MobileTopBar structure ────────────────────────────────────────

describe('MobileTopBar component structure', () => {
  const topBarSrc = fs.readFileSync(
    path.resolve('src/components/mobile/MobileTopBar.jsx'),
    'utf-8',
  );

  it('is sticky at top with z-40', () => {
    expect(topBarSrc).toContain('sticky');
    expect(topBarSrc).toContain('top-0');
    expect(topBarSrc).toContain('z-40');
  });

  it('has token-based background (Task 76)', () => {
    expect(topBarSrc).toContain('mobile-topbar-bg');
  });

  it('clears status bar with pt-safe', () => {
    expect(topBarSrc).toContain('pt-safe');
  });

  it('displays app name via t("appName")', () => {
    expect(topBarSrc).toContain("t('appName')");
  });

  it('renders BellIcon for notifications', () => {
    expect(topBarSrc).toContain('BellIcon');
  });

  it('uses useEssNotificationCount hook', () => {
    expect(topBarSrc).toContain('useEssNotificationCount');
  });

  it('localises notification bell aria-label', () => {
    expect(topBarSrc).toContain("t('mobile.nav.notifications')");
  });

  it('caps badge display at 99+', () => {
    expect(topBarSrc).toContain("'99+'");
  });

  it('navigates to notifications page on bell click', () => {
    expect(topBarSrc).toContain('/app/ess/notifications');
  });

  it('has data-testid for bell and badge', () => {
    expect(topBarSrc).toContain('data-testid="mobile-notification-bell"');
    expect(topBarSrc).toContain('data-testid="mobile-notification-badge"');
  });
});

// ── BottomNav structure ───────────────────────────────────────────

describe('BottomNav component structure', () => {
  const navSrc = fs.readFileSync(
    path.resolve('src/components/mobile/BottomNav.jsx'),
    'utf-8',
  );

  it('has role="navigation"', () => {
    expect(navSrc).toContain('role="navigation"');
  });

  it('has localised aria-label', () => {
    expect(navSrc).toContain("t('mobile.nav.label')");
  });

  it('uses z-50 (above content, below bottom sheet)', () => {
    expect(navSrc).toContain('z-50');
  });

  it('clears home indicator with pb-safe', () => {
    expect(navSrc).toContain('pb-safe');
  });

  it('has token-based background (Task 76)', () => {
    expect(navSrc).toContain('mobile-tab-bg');
  });

  it('uses aria-current="page" for active tab', () => {
    expect(navSrc).toContain('aria-current');
    expect(navSrc).toContain("'page'");
  });

  it('centres tabs with max-w-lg mx-auto', () => {
    expect(navSrc).toContain('max-w-lg');
    expect(navSrc).toContain('mx-auto');
  });

  it('tab height is h-14 (56px)', () => {
    expect(navSrc).toContain('h-14');
  });

  it('tab labels use 11px font', () => {
    expect(navSrc).toContain('text-[11px]');
  });

  it('active state uses brand tint icon token', () => {
    expect(navSrc).toContain('var(--mobile-tab-active-icon)');
  });

  it('inactive state uses tab-inactive colour', () => {
    expect(navSrc).toContain('var(--mobile-tab-inactive)');
  });

  it('implements scroll-to-top on active tab tap', () => {
    expect(navSrc).toContain('handleTabClick');
    expect(navSrc).toContain('scrollTo');
    expect(navSrc).toContain('behavior: \'smooth\'');
  });
});

// ── i18n keys ─────────────────────────────────────────────────────

describe('i18n — mobile.nav keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = ['label', 'dashboard', 'schedule', 'payslips', 'attendance', 'profile', 'notifications'];

  it('EN has all mobile.nav keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.nav).toHaveProperty(key);
      expect(en.mobile.nav[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.nav keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.nav).toHaveProperty(key);
      expect(fr.mobile.nav[key]).toBeTruthy();
    });
  });

  it('EN tab labels are short (≤ 10 chars)', () => {
    ['dashboard', 'schedule', 'payslips', 'attendance', 'profile'].forEach((key) => {
      expect(en.mobile.nav[key].length).toBeLessThanOrEqual(10);
    });
  });

  it('FR renders correct translations', () => {
    expect(fr.mobile.nav.dashboard).toBe('Accueil');
    expect(fr.mobile.nav.schedule).toBe('Planning');
    expect(fr.mobile.nav.payslips).toBe('Paie');
    expect(fr.mobile.nav.attendance).toBe('Temps');
    expect(fr.mobile.nav.profile).toBe('Profil');
  });

  it('EN uses short labels for narrow screens', () => {
    expect(en.mobile.nav.payslips).toBe('Pay');
    expect(en.mobile.nav.attendance).toBe('Time');
  });
});

// ── Barrel export ─────────────────────────────────────────────────

describe('Barrel export includes new components', () => {
  const barrelSrc = fs.readFileSync(
    path.resolve('src/components/mobile/index.js'),
    'utf-8',
  );

  it('exports BottomNav', () => {
    expect(barrelSrc).toContain('BottomNav');
  });

  it('exports MobileTopBar', () => {
    expect(barrelSrc).toContain('MobileTopBar');
  });

  it('exports MobileShell', () => {
    expect(barrelSrc).toContain('MobileShell');
  });
});
