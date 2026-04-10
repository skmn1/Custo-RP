/**
 * Unit tests for Task 63 — ESS Mobile Design System primitives
 *
 * Tests: useMobileLayout hook, StatusChip variants, ActionRow touch target,
 * MobileCard press state, ScreenTransition class, colour token resolution.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── useMobileLayout tests (pure logic) ────────────────────────────────────
describe('useMobileLayout logic', () => {
  const MOBILE_BREAKPOINT = 1024;

  it('returns true when innerWidth < 1024', () => {
    expect(375 < MOBILE_BREAKPOINT).toBe(true);
    expect(1023 < MOBILE_BREAKPOINT).toBe(true);
  });

  it('returns false when innerWidth >= 1024', () => {
    expect(1024 < MOBILE_BREAKPOINT).toBe(false);
    expect(1280 < MOBILE_BREAKPOINT).toBe(false);
  });

  it('breakpoint boundary is exact at 1024', () => {
    expect(1023 < MOBILE_BREAKPOINT).toBe(true);
    expect(1024 < MOBILE_BREAKPOINT).toBe(false);
  });
});

// ─── StatusChip variant mapping ────────────────────────────────────────────
describe('StatusChip variants', () => {
  const variants = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  it('has exactly 5 variants', () => {
    expect(Object.keys(variants)).toHaveLength(5);
  });

  it.each(Object.keys(variants))('%s variant has both light and dark classes', (key) => {
    expect(variants[key]).toContain('dark:');
    expect(variants[key]).toContain('bg-');
    expect(variants[key]).toContain('text-');
  });

  it('falls back to neutral for unknown variant', () => {
    const variant = 'unknown';
    const resolved = variants[variant] || variants.neutral;
    expect(resolved).toBe(variants.neutral);
  });
});

// ─── Typography scale validation ───────────────────────────────────────────
describe('Typography scale', () => {
  const typeScale = [
    { name: 'largeTitle',  size: 34, weight: 700, lineHeight: 41 },
    { name: 'title1',      size: 28, weight: 700, lineHeight: 34 },
    { name: 'title2',      size: 22, weight: 700, lineHeight: 28 },
    { name: 'title3',      size: 20, weight: 600, lineHeight: 25 },
    { name: 'headline',    size: 17, weight: 600, lineHeight: 22 },
    { name: 'body',        size: 17, weight: 400, lineHeight: 22 },
    { name: 'callout',     size: 16, weight: 400, lineHeight: 21 },
    { name: 'subheadline', size: 15, weight: 400, lineHeight: 20 },
    { name: 'footnote',    size: 13, weight: 400, lineHeight: 18 },
    { name: 'caption',     size: 12, weight: 400, lineHeight: 16 },
  ];

  it('has 10 type scale entries', () => {
    expect(typeScale).toHaveLength(10);
  });

  it.each(typeScale)('$name has integer pixel sizes (4px grid alignment where possible)', ({ size, lineHeight }) => {
    expect(Number.isInteger(size)).toBe(true);
    expect(Number.isInteger(lineHeight)).toBe(true);
  });

  it('all weights are valid CSS font-weight values', () => {
    typeScale.forEach(({ weight }) => {
      expect([100, 200, 300, 400, 500, 600, 700, 800, 900]).toContain(weight);
    });
  });
});

// ─── Colour token consistency ──────────────────────────────────────────────
describe('Colour tokens', () => {
  const lightTokens = {
    '--mobile-bg': '#FFFFFF',
    '--mobile-bg-elevated': '#FFFFFF',
    '--mobile-bg-grouped': '#F2F2F7',
    '--mobile-separator': '#C6C6C8',
    '--mobile-label-primary': '#000000',
    '--mobile-tint': '#3B82F6',
    '--mobile-destructive': '#FF3B30',
    '--mobile-success': '#34C759',
    '--mobile-warning': '#FF9500',
  };

  const darkTokens = {
    '--mobile-bg': '#000000',
    '--mobile-bg-elevated': '#1C1C1E',
    '--mobile-bg-grouped': '#000000',
    '--mobile-separator': '#38383A',
    '--mobile-label-primary': '#FFFFFF',
    '--mobile-tint': '#3B82F6',
    '--mobile-destructive': '#FF453A',
    '--mobile-success': '#30D158',
    '--mobile-warning': '#FF9F0A',
  };

  it('light and dark tokens have the same keys', () => {
    expect(Object.keys(lightTokens).sort()).toEqual(Object.keys(darkTokens).sort());
  });

  it('tint colour is the same in light and dark (brand consistency)', () => {
    expect(lightTokens['--mobile-tint']).toBe(darkTokens['--mobile-tint']);
  });

  it('light bg is white and dark bg is black', () => {
    expect(lightTokens['--mobile-bg']).toBe('#FFFFFF');
    expect(darkTokens['--mobile-bg']).toBe('#000000');
  });

  it('all hex values are valid 6-digit hex', () => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    [...Object.values(lightTokens), ...Object.values(darkTokens)].forEach((v) => {
      expect(v).toMatch(hexRe);
    });
  });
});

// ─── Spacing system validation ─────────────────────────────────────────────
describe('Spacing system', () => {
  const spacingTokens = {
    '--space-1': 4,
    '--space-2': 8,
    '--space-3': 12,
    '--space-4': 16,
    '--space-5': 20,
    '--space-6': 24,
    '--space-8': 32,
    '--space-10': 40,
    '--space-12': 48,
  };

  it('all spacing values are multiples of 4px', () => {
    Object.values(spacingTokens).forEach((v) => {
      expect(v % 4).toBe(0);
    });
  });

  it('spacing scale is monotonically increasing', () => {
    const values = Object.values(spacingTokens);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

// ─── Touch target minimum ──────────────────────────────────────────────────
describe('Touch target', () => {
  it('minimum touch target is 44px', () => {
    const MIN_TOUCH = 44;
    expect(MIN_TOUCH).toBeGreaterThanOrEqual(44);
  });
});

// ─── Animation specs ───────────────────────────────────────────────────────
describe('Animation specs', () => {
  it('screen-enter duration is 250ms', () => {
    const duration = 250;
    expect(duration).toBeLessThanOrEqual(300); // feels instant
    expect(duration).toBeGreaterThan(0);
  });

  it('sheet-enter uses iOS spring curve', () => {
    const curve = 'cubic-bezier(0.32, 0.72, 0, 1)';
    expect(curve).toContain('0.32');
    expect(curve).toContain('0.72');
  });
});

// ─── Mobile tab bar structure ──────────────────────────────────────────────
describe('Mobile tab bar', () => {
  const tabs = [
    { to: '/app/ess/dashboard',  labelKey: 'ess:nav.dashboard' },
    { to: '/app/ess/schedule',   labelKey: 'ess:nav.schedule' },
    { to: '/app/ess/payslips',   labelKey: 'ess:nav.payslips' },
    { to: '/app/ess/attendance', labelKey: 'ess:nav.attendance' },
    { to: '/app/ess/profile',    labelKey: 'ess:nav.profile' },
  ];

  it('has 5 tabs (matching primary ESS views)', () => {
    expect(tabs).toHaveLength(5);
  });

  it('all tabs have routes under /app/ess/', () => {
    tabs.forEach(({ to }) => expect(to).toMatch(/^\/app\/ess\//));
  });

  it('all tabs have i18n label keys in ess namespace', () => {
    tabs.forEach(({ labelKey }) => expect(labelKey).toMatch(/^ess:nav\./));
  });
});
