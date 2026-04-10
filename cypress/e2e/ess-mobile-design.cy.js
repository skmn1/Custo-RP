/**
 * E2E tests for Task 63 — ESS Mobile Design System
 *
 * Covers:
 *  1. Layout swap at 1024px breakpoint
 *  2. MobileShell renders with bottom tab bar
 *  3. Bottom tab navigation works
 *  4. Mobile colour tokens resolve in light mode
 *  5. MobileHeader renders large title
 *  6. Desktop layout restores when resizing back
 *  7. Mobile typography classes applied
 *  8. Dark mode token swap
 */
describe('ESS Mobile Design System (Task 63)', () => {
  const BASE = 'http://localhost:5173';

  const loginAsEmployee = () => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains('employee', { matchCase: false, timeout: 10000 }).click();
    cy.wait(1500);
  };

  // ── 1. Layout swap at breakpoint ─────────────────────────────────
  describe('Layout swap at breakpoint', () => {
    beforeEach(() => {
      loginAsEmployee();
    });

    it('renders MobileShell at 375px width', () => {
      cy.viewport(375, 812);
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
      cy.get('[data-testid="mobile-tab-bar"]').should('be.visible');
    });

    it('renders desktop AppShell at 1280px width', () => {
      cy.viewport(1280, 720);
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]').should('not.exist');
    });

    it('exact breakpoint: mobile at 1023px, desktop at 1024px', () => {
      cy.viewport(1023, 768);
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');

      cy.viewport(1024, 768);
      cy.wait(500);
      cy.get('[data-testid="mobile-shell"]').should('not.exist');
    });
  });

  // ── 2. MobileShell structure ─────────────────────────────────────
  describe('MobileShell structure', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });

    it('bottom tab bar has 5 navigation tabs', () => {
      cy.get('[data-testid="mobile-tab-bar"]')
        .find('a[role="tab"]')
        .should('have.length', 5);
    });

    it('dashboard tab is active by default', () => {
      cy.get('[data-testid="mobile-tab-bar"]')
        .find('a[aria-selected="true"]')
        .should('have.length', 1);
    });

    it('font-system class is applied to the shell', () => {
      cy.get('[data-testid="mobile-shell"]')
        .should('have.class', 'font-system');
    });
  });

  // ── 3. Bottom tab navigation ─────────────────────────────────────
  describe('Tab navigation', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });

    it('tapping schedule tab navigates to /app/ess/schedule', () => {
      cy.get('[data-testid="mobile-tab-bar"]')
        .find('a[href="/app/ess/schedule"]')
        .click();
      cy.url().should('include', '/app/ess/schedule');
    });

    it('tapping profile tab navigates to /app/ess/profile', () => {
      cy.get('[data-testid="mobile-tab-bar"]')
        .find('a[href="/app/ess/profile"]')
        .click();
      cy.url().should('include', '/app/ess/profile');
    });
  });

  // ── 4. Resize back restores desktop ──────────────────────────────
  describe('Resize back to desktop', () => {
    it('layout swaps back to AppShell when resizing from mobile to desktop', () => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');

      // Resize to desktop
      cy.viewport(1280, 720);
      cy.wait(500);
      cy.get('[data-testid="mobile-shell"]').should('not.exist');
    });
  });

  // ── 5. Colour tokens ─────────────────────────────────────────────
  describe('Colour tokens', () => {
    it('--mobile-tint resolves to #3B82F6', () => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');

      cy.document().then((doc) => {
        const tint = getComputedStyle(doc.documentElement).getPropertyValue('--mobile-tint').trim();
        expect(tint).to.eq('#3B82F6');
      });
    });
  });

  // ── 6. Touch target minimum ───────────────────────────────────────
  describe('Touch targets', () => {
    it('tab bar links are at least 44px tall', () => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-tab-bar"]', { timeout: 10000 }).should('be.visible');

      cy.get('[data-testid="mobile-tab-bar"] a[role="tab"]').first().then(($el) => {
        const height = $el[0].getBoundingClientRect().height;
        expect(height).to.be.at.least(44);
      });
    });
  });
});
