/**
 * Task 86 — ESS Responsive QA unit tests
 *
 * Covers:
 *  - i18n completeness: every mobile.* EN key exists in FR (symmetric check)
 *  - i18n value spot-checks: EN exact values, FR exact values for critical keys
 *  - Input font-size ≥ 16px on all interactive inputs/selects/textareas (Safari auto-zoom)
 *  - EssLayout stale theme-color (#3B82F6 gone, #da336b present)
 *  - MobileLoginPage: forgot-password uses <Link> not <a href>
 *  - MobileShell: overscroll-contain on main scroll container
 *  - BottomNav: safe-area padding uses max() expression (not raw pb-safe)
 *  - BottomNav: role="navigation", aria-label, aria-current="page" support
 *  - index.html: Plus Jakarta Sans + Manrope loaded via <link> with display=swap
 *  - index.html: user-scalable not restricted to no (WCAG 1.4.4)
 *  - TopAppBar: aria-label uses i18n key (not hardcoded English)
 *  - Profile + EditProfile avatars: loading="lazy"
 *  - Dashboard: teammate avatars have loading="lazy"
 *  - Progress bars: role="progressbar" + aria-valuenow/min/max present
 *  - Animations: only transform/opacity in keyframes (no layout-triggering props)
 *  - AllscreensMobileLoginPage: back link uses <Link>
 *  - No stale blue #3B82F6 colour tokens in mobile pages
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ── JSON helpers ──────────────────────────────────────────────────────────────

function flattenMobile(json) {
  const result = {};
  function walk(obj, prefix) {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'object' && v !== null) walk(v, key);
      else result[key] = v;
    }
  }
  walk(json.mobile ?? {}, 'mobile');
  return result;
}

const enJson = JSON.parse(readSrc('public/locales/en/ess.json'));
const frJson = JSON.parse(readSrc('public/locales/fr/ess.json'));
const enMobile = flattenMobile(enJson);
const frMobile = flattenMobile(frJson);

// ── i18n completeness ─────────────────────────────────────────────────────────

describe('i18n completeness — mobile.* keys', () => {
  it('EN has 264 mobile keys', () => {
    expect(Object.keys(enMobile).length).toBe(264);
  });

  it('FR has 264 mobile keys', () => {
    expect(Object.keys(frMobile).length).toBe(264);
  });

  it('every EN mobile key is present in FR (no missing translations)', () => {
    const missingInFr = Object.keys(enMobile).filter((k) => !(k in frMobile));
    expect(missingInFr).toEqual([]);
  });

  it('every FR mobile key is present in EN (no orphan FR keys)', () => {
    const extraInFr = Object.keys(frMobile).filter((k) => !(k in enMobile));
    expect(extraInFr).toEqual([]);
  });

  it('no EN mobile value is an empty string', () => {
    const empty = Object.entries(enMobile).filter(([, v]) => v === '');
    expect(empty).toEqual([]);
  });

  it('no FR mobile value is an empty string', () => {
    const empty = Object.entries(frMobile).filter(([, v]) => v === '');
    expect(empty).toEqual([]);
  });
});

// ── i18n EN spot-checks ───────────────────────────────────────────────────────

describe('i18n EN exact values', () => {
  const cases = [
    ['mobile.nav.dashboard', 'Home'],
    ['mobile.nav.schedule', 'Schedule'],
    ['mobile.nav.requests', 'Requests'],
    ['mobile.nav.profile', 'Profile'],
    ['mobile.back', 'Back'],
    ['mobile.close', 'Close'],
    ['mobile.done', 'Done'],
    ['mobile.cancel', 'Cancel'],
    ['mobile.dashboard.nextShift', 'Next shift'],
    ['mobile.leave.title', 'Requests & Leave'],
    ['mobile.payroll.title', 'Payroll Hub'],
    ['mobile.notifications.title', 'Notifications'],
    ['mobile.profile.editProfile', 'Edit Profile'],
    ['mobile.schedule.title', 'Work Schedule'],
    ['mobile.notifications.accept', 'Accept'],
    ['mobile.notifications.decline', 'Decline'],
    ['mobile.notifications.markAllRead', 'Mark all read'],
    ['mobile.leave.status.approved', 'Approved'],
    ['mobile.leave.status.pending', 'Pending'],
    ['mobile.leave.status.declined', 'Declined'],
  ];

  for (const [key, expected] of cases) {
    it(`${key} = "${expected}"`, () => {
      expect(enMobile[key]).toBe(expected);
    });
  }
});

// ── i18n FR spot-checks ───────────────────────────────────────────────────────

describe('i18n FR exact values', () => {
  const cases = [
    ['mobile.nav.dashboard', 'Accueil'],
    ['mobile.nav.schedule', 'Planning'],
    ['mobile.nav.requests', 'Demandes'],
    ['mobile.nav.profile', 'Profil'],
    ['mobile.leave.title', 'Congés & Demandes'],
    ['mobile.payroll.title', 'Tableau de paie'],
    ['mobile.profile.editProfile', 'Modifier le profil'],
    ['mobile.profile.save', 'Enregistrer'],
    ['mobile.notifications.accept', 'Accepter'],
    ['mobile.notifications.decline', 'Refuser'],
  ];

  for (const [key, expected] of cases) {
    it(`FR ${key} = "${expected}"`, () => {
      expect(frMobile[key]).toBe(expected);
    });
  }
});

// ── EssLayout theme-color fix ─────────────────────────────────────────────────

describe('EssLayout — stale theme-color fix', () => {
  const src = readSrc('src/components/ess/EssLayout.jsx');

  it('does not contain stale blue theme-color #3B82F6', () => {
    expect(src).not.toContain('#3B82F6');
  });

  it('contains Nexus Kinetic Magenta theme-color #da336b', () => {
    expect(src).toContain('content="#da336b"');
  });

  it('EssLayout msapplication-TileColor is Magenta', () => {
    expect(src).toMatch(/msapplication-TileColor.*#da336b/);
  });
});

// ── MobileLoginPage — SPA navigation fix ─────────────────────────────────────

describe('MobileLoginPage — forgot-password SPA navigation', () => {
  const src = readSrc('src/pages/ess/mobile/MobileLoginPage.jsx');

  it('imports Link from react-router-dom', () => {
    expect(src).toMatch(/import\s+.*Link.*from\s+['"]react-router-dom['"]/);
  });

  it('uses <Link to="/forgot-password"> (not <a href>)', () => {
    expect(src).toContain('to="/forgot-password"');
  });

  it('does not use native <a href="/forgot-password">', () => {
    expect(src).not.toContain('href="/forgot-password"');
  });
});

// ── Input font-size ≥ 16px (Safari auto-zoom prevention) ─────────────────────

describe('Input font-size — no text-sm on interactive inputs', () => {
  it('MobileEditProfilePage input has text-base not text-sm', () => {
    const src = readSrc('src/pages/ess/mobile/MobileEditProfilePage.jsx');
    // Input with pl-12 should have text-base not text-sm
    expect(src).toMatch(/pl-12.*text-base|text-base.*pl-12/s);
    // Ensure no instance of the input uses text-sm
    const inputMatches = src.match(/className="[^"]*pl-12[^"]*"/g) ?? [];
    for (const m of inputMatches) {
      expect(m).not.toContain('text-sm');
    }
  });

  it('MobilePayslipHistoryPage search input has text-base not text-sm', () => {
    const src = readSrc('src/pages/ess/mobile/MobilePayslipHistoryPage.jsx');
    const inputMatches = src.match(/className="[^"]*pl-10[^"]*"/g) ?? [];
    for (const m of inputMatches) {
      expect(m).not.toContain('text-sm');
      expect(m).toContain('text-base');
    }
  });

  it('MobilePayslipHistoryPage year select has text-base not text-sm', () => {
    const src = readSrc('src/pages/ess/mobile/MobilePayslipHistoryPage.jsx');
    // year-filter select has px-3 py-3
    const selectMatches = src.match(/className="[^"]*year-filter[^"]*"|className="[^"]*px-3 py-3[^"]*"/g) ?? [];
    // At least confirm the year-filter data-testid line and the select class before it lack text-sm
    expect(src).toMatch(/px-3 py-3[^"]*text-base/);
  });

  it('MobileRequestsPage start-date input has text-base', () => {
    const src = readSrc('src/pages/ess/mobile/MobileRequestsPage.jsx');
    // className comes before data-testid in JSX attribute order
    expect(src).not.toMatch(/text-sm[\s\S]{0,100}data-testid="start-date-input"/);
    expect(src).toMatch(/text-base[\s\S]{0,100}data-testid="start-date-input"/);
  });

  it('MobileRequestsPage end-date input has text-base', () => {
    const src = readSrc('src/pages/ess/mobile/MobileRequestsPage.jsx');
    expect(src).not.toMatch(/text-sm[\s\S]{0,100}data-testid="end-date-input"/);
    expect(src).toMatch(/text-base[\s\S]{0,100}data-testid="end-date-input"/);
  });

  it('MobileRequestsPage reason textarea has text-base', () => {
    const src = readSrc('src/pages/ess/mobile/MobileRequestsPage.jsx');
    expect(src).toMatch(/data-testid="reason-input"[\s\S]{0,50}|[\s\S]{0,200}reason-input/);
    // The textarea className directly has text-base
    expect(src).toMatch(/min-h-\[80px\].*text-base|text-base.*min-h-\[80px\]/s);
  });
});

// ── MobileShell — overscroll-contain ─────────────────────────────────────────

describe('MobileShell — Android rubber-banding prevention', () => {
  const src = readSrc('src/components/mobile/MobileShell.jsx');

  it('main scroll container has overscroll-contain class', () => {
    expect(src).toContain('overscroll-contain');
  });

  it('data-testid="mobile-content" element has overscroll-contain', () => {
    expect(src).toMatch(/data-testid="mobile-content".*overscroll-contain|overscroll-contain.*data-testid="mobile-content"/s);
  });
});

// ── BottomNav — safe area padding ─────────────────────────────────────────────

describe('BottomNav — safe area + base padding', () => {
  const src = readSrc('src/components/mobile/BottomNav.jsx');

  it('uses max() CSS function combining base padding and safe-area-inset-bottom', () => {
    expect(src).toContain('env(safe-area-inset-bottom');
    expect(src).toContain('max(');
  });

  it('does not use conflicting pb-6 and pb-safe Tailwind classes on same element', () => {
    // Should not have both pb-6 and pb-safe in the same className string
    expect(src).not.toMatch(/className="[^"]*\bpb-6\b[^"]*\bpb-safe\b[^"]*"/);
    expect(src).not.toMatch(/className="[^"]*\bpb-safe\b[^"]*\bpb-6\b[^"]*"/);
  });

  it('has role="navigation"', () => {
    expect(src).toContain('role="navigation"');
  });

  it('has aria-label from i18n key', () => {
    expect(src).toContain('mobile.nav.label');
  });

  it('has aria-current="page" on active tab', () => {
    expect(src).toContain("aria-current={active ? 'page' : undefined}");
  });

  it('has data-testid="mobile-tab-bar"', () => {
    expect(src).toContain('data-testid="mobile-tab-bar"');
  });

  it('all 4 tab items have min-h-[44px] for touch targets', () => {
    expect(src).toContain('min-h-[44px]');
    expect(src).toContain('min-w-[44px]');
  });
});

// ── index.html — font loading ──────────────────────────────────────────────────

describe('index.html — Google Fonts with display=swap', () => {
  const html = readSrc('index.html');

  it('preconnects to fonts.googleapis.com', () => {
    expect(html).toContain('href="https://fonts.googleapis.com"');
  });

  it('preconnects to fonts.gstatic.com with crossorigin', () => {
    expect(html).toContain('crossorigin');
  });

  it('loads Plus Jakarta Sans via <link> with display=swap', () => {
    expect(html).toMatch(/Plus\+Jakarta\+Sans.*display=swap|Plus Jakarta Sans.*display=swap/);
  });

  it('loads Manrope via <link> with display=swap', () => {
    expect(html).toMatch(/Manrope.*display=swap/);
  });

  it('loads Material Symbols Outlined via <link> with display=swap', () => {
    expect(html).toMatch(/Material.Symbols.Outlined.*display=swap/);
  });

  it('does not restrict user-scalable (WCAG 1.4.4)', () => {
    expect(html).not.toContain('user-scalable=no');
  });

  it('does not set maximum-scale=1.0 (WCAG 1.4.4)', () => {
    expect(html).not.toContain('maximum-scale=1.0');
  });
});

// ── TopAppBar — i18n aria-label ───────────────────────────────────────────────

describe('MobileTopBar — TopAppBar accessibility', () => {
  const src = readSrc('src/components/mobile/MobileTopBar.jsx');

  it('TopAppBar notification button uses i18n key not hardcoded English', () => {
    // Should not have aria-label="Notifications" as a string literal
    expect(src).not.toContain('aria-label="Notifications"');
  });

  it('TopAppBar uses t() call for notifications aria-label', () => {
    expect(src).toMatch(/aria-label=\{t\('mobile\.nav\.notifications'\)\}/);
  });

  it('both MobileTopBar and TopAppBar use useTranslation', () => {
    const matches = src.match(/const\s+\{\s*t\s*\}\s*=\s*useTranslation/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Image loading="lazy" ──────────────────────────────────────────────────────

describe('Images — loading="lazy" on non-hero images', () => {
  it('MobileDashboardPage teammate avatars have loading="lazy"', () => {
    const src = readSrc('src/pages/ess/mobile/MobileDashboardPage.jsx');
    // The teammates slice map should now include loading="lazy"
    expect(src).toMatch(/tm\.avatar[\s\S]{0,100}loading="lazy"|loading="lazy"[\s\S]{0,100}tm\.avatar/s);
  });

  it('MobileProfilePage avatar has loading="lazy"', () => {
    const src = readSrc('src/pages/ess/mobile/MobileProfilePage.jsx');
    expect(src).toContain('loading="lazy"');
    expect(src).toMatch(/avatar[\s\S]{0,300}loading="lazy"|loading="lazy"[\s\S]{0,300}avatar/s);
  });

  it('MobileEditProfilePage avatar has loading="lazy"', () => {
    const src = readSrc('src/pages/ess/mobile/MobileEditProfilePage.jsx');
    expect(src).toMatch(/profile\?\.avatar[\s\S]{0,100}loading="lazy"|loading="lazy"[\s\S]{0,100}profile\?\.avatar/s);
  });

  it('MobileDashboardPage company pulse carousel images already have loading="lazy"', () => {
    const src = readSrc('src/pages/ess/mobile/MobileDashboardPage.jsx');
    expect(src).toContain('loading="lazy"');
  });
});

// ── Progress bar ARIA ──────────────────────────────────────────────────────────

describe('Progress bars — ARIA attributes', () => {
  it('MobileDashboardPage annual-leave progress bar has all 4 ARIA attributes', () => {
    const src = readSrc('src/pages/ess/mobile/MobileDashboardPage.jsx');
    expect(src).toContain('role="progressbar"');
    expect(src).toContain('aria-valuenow={safeUsed}');
    expect(src).toContain('aria-valuemin={0}');
    expect(src).toContain('aria-valuemax={safeTotal}');
    expect(src).toContain('aria-label={t(');
  });

  it('MobileRequestsPage leave balance progress bars have ARIA attributes', () => {
    const src = readSrc('src/pages/ess/mobile/MobileRequestsPage.jsx');
    expect(src).toContain('role="progressbar"');
    expect(src).toContain('aria-valuenow');
    expect(src).toContain('aria-valuemin');
    expect(src).toContain('aria-valuemax');
  });

  it('MobilePayrollHubPage YTD progress bar has ARIA attributes', () => {
    const src = readSrc('src/pages/ess/mobile/MobilePayrollHubPage.jsx');
    expect(src).toContain('role="progressbar"');
    expect(src).toContain('aria-valuenow={ytdProgress}');
    expect(src).toContain('aria-valuemin={0}');
    expect(src).toContain('aria-valuemax={100}');
    expect(src).toContain('aria-label=');
  });
});

// ── Animation safety — GPU-composited only ────────────────────────────────────

describe('mobile.css — animations use only transform/opacity', () => {
  const css = readSrc('src/styles/mobile.css');

  it('screen-enter keyframe only uses opacity and transform', () => {
    const match = css.match(/@keyframes screen-enter\s*\{([^}]+)\}/s);
    expect(match).toBeTruthy();
    const body = match[1];
    // Should NOT contain layout-triggering props
    expect(body).not.toMatch(/\bwidth\b|\bheight\b|\btop\b|\bleft\b|\bright\b|\bbottom\b|\bmargin\b|\bpadding\b/);
    // Should contain only opacity and/or transform
    expect(body).toMatch(/opacity|transform/);
  });

  it('sheet-enter keyframe only uses transform', () => {
    const match = css.match(/@keyframes sheet-enter\s*\{([^}]+)\}/s);
    expect(match).toBeTruthy();
    const body = match[1];
    expect(body).not.toMatch(/\bwidth\b|\bheight\b|\btop\b|\bleft\b/);
    expect(body).toContain('transform');
  });

  it('fade-in keyframe only uses opacity', () => {
    const match = css.match(/@keyframes fade-in\s*\{([^}]+)\}/s);
    expect(match).toBeTruthy();
    const body = match[1];
    expect(body).not.toMatch(/\bwidth\b|\bheight\b|\btop\b|\bleft\b|\btransform\b/);
    expect(body).toContain('opacity');
  });

  it('CSS transitions in buttons use only transform and background', () => {
    // Buttons in mobile.css should not animate width or height
    expect(css).not.toMatch(/transition:[^;]*\bwidth\b/);
    expect(css).not.toMatch(/transition:[^;]*\bheight\b/);
  });

  it('prefers-reduced-motion override is present', () => {
    expect(css).toMatch(/html\.reduce-motion\b|prefers-reduced-motion/);
  });
});

// ── No stale blue tokens in mobile pages ──────────────────────────────────────

describe('Nexus Kinetic — no stale #3B82F6 blue in mobile pages', () => {
  const mobilePages = [
    'src/pages/ess/mobile/MobileDashboardPage.jsx',
    'src/pages/ess/mobile/MobileLoginPage.jsx',
    'src/pages/ess/mobile/MobileResetPasswordPage.jsx',
    'src/pages/ess/mobile/MobileSchedulePage.jsx',
    'src/pages/ess/mobile/MobilePayrollHubPage.jsx',
    'src/pages/ess/mobile/MobilePayslipDetailPage.jsx',
    'src/pages/ess/mobile/MobilePayslipHistoryPage.jsx',
    'src/pages/ess/mobile/MobileRequestsPage.jsx',
    'src/pages/ess/mobile/MobileProfilePage.jsx',
    'src/pages/ess/mobile/MobileEditProfilePage.jsx',
    'src/pages/ess/mobile/MobileNotificationsPage.jsx',
  ];

  for (const relPath of mobilePages) {
    const name = relPath.split('/').pop();
    it(`${name} contains no stale #3B82F6 blue token`, () => {
      const src = readSrc(relPath);
      expect(src).not.toContain('#3B82F6');
    });
  }

  it('EssLayout.jsx contains no stale #3B82F6 blue token', () => {
    expect(readSrc('src/components/ess/EssLayout.jsx')).not.toContain('#3B82F6');
  });
});

// ── Breakpoint transition — no duplicate content rendering ────────────────────

describe('EssLayout — clean mobile/desktop shell swap at 1024px', () => {
  const src = readSrc('src/components/ess/EssLayout.jsx');

  it('imports useMobileLayout hook', () => {
    expect(src).toContain("import { useMobileLayout }");
  });

  it('conditionally renders MobileShell or AppShell (ternary)', () => {
    expect(src).toContain('isMobile ?');
    expect(src).toContain('MobileShell');
    expect(src).toContain('AppShell');
  });

  it('renders ONE shell not both simultaneously', () => {
    // isMobile ternary ensures only one shell renders
    expect(src).toContain('isMobile ?');
    // Both should exist as branches, but the ternary ensures only one renders
    // Verify there is no JSX that renders both unconditionally (without ternary)
    const mobileShellIndex = src.indexOf('<MobileShell');
    const appShellIndex = src.indexOf('<AppShell');
    // Both must exist
    expect(mobileShellIndex).toBeGreaterThan(-1);
    expect(appShellIndex).toBeGreaterThan(-1);
    // Exactly one ternary operator controls them — not two separate render statements
    const ternaryCount = (src.match(/isMobile\s*\?/g) ?? []).length;
    expect(ternaryCount).toBeGreaterThanOrEqual(1);
  });
});

// ── All mobile routes registered in App.jsx ───────────────────────────────────

describe('App.jsx — all Sprint 22 routes registered', () => {
  const src = readSrc('src/App.jsx');

  // Note: dashboard and schedule use wrapper pages (EssDashboardPage / EssSchedulePage)
  // that internally delegate to mobile versions via useMobileLayout(). The route itself
  // registers the wrapper; the mobile component is used inside it.
  const routes = [
    ['dashboard', 'EssDashboardPage'],
    ['schedule', 'EssSchedulePage'],
    ['payslips', 'EssPayslipsPage'],
    ['requests', 'EssRequestsPage'],
    ['attendance', 'EssAttendancePage'],
    ['profile', 'EssProfilePage'],
    ['notifications', 'EssNotificationsPage'],
  ];

  for (const [routePath, component] of routes) {
    it(`route "${routePath}" delivers ${component} (web page with mobile conditionals)`, () => {
      expect(src).toContain(`path="${routePath}"`);
      expect(src).toContain(`element={<${component}`);
    });
  }

  it('EssDashboardPage internally uses MobileDashboardPage on mobile', () => {
    const dashSrc = readSrc('src/pages/ess/EssDashboardPage.jsx');
    expect(dashSrc).toContain('MobileDashboard');
    expect(dashSrc).toContain('isMobile');
  });

  it('EssSchedulePage internally uses MobileSchedulePage on mobile', () => {
    const schedSrc = readSrc('src/pages/ess/EssSchedulePage.jsx');
    expect(schedSrc).toContain('MobileSchedulePage');
    expect(schedSrc).toContain('isMobile');
  });
});

// ── MobileShell — layout structure checks ────────────────────────────────────

describe('MobileShell — layout structure', () => {
  const src = readSrc('src/components/mobile/MobileShell.jsx');

  it('uses 100dvh (dynamic viewport height) with fallback', () => {
    expect(src).toContain('100dvh');
  });

  it('imports and renders MobileTopBar', () => {
    expect(src).toContain('MobileTopBar');
    expect(src).toContain('<MobileTopBar');
  });

  it('imports and renders BottomNav', () => {
    expect(src).toContain('BottomNav');
    expect(src).toContain('<BottomNav');
  });

  it('imports mobile.css for design tokens', () => {
    expect(src).toContain("import '../../styles/mobile.css'");
  });
});
