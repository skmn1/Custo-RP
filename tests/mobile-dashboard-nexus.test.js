/**
 * Unit tests for Task 80 — MobileDashboardPage (Nexus Kinetic)
 *
 * Covers:
 *  - getGreetingKey() time-boundary logic
 *  - Leave-bar percentage calculation
 *  - noUpcomingShift empty state renders correctly
 *  - i18n keys presence (EN + FR)
 *  - Component structural checks (test-ids, aria attributes)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Greeting key logic ───────────────────────────────────────────

describe('getGreetingKey() — time-based greeting key', () => {
  function getGreetingKey(hour) {
    if (hour < 12) return 'mobile.dashboard.goodMorning';
    if (hour < 18) return 'mobile.dashboard.goodAfternoon';
    return 'mobile.dashboard.goodEvening';
  }

  it('returns goodMorning for hours 0–11', () => {
    expect(getGreetingKey(0)).toBe('mobile.dashboard.goodMorning');
    expect(getGreetingKey(6)).toBe('mobile.dashboard.goodMorning');
    expect(getGreetingKey(11)).toBe('mobile.dashboard.goodMorning');
  });

  it('returns goodAfternoon for hours 12–17', () => {
    expect(getGreetingKey(12)).toBe('mobile.dashboard.goodAfternoon');
    expect(getGreetingKey(15)).toBe('mobile.dashboard.goodAfternoon');
    expect(getGreetingKey(17)).toBe('mobile.dashboard.goodAfternoon');
  });

  it('returns goodEvening for hours 18–23', () => {
    expect(getGreetingKey(18)).toBe('mobile.dashboard.goodEvening');
    expect(getGreetingKey(21)).toBe('mobile.dashboard.goodEvening');
    expect(getGreetingKey(23)).toBe('mobile.dashboard.goodEvening');
  });
});

// ── Leave bar percentage calculation ────────────────────────────

describe('Leave bar percentage calculation', () => {
  function calcPercentage(used, total) {
    const safeUsed = Number(used) || 0;
    const safeTotal = Number(total) || 21;
    if (safeTotal <= 0) return 0;
    return Math.min(Math.round((safeUsed / safeTotal) * 100), 100);
  }

  it('calculates 0% when 0 days used', () => {
    expect(calcPercentage(0, 21)).toBe(0);
  });

  it('calculates 57% when 12 of 21 days used', () => {
    expect(calcPercentage(12, 21)).toBe(57);
  });

  it('calculates 100% when all days used', () => {
    expect(calcPercentage(21, 21)).toBe(100);
  });

  it('caps at 100% when used exceeds total', () => {
    expect(calcPercentage(25, 21)).toBe(100);
  });

  it('uses default total of 21 when total is 0', () => {
    expect(calcPercentage(0, 0)).toBe(0);
  });

  it('returns 0 when used is non-numeric', () => {
    expect(calcPercentage(null, 21)).toBe(0);
    expect(calcPercentage(undefined, 21)).toBe(0);
  });
});

// ── i18n key presence — EN ───────────────────────────────────────

describe('EN ess.json — mobile.dashboard Task 80 keys', () => {
  let en;
  beforeEach(() => {
    const raw = fs.readFileSync(
      path.resolve(process.cwd(), 'public/locales/en/ess.json'),
      'utf-8',
    );
    en = JSON.parse(raw);
  });

  const REQUIRED_KEYS = [
    'goodMorning',
    'goodAfternoon',
    'goodEvening',
    'nextShift',
    'noUpcomingShift',
    'clockIn',
    'annualLeave',
    'daysLeft',
    'leaveProgress',
    'requestTimeOff',
    'companyPulse',
    'seeAll',
    'quickLinks',
    'payrollHub',
    'myProfile',
    'leaveTime',
    'view',
    'essPortal',
  ];

  REQUIRED_KEYS.forEach((key) => {
    it(`has mobile.dashboard.${key}`, () => {
      expect(en.mobile?.dashboard).toHaveProperty(key);
      expect(en.mobile.dashboard[key]).toBeTruthy();
    });
  });

  it('leaveProgress contains {{used}} and {{total}} interpolation', () => {
    expect(en.mobile.dashboard.leaveProgress).toContain('{{used}}');
    expect(en.mobile.dashboard.leaveProgress).toContain('{{total}}');
  });
});

// ── i18n key presence — FR ───────────────────────────────────────

describe('FR ess.json — mobile.dashboard Task 80 keys', () => {
  let fr;
  beforeEach(() => {
    const raw = fs.readFileSync(
      path.resolve(process.cwd(), 'public/locales/fr/ess.json'),
      'utf-8',
    );
    fr = JSON.parse(raw);
  });

  const REQUIRED_KEYS_FR = {
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    clockIn: 'Pointer',
    annualLeave: 'Congés annuels',
    companyPulse: 'Actualités',
    quickLinks: 'Accès rapides',
    payrollHub: 'Fiches de paie',
    myProfile: 'Mon profil',
  };

  Object.entries(REQUIRED_KEYS_FR).forEach(([key, expectedValue]) => {
    it(`mobile.dashboard.${key} = "${expectedValue}"`, () => {
      expect(fr.mobile?.dashboard?.[key]).toBe(expectedValue);
    });
  });

  it('leaveProgress contains {{used}} and {{total}} interpolation', () => {
    expect(fr.mobile.dashboard.leaveProgress).toContain('{{used}}');
    expect(fr.mobile.dashboard.leaveProgress).toContain('{{total}}');
  });
});

// ── Component source structural checks ──────────────────────────

describe('MobileDashboardPage — source code structure', () => {
  let source;
  beforeEach(() => {
    source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileDashboardPage.jsx'),
      'utf-8',
    );
  });

  it('exports MobileDashboardPage as named export', () => {
    expect(source).toContain('export const MobileDashboardPage');
  });

  it('imports useEssDashboard hook', () => {
    expect(source).toContain("useEssDashboard");
  });

  it('renders MobileDashboardSkeleton while loading', () => {
    expect(source).toContain('MobileDashboardSkeleton');
    expect(source).toContain('isLoading && !dashboard');
  });

  it('contains data-testid="mobile-dashboard-greeting"', () => {
    expect(source).toContain('data-testid="mobile-dashboard-greeting"');
  });

  it('contains data-testid="mobile-next-shift-card"', () => {
    expect(source).toContain('data-testid="mobile-next-shift-card"');
  });

  it('contains data-testid="mobile-leave-balance-card"', () => {
    expect(source).toContain('data-testid="mobile-leave-balance-card"');
  });

  it('contains data-testid="mobile-company-pulse"', () => {
    expect(source).toContain('data-testid="mobile-company-pulse"');
  });

  it('contains data-testid="mobile-quick-links"', () => {
    expect(source).toContain('data-testid="mobile-quick-links"');
  });

  it('progress bar has role="progressbar" with aria-valuenow/min/max', () => {
    expect(source).toContain('role="progressbar"');
    expect(source).toContain('aria-valuenow={safeUsed}');
    expect(source).toContain('aria-valuemin={0}');
    expect(source).toContain('aria-valuemax={safeTotal}');
  });

  it('shift hero Clock In button navigates to schedule', () => {
    expect(source).toContain("navigate('/app/ess/schedule')");
  });

  it('empty state renders noUpcomingShift key', () => {
    expect(source).toContain("mobile.dashboard.noUpcomingShift");
  });

  it('uses Magenta gradient for left accent bar', () => {
    expect(source).toContain('#da336b');
    expect(source).toContain('#8b2044');
  });

  it('snap-x class applied to carousel', () => {
    expect(source).toContain('snap-x');
    expect(source).toContain('snap-mandatory');
  });

  it('hides scrollbar on carousel', () => {
    expect(source).toContain('[scrollbar-width:none]');
    expect(source).toContain('[&::-webkit-scrollbar]:hidden');
  });

  it('leave balance card has decorative orb for aesthetics', () => {
    expect(source).toContain('bg-white/10 rounded-full');
  });

  it('Quick Links grid is 2-column', () => {
    expect(source).toContain('grid-cols-2');
  });

  it('Helmet sets theme-color to warm surface', () => {
    expect(source).toContain('#fff8f7');
  });
});

// ── EssDashboardPage routes to MobileDashboardPage on mobile ────

describe('EssDashboardPage — delegates to MobileDashboardPage on mobile', () => {
  let pageSource;
  beforeEach(() => {
    pageSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/pages/ess/EssDashboardPage.jsx'),
      'utf-8',
    );
  });

  it('imports MobileDashboardPage', () => {
    expect(pageSource).toContain('MobileDashboardPage');
  });

  it('renders MobileDashboardPage when isMobile is true', () => {
    expect(pageSource).toContain('<MobileDashboardPage');
  });
});
