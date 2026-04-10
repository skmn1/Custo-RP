/**
 * Unit tests for Task 74 — ESS PWA Warm Design Token System
 *
 * Covers:
 *  - Colour tokens (light mode): all warm values, no cold blue tint
 *  - Colour tokens (dark mode): warm brown surfaces, lighter terracotta
 *  - Typography: Plus Jakarta Sans import, letter-spacing, line-height
 *  - Card surface utilities: .mobile-card, .mobile-card-press, .mobile-section-header
 *  - Grain texture: .mobile-grain, SVG filter in MobileShell
 *  - Tab bar tokens: all 6 tab tokens present
 *  - Interaction tokens: --mobile-press-overlay, --mobile-press-scale
 *  - Desktop isolation: mobile.css only imported by MobileShell
 *  - index.html: preconnect hints present
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Source files ──────────────────────────────────────────────────

const css = fs.readFileSync(
  path.resolve('src/styles/mobile.css'),
  'utf-8',
);

const shellSrc = fs.readFileSync(
  path.resolve('src/components/mobile/MobileShell.jsx'),
  'utf-8',
);

const indexHtml = fs.readFileSync(
  path.resolve('index.html'),
  'utf-8',
);

// ── Google Font import ────────────────────────────────────────────

describe('Google Font import', () => {
  it('imports Plus Jakarta Sans at the top of mobile.css', () => {
    expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans");
  });

  it('uses display=swap to prevent FOIT', () => {
    expect(css).toContain('display=swap');
  });

  it('includes italic weight variant', () => {
    expect(css).toContain('ital,wght@0,400');
  });

  it('@import appears before :root block', () => {
    const importIdx = css.indexOf('@import');
    const rootIdx = css.indexOf(':root');
    expect(importIdx).toBeLessThan(rootIdx);
  });
});

// ── index.html preconnect hints ───────────────────────────────────

describe('index.html preconnect hints', () => {
  it('has preconnect to fonts.googleapis.com', () => {
    expect(indexHtml).toContain('rel="preconnect"');
    expect(indexHtml).toContain('href="https://fonts.googleapis.com"');
  });

  it('has preconnect to fonts.gstatic.com', () => {
    expect(indexHtml).toContain('href="https://fonts.gstatic.com"');
    expect(indexHtml).toContain('crossorigin');
  });

  it('preconnect hints appear before the stylesheet', () => {
    const preconnectIdx = indexHtml.indexOf('fonts.googleapis.com');
    const scriptIdx = indexHtml.indexOf('<script');
    expect(preconnectIdx).toBeLessThan(scriptIdx);
  });
});

// ── Light mode colour tokens ──────────────────────────────────────

describe('Light mode colour tokens', () => {
  it('--mobile-bg is warm off-white #FAF9F6', () => {
    expect(css).toContain('--mobile-bg:              #FAF9F6');
  });

  it('--mobile-bg-grouped is #F5F2EC', () => {
    expect(css).toContain('--mobile-bg-grouped:      #F5F2EC');
  });

  it('--mobile-bg-card is #EDE8DF', () => {
    expect(css).toContain('--mobile-bg-card:         #EDE8DF');
  });

  it('--mobile-bg-elevated is #FFFFFF (sheets)', () => {
    expect(css).toContain('--mobile-bg-elevated:     #FFFFFF');
  });

  it('--mobile-label-primary is warm near-black #1C1917', () => {
    expect(css).toContain('--mobile-label-primary:   #1C1917');
  });

  it('--mobile-label-secondary is warm mid-gray #78716C', () => {
    expect(css).toContain('--mobile-label-secondary: #78716C');
  });

  it('--mobile-label-tertiary is #A8A29E', () => {
    expect(css).toContain('--mobile-label-tertiary:  #A8A29E');
  });

  it('--mobile-tint is terracotta #C96A3A (not blue)', () => {
    expect(css).toContain('--mobile-tint:            #C96A3A');
    expect(css).not.toContain('--mobile-tint: #007AFF');
    expect(css).not.toContain('--mobile-tint: #3B82F6');
  });

  it('--mobile-tint-subtle is rgba(201, 106, 58, 0.12)', () => {
    expect(css).toContain('--mobile-tint-subtle:     rgba(201, 106, 58, 0.12)');
  });

  it('--mobile-tint-on is #FFFFFF', () => {
    expect(css).toContain('--mobile-tint-on:         #FFFFFF');
  });

  it('--mobile-separator is warm #E7E0D5', () => {
    expect(css).toContain('--mobile-separator:       #E7E0D5');
  });

  it('--mobile-success is sage green #6B9E78', () => {
    expect(css).toContain('--mobile-success:         #6B9E78');
  });

  it('--mobile-success-bg is #EFF5F1', () => {
    expect(css).toContain('--mobile-success-bg:      #EFF5F1');
  });

  it('--mobile-warning is warm amber #C4A35A', () => {
    expect(css).toContain('--mobile-warning:         #C4A35A');
  });

  it('--mobile-warning-bg is #FDF6E7', () => {
    expect(css).toContain('--mobile-warning-bg:      #FDF6E7');
  });

  it('--mobile-destructive is dusty rose #C4867A (not harsh red)', () => {
    expect(css).toContain('--mobile-destructive:     #C4867A');
    expect(css).not.toContain('--mobile-destructive: #FF3B30');
  });

  it('--mobile-destructive-bg is #FAF0EE', () => {
    expect(css).toContain('--mobile-destructive-bg:  #FAF0EE');
  });

  it('--mobile-info is muted blue #7EAAC8', () => {
    expect(css).toContain('--mobile-info:            #7EAAC8');
  });

  it('--mobile-info-bg is #EEF4F9', () => {
    expect(css).toContain('--mobile-info-bg:         #EEF4F9');
  });

  it('--mobile-backdrop is warm rgba(28, 25, 23, 0.40)', () => {
    expect(css).toContain('--mobile-backdrop:        rgba(28, 25, 23, 0.40)');
  });

  it('no cold system blue #007AFF anywhere in tokens', () => {
    expect(css).not.toContain('#007AFF');
  });

  it('no harsh green #34C759 (replaced by sage)', () => {
    expect(css).not.toContain('#34C759');
  });

  it('no harsh red #FF3B30 (replaced by dusty rose)', () => {
    expect(css).not.toContain('#FF3B30');
  });
});

// ── Dark mode colour tokens ───────────────────────────────────────

describe('Dark mode colour tokens', () => {
  // Extract dark mode block
  const darkBlock = css.split('@media (prefers-color-scheme: dark)')[1] || '';

  it('dark mode uses @media (prefers-color-scheme: dark)', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });

  it('dark --mobile-bg is deep warm brown #1C1410', () => {
    expect(darkBlock).toContain('#1C1410');
  });

  it('dark --mobile-bg-grouped is #241B14', () => {
    expect(darkBlock).toContain('#241B14');
  });

  it('dark --mobile-bg-card is #2E2218', () => {
    expect(darkBlock).toContain('#2E2218');
  });

  it('dark --mobile-bg-elevated is #382A1E', () => {
    expect(darkBlock).toContain('#382A1E');
  });

  it('dark --mobile-tint is lighter terracotta #E07B4A', () => {
    expect(darkBlock).toContain('#E07B4A');
  });

  it('dark --mobile-label-primary is warm near-white #F5F0E8', () => {
    expect(darkBlock).toContain('#F5F0E8');
  });

  it('dark --mobile-separator is warm #3A2E24', () => {
    expect(darkBlock).toContain('#3A2E24');
  });

  it('dark --mobile-backdrop is rgba(0, 0, 0, 0.60)', () => {
    expect(darkBlock).toContain('rgba(0, 0, 0, 0.60)');
  });

  it('dark mode does not use cold pure black #000000 for bg', () => {
    // The dark bg is warm #1C1410, not #000000
    expect(darkBlock).not.toContain('--mobile-bg:              #000000');
  });

  it('dark mode uses `.dark` class — replaced by @media prefers-color-scheme', () => {
    // Old implementation used .dark class — should not be present anymore
    expect(css).not.toContain('.dark {');
  });
});

// ── Font stack ────────────────────────────────────────────────────

describe('Font family token', () => {
  it('--mobile-font-family starts with Plus Jakarta Sans', () => {
    expect(css).toContain("'Plus Jakarta Sans'");
    const fontPropIdx = css.indexOf('--mobile-font-family');
    const jakartaIdx = css.indexOf("'Plus Jakarta Sans'");
    expect(jakartaIdx).toBeGreaterThan(fontPropIdx);
    // Jakarta Sans should appear before -apple-system in the stack
    const appleIdx = css.indexOf('-apple-system', fontPropIdx);
    expect(jakartaIdx).toBeLessThan(appleIdx);
  });

  it('--mobile-font-family falls back to system fonts', () => {
    expect(css).toContain('-apple-system');
    expect(css).toContain('BlinkMacSystemFont');
    expect(css).toContain('sans-serif');
  });

  it('.font-system uses var(--mobile-font-family)', () => {
    expect(css).toContain('font-family: var(--mobile-font-family)');
  });
});

// ── Typography scale ──────────────────────────────────────────────

describe('Typography scale refinements', () => {
  it('largeTitle has letter-spacing: -0.03em', () => {
    expect(css).toContain('letter-spacing: -0.03em');
  });

  it('title1 / title2 have letter-spacing: -0.02em', () => {
    const matches = css.match(/letter-spacing: -0\.02em/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('title3 / headline have letter-spacing: -0.01em', () => {
    const matches = css.match(/letter-spacing: -0\.01em/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('body has line-height: 1.60', () => {
    expect(css).toContain('line-height: 1.60');
  });

  it('caption has letter-spacing: 0.01em', () => {
    expect(css).toContain('letter-spacing: 0.01em');
  });

  it('all 10 text-mobile-* classes exist', () => {
    const classes = [
      '.text-mobile-largeTitle',
      '.text-mobile-title1',
      '.text-mobile-title2',
      '.text-mobile-title3',
      '.text-mobile-headline',
      '.text-mobile-body',
      '.text-mobile-callout',
      '.text-mobile-subheadline',
      '.text-mobile-footnote',
      '.text-mobile-caption',
    ];
    classes.forEach((cls) => expect(css).toContain(cls));
  });
});

// ── Card surface utilities ────────────────────────────────────────

describe('Card surface utilities', () => {
  it('.mobile-card uses var(--mobile-bg-card)', () => {
    expect(css).toContain('background-color: var(--mobile-bg-card)');
  });

  it('.mobile-card has border-radius: 16px', () => {
    expect(css).toContain('border-radius: 16px');
  });

  it('.mobile-card combines shadow-inner and shadow-card', () => {
    expect(css).toContain('var(--mobile-shadow-inner)');
    expect(css).toContain('var(--mobile-shadow-card)');
  });

  it('.mobile-card-press uses scale(0.98)', () => {
    expect(css).toContain('transform: scale(0.98)');
  });

  it('.mobile-card-press has filter: brightness(0.97)', () => {
    expect(css).toContain('filter: brightness(0.97)');
  });

  it('.mobile-card-press has transition with cubic-bezier', () => {
    expect(css).toContain('cubic-bezier(0.32, 0.72, 0, 1)');
  });

  it('.mobile-section-header uses var(--mobile-bg-grouped)', () => {
    expect(css).toContain('background-color: var(--mobile-bg-grouped)');
  });

  it('.mobile-section-header has warm separator borders', () => {
    expect(css).toContain('border-top: 1px solid var(--mobile-separator)');
    expect(css).toContain('border-bottom: 1px solid var(--mobile-separator)');
  });

  it('.mobile-section-header has padding: 6px 16px', () => {
    expect(css).toContain('padding: 6px 16px');
  });

  it('.mobile-grain applies url(#mobile-grain) filter', () => {
    expect(css).toContain('filter: url(#mobile-grain)');
  });
});

// ── Grain SVG in MobileShell ──────────────────────────────────────

describe('Grain SVG filter in MobileShell', () => {
  it('MobileShell renders a hidden SVG for the grain filter', () => {
    expect(shellSrc).toContain('aria-hidden="true"');
    expect(shellSrc).toContain('id="mobile-grain"');
  });

  it('SVG uses feTurbulence with fractalNoise', () => {
    expect(shellSrc).toContain('feTurbulence');
    expect(shellSrc).toContain('fractalNoise');
    expect(shellSrc).toContain('baseFrequency="0.65"');
  });

  it('SVG uses feBlend with overlay mode', () => {
    expect(shellSrc).toContain('feBlend');
    expect(shellSrc).toContain('mode="overlay"');
  });

  it('SVG is zero-size with absolute positioning', () => {
    expect(shellSrc).toContain('width: 0');
    expect(shellSrc).toContain('height: 0');
    expect(shellSrc).toContain("position: 'absolute'");
  });
});

// ── Tab bar tokens ────────────────────────────────────────────────

describe('Tab bar design tokens', () => {
  it('--mobile-tab-bg is defined', () => {
    expect(css).toContain('--mobile-tab-bg:');
  });

  it('--mobile-tab-border is defined', () => {
    expect(css).toContain('--mobile-tab-border:');
  });

  it('--mobile-tab-active-icon references --mobile-tint', () => {
    expect(css).toContain('--mobile-tab-active-icon:  var(--mobile-tint)');
  });

  it('--mobile-tab-active-label references --mobile-tint', () => {
    expect(css).toContain('--mobile-tab-active-label: var(--mobile-tint)');
  });

  it('--mobile-tab-active-pill references --mobile-tint-subtle', () => {
    expect(css).toContain('--mobile-tab-active-pill:  var(--mobile-tint-subtle)');
  });

  it('--mobile-tab-inactive is warm #A8A29E in light mode', () => {
    expect(css).toContain('--mobile-tab-inactive:     #A8A29E');
  });

  it('dark mode overrides --mobile-tab-inactive to warm muted #6B6059', () => {
    const darkBlock = css.split('@media (prefers-color-scheme: dark)')[1] || '';
    expect(darkBlock).toContain('--mobile-tab-inactive:    #6B6059');
  });
});

// ── Shadow tokens ─────────────────────────────────────────────────

describe('Shadow tokens', () => {
  it('--mobile-shadow-card is defined with warm rgba', () => {
    expect(css).toContain('--mobile-shadow-card:       0 2px 8px rgba(28, 25, 23, 0.08)');
  });

  it('--mobile-shadow-card-hover has more lift', () => {
    expect(css).toContain('--mobile-shadow-card-hover: 0 4px 16px rgba(28, 25, 23, 0.12)');
  });

  it('--mobile-shadow-sheet is upward shadow', () => {
    expect(css).toContain('--mobile-shadow-sheet:      0 -4px 32px');
  });

  it('--mobile-shadow-inner is inset highlight', () => {
    expect(css).toContain('--mobile-shadow-inner:      inset 0 1px 0');
  });
});

// ── Interaction tokens ────────────────────────────────────────────

describe('Interaction tokens', () => {
  it('--mobile-press-overlay is warm rgba', () => {
    expect(css).toContain('--mobile-press-overlay:    rgba(28, 25, 23, 0.04)');
  });

  it('--mobile-press-scale is 0.98', () => {
    expect(css).toContain('--mobile-press-scale:      0.98');
  });
});

// ── Desktop isolation ─────────────────────────────────────────────

describe('Desktop isolation', () => {
  it('mobile.css is only imported by MobileShell', () => {
    expect(shellSrc).toContain("import '../../styles/mobile.css'");
  });

  it('App.jsx does not import mobile.css globally', () => {
    const appSrc = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
    expect(appSrc).not.toContain('mobile.css');
  });

  it('mobile.css has no global selector that leaks outside :root and @layer', () => {
    // Verify there are no bare element selectors (body, html, *, etc.) outside
    // of documented animation keyframes and utility layers
    expect(css).not.toContain('body {');
    expect(css).not.toContain('html {');
  });
});

// ── Spacing tokens preserved ──────────────────────────────────────

describe('Spacing tokens preserved', () => {
  const spacings = ['--space-1', '--space-2', '--space-3', '--space-4',
    '--space-5', '--space-6', '--space-8', '--space-10', '--space-12'];

  it('all spacing tokens are still defined', () => {
    spacings.forEach((token) => expect(css).toContain(token));
  });
});

// ── Animations preserved ──────────────────────────────────────────

describe('Animation classes preserved', () => {
  it('.animate-screen-enter still exists', () => {
    expect(css).toContain('.animate-screen-enter');
  });

  it('.animate-sheet-enter still exists', () => {
    expect(css).toContain('.animate-sheet-enter');
  });

  it('.animate-sheet-exit still exists', () => {
    expect(css).toContain('.animate-sheet-exit');
  });

  it('.animate-fade-in still exists', () => {
    expect(css).toContain('.animate-fade-in');
  });

  it('.animate-fade-out exists (new in task 74)', () => {
    expect(css).toContain('.animate-fade-out');
  });

  it('prefers-reduced-motion block disables all animations', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('animation: none');
  });
});
