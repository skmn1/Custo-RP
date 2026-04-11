/**
 * Unit tests for Task 76 — ESS Mobile Professional Colour System
 *
 * Covers:
 *  - All light-mode CSS custom property values in mobile.css
 *  - Removal of @media (prefers-color-scheme: dark) block
 *  - Removal of .mobile-grain utility and SVG grain filter
 *  - .mobile-card updated properties (12px radius, explicit border, no inner glow)
 *  - MobileTopBar token-based styling (no backdrop-blur, header element)
 *  - BottomNav token-based styling (tab tokens, pill indicator)
 *  - ESS component dark: class absence spot-check
 *  - Tab bar design token presence in BottomNav source
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Source files ──────────────────────────────────────────────────

const cssSrc = fs.readFileSync(
  path.resolve('src/styles/mobile.css'),
  'utf-8',
);

const shellSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileShell.jsx'),
  'utf-8',
);

const topBarSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileTopBar.jsx'),
  'utf-8',
);

const navSrc = fs.readFileSync(
  path.resolve('src/components/mobile/BottomNav.jsx'),
  'utf-8',
);

// ── Background tokens ─────────────────────────────────────────────

describe('Background colour tokens', () => {
  it('--mobile-bg is slate-50 #F8FAFC', () => {
    expect(cssSrc).toContain('--mobile-bg:              #F8FAFC');
  });

  it('--mobile-bg-grouped is slate-100 #F1F5F9', () => {
    expect(cssSrc).toContain('--mobile-bg-grouped:      #F1F5F9');
  });

  it('--mobile-bg-card is pure white #FFFFFF', () => {
    expect(cssSrc).toContain('--mobile-bg-card:         #FFFFFF');
  });

  it('--mobile-bg-elevated is #FFFFFF', () => {
    expect(cssSrc).toContain('--mobile-bg-elevated:     #FFFFFF');
  });
});

// ── Label / text tokens ───────────────────────────────────────────

describe('Label colour tokens', () => {
  it('--mobile-label-primary is slate-900 #0F172A', () => {
    expect(cssSrc).toContain('--mobile-label-primary:   #0F172A');
  });

  it('--mobile-label-secondary is slate-500 #64748B', () => {
    expect(cssSrc).toContain('--mobile-label-secondary: #64748B');
  });

  it('--mobile-label-tertiary is slate-400 #94A3B8', () => {
    expect(cssSrc).toContain('--mobile-label-tertiary:  #94A3B8');
  });

  it('--mobile-label-disabled is slate-300 #CBD5E1', () => {
    expect(cssSrc).toContain('--mobile-label-disabled:  #CBD5E1');
  });
});

// ── Accent / tint tokens ──────────────────────────────────────────

describe('Accent (blue) tint tokens', () => {
  it('--mobile-tint is blue-600 #2563EB (not terracotta)', () => {
    expect(cssSrc).toContain('--mobile-tint:            #2563EB');
    expect(cssSrc).not.toContain('#C96A3A');  // old terracotta must be gone
  });

  it('--mobile-tint-subtle is rgba(37, 99, 235, 0.10)', () => {
    expect(cssSrc).toContain('rgba(37, 99, 235, 0.10)');
  });

  it('--mobile-tint-surface is blue-50 #EFF6FF', () => {
    expect(cssSrc).toContain('--mobile-tint-surface:    #EFF6FF');
  });

  it('--mobile-tint-border is blue-200 #BFDBFE', () => {
    expect(cssSrc).toContain('--mobile-tint-border:     #BFDBFE');
  });

  it('--mobile-tint-on is #FFFFFF', () => {
    expect(cssSrc).toContain('--mobile-tint-on:         #FFFFFF');
  });
});

// ── Separator / border tokens ─────────────────────────────────────

describe('Separator and border tokens', () => {
  it('--mobile-separator is slate-200 #E2E8F0', () => {
    expect(cssSrc).toContain('--mobile-separator:       #E2E8F0');
  });

  it('--mobile-border-card is #E2E8F0', () => {
    expect(cssSrc).toContain('--mobile-border-card:     #E2E8F0');
  });
});

// ── Status colour tokens ──────────────────────────────────────────

describe('Status colour tokens — success', () => {
  it('--mobile-success is green-600 #16A34A', () => {
    expect(cssSrc).toContain('--mobile-success:         #16A34A');
  });

  it('--mobile-success-bg is green-50 #F0FDF4', () => {
    expect(cssSrc).toContain('--mobile-success-bg:      #F0FDF4');
  });

  it('--mobile-success-border is green-200 #BBF7D0', () => {
    expect(cssSrc).toContain('--mobile-success-border:  #BBF7D0');
  });
});

describe('Status colour tokens — warning', () => {
  it('--mobile-warning is amber-600 #D97706', () => {
    expect(cssSrc).toContain('--mobile-warning:         #D97706');
  });

  it('--mobile-warning-bg is amber-50 #FFFBEB', () => {
    expect(cssSrc).toContain('--mobile-warning-bg:      #FFFBEB');
  });

  it('--mobile-warning-border is amber-200 #FDE68A', () => {
    expect(cssSrc).toContain('--mobile-warning-border:  #FDE68A');
  });
});

describe('Status colour tokens — destructive', () => {
  it('--mobile-destructive is red-600 #DC2626', () => {
    expect(cssSrc).toContain('--mobile-destructive:     #DC2626');
  });

  it('--mobile-destructive-bg is red-50 #FEF2F2', () => {
    expect(cssSrc).toContain('--mobile-destructive-bg:  #FEF2F2');
  });

  it('--mobile-destructive-border is red-200 #FECACA', () => {
    expect(cssSrc).toContain('--mobile-destructive-border: #FECACA');
  });
});

describe('Status colour tokens — info', () => {
  it('--mobile-info is sky-700 #0369A1', () => {
    expect(cssSrc).toContain('--mobile-info:            #0369A1');
  });

  it('--mobile-info-bg is sky-50 #F0F9FF', () => {
    expect(cssSrc).toContain('--mobile-info-bg:         #F0F9FF');
  });

  it('--mobile-info-border is sky-200 #BAE6FD', () => {
    expect(cssSrc).toContain('--mobile-info-border:     #BAE6FD');
  });
});

// ── Shadow tokens ─────────────────────────────────────────────────

describe('Shadow tokens', () => {
  it('--mobile-shadow-card uses cool rgba(15, 23, 42, …)', () => {
    expect(cssSrc).toContain('rgba(15, 23, 42, 0.06)');
  });

  it('--mobile-shadow-card-hover has more lift', () => {
    expect(cssSrc).toContain('rgba(15, 23, 42, 0.10)');
  });

  it('--mobile-shadow-sheet is upward cool shadow', () => {
    expect(cssSrc).toContain('--mobile-shadow-sheet:    0 -4px 32px rgba(15, 23, 42, 0.12)');
  });

  it('--mobile-shadow-inner is none (no inner glow on professional cards)', () => {
    expect(cssSrc).toContain('--mobile-shadow-inner:    none');
  });
});

// ── Backdrop token ────────────────────────────────────────────────

describe('Backdrop token', () => {
  it('--mobile-backdrop uses slate rgba(15, 23, 42, 0.40)', () => {
    expect(cssSrc).toContain('--mobile-backdrop:        rgba(15, 23, 42, 0.40)');
  });
});

// ── Tab bar design tokens ─────────────────────────────────────────

describe('Tab bar design tokens', () => {
  it('--mobile-tab-bg is #FFFFFF', () => {
    expect(cssSrc).toContain('--mobile-tab-bg:          #FFFFFF');
  });

  it('--mobile-tab-border is #E2E8F0', () => {
    expect(cssSrc).toContain('--mobile-tab-border:      #E2E8F0');
  });

  it('--mobile-tab-active-icon is #2563EB', () => {
    expect(cssSrc).toContain('--mobile-tab-active-icon: #2563EB');
  });

  it('--mobile-tab-active-label is #2563EB', () => {
    expect(cssSrc).toContain('--mobile-tab-active-label:#2563EB');
  });

  it('--mobile-tab-active-pill references blue subtle rgba', () => {
    expect(cssSrc).toContain('--mobile-tab-active-pill: rgba(37, 99, 235, 0.10)');
  });

  it('--mobile-tab-inactive is slate-400 #94A3B8', () => {
    expect(cssSrc).toContain('--mobile-tab-inactive:    #94A3B8');
  });
});

// ── Top bar design tokens ─────────────────────────────────────────

describe('Top bar design tokens', () => {
  it('--mobile-topbar-bg is #FFFFFF', () => {
    expect(cssSrc).toContain('--mobile-topbar-bg:       #FFFFFF');
  });

  it('--mobile-topbar-border is #E2E8F0', () => {
    expect(cssSrc).toContain('--mobile-topbar-border:   #E2E8F0');
  });

  it('--mobile-topbar-icon is slate-500 #64748B', () => {
    expect(cssSrc).toContain('--mobile-topbar-icon:     #64748B');
  });
});

// ── Dark mode removal ─────────────────────────────────────────────

describe('Dark mode removal', () => {
  it('mobile.css has no @media (prefers-color-scheme: dark) block', () => {
    expect(cssSrc).not.toContain('prefers-color-scheme: dark');
  });

  it('mobile.css has no dark token overrides', () => {
    expect(cssSrc).not.toContain('dark --mobile-bg');
    expect(cssSrc).not.toContain('#1C1410');   // old dark warm background
  });
});

// ── Grain removal ─────────────────────────────────────────────────

describe('Grain texture removal', () => {
  it('mobile.css no longer defines .mobile-grain utility class', () => {
    expect(cssSrc).not.toContain('.mobile-grain {');
  });

  it('MobileShell no longer contains grain SVG feTurbulence', () => {
    expect(shellSrc).not.toContain('feTurbulence');
  });

  it('MobileShell no longer contains grain SVG filter id', () => {
    expect(shellSrc).not.toContain('id="mobile-grain"');
  });

  it('MobileShell no longer contains feBlend', () => {
    expect(shellSrc).not.toContain('feBlend');
  });
});

// ── .mobile-card CSS properties ───────────────────────────────────

describe('.mobile-card CSS properties', () => {
  it('border-radius is 12px', () => {
    expect(cssSrc).toContain('border-radius: 12px');
  });

  it('has explicit border using --mobile-border-card token', () => {
    expect(cssSrc).toContain('border: 1px solid var(--mobile-border-card)');
  });

  it('uses --mobile-shadow-card for box-shadow', () => {
    expect(cssSrc).toContain('box-shadow: var(--mobile-shadow-card)');
  });

  it('no hardcoded warm rgba in .mobile-card shadow', () => {
    // Look for the old Task 74 warm inner glow pattern
    const cardBlock = cssSrc.split('.mobile-card-press')[0].split('.mobile-card {')[1] || '';
    expect(cardBlock).not.toContain('28, 25, 23');  // old warm rgba
  });
});

// ── MobileTopBar structure (Task 76 token-based) ──────────────────

describe('MobileTopBar — token-based styling', () => {
  it('uses semantic <header> element', () => {
    expect(topBarSrc).toContain('<header');
    expect(topBarSrc).toContain('</header>');
  });

  it('applies --mobile-topbar-bg via inline style', () => {
    expect(topBarSrc).toContain('mobile-topbar-bg');
  });

  it('applies --mobile-topbar-border via inline style', () => {
    expect(topBarSrc).toContain('mobile-topbar-border');
  });

  it('applies --mobile-topbar-icon to BellIcon', () => {
    expect(topBarSrc).toContain('mobile-topbar-icon');
  });

  it('does not use backdrop-blur-lg (no frosted glass)', () => {
    expect(topBarSrc).not.toContain('backdrop-blur-lg');
  });

  it('does not use dark: Tailwind variants', () => {
    expect(topBarSrc).not.toMatch(/dark:[a-z]/);
  });

  it('uses --mobile-label-primary for title colour', () => {
    expect(topBarSrc).toContain('mobile-label-primary');
  });
});

// ── BottomNav structure (Task 75/76 token-based) ──────────────────

describe('BottomNav — token-based styling', () => {
  it('applies --mobile-tab-bg via inline style', () => {
    expect(navSrc).toContain('var(--mobile-tab-bg)');
  });

  it('applies --mobile-tab-border via inline style', () => {
    expect(navSrc).toContain('var(--mobile-tab-border)');
  });

  it('active icon uses --mobile-tab-active-icon', () => {
    expect(navSrc).toContain('var(--mobile-tab-active-icon)');
  });

  it('active label uses --mobile-tab-active-label', () => {
    expect(navSrc).toContain('var(--mobile-tab-active-label)');
  });

  it('active pill uses --mobile-tab-active-pill', () => {
    expect(navSrc).toContain('var(--mobile-tab-active-pill)');
  });

  it('inactive state uses --mobile-tab-inactive token', () => {
    expect(navSrc).toContain('var(--mobile-tab-inactive)');
  });

  it('does not use backdrop-blur-lg (no frosted glass)', () => {
    expect(navSrc).not.toContain('backdrop-blur-lg');
  });

  it('does not use dark: Tailwind variants', () => {
    expect(navSrc).not.toMatch(/dark:[a-z]/);
  });
});

// ── No dark: class variants in core ESS mobile components ─────────

describe('Dark mode classes removed from ESS mobile components', () => {
  const coreFiles = [
    'src/components/mobile/MobileShell.jsx',
    'src/components/mobile/MobileTopBar.jsx',
    'src/components/mobile/BottomNav.jsx',
    'src/components/mobile/MobileCard.jsx',
    'src/components/mobile/StatusChip.jsx',
    'src/components/ess/profile/MobileProfile.jsx',
    'src/components/ess/attendance/MobileAttendance.jsx',
    'src/components/ess/payslips/MobilePayslipList.jsx',
    'src/components/ess/notifications/MobileNotifications.jsx',
  ];

  coreFiles.forEach((relPath) => {
    it(`${relPath} has no dark: Tailwind variants`, () => {
      const src = fs.readFileSync(path.resolve(relPath), 'utf-8');
      expect(src).not.toMatch(/dark:[a-z]/);
    });
  });
});

// ── Interaction tokens ────────────────────────────────────────────

describe('Interaction tokens', () => {
  it('--mobile-press-overlay uses cool rgba', () => {
    expect(cssSrc).toContain('--mobile-press-overlay:   rgba(15, 23, 42, 0.04)');
  });

  it('--mobile-press-scale is 0.98', () => {
    expect(cssSrc).toContain('--mobile-press-scale:     0.98');
  });

  it('.mobile-card-press uses scale(var(--mobile-press-scale))', () => {
    expect(cssSrc).toContain('transform: scale(var(--mobile-press-scale))');
  });
});
