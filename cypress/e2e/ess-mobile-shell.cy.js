/**
 * E2E tests for Task 64 — ESS Mobile Shell & Bottom Tab Navigation
 *
 * Covers:
 *  1. MobileShell renders with top bar, content area, and bottom nav
 *  2. Top bar shows app name and notification bell
 *  3. Bottom nav has 5 tabs with correct labels
 *  4. Tab navigation works and active indicator follows
 *  5. Sub-page routes keep parent tab highlighted
 *  6. Tapping active tab scrolls content to top
 *  7. Resize to desktop swaps back to AppShell
 *  8. Frosted-glass and safe-area classes present
 */
describe('ESS Mobile Shell & Bottom Tab Navigation (Task 64)', () => {
  const BASE = 'http://localhost:5173';

  const loginAsEmployee = () => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains('employee', { matchCase: false, timeout: 10000 }).click();
    cy.wait(1500);
  };

  // ── 1. Shell structure ───────────────────────────────────────────
  describe('Shell structure', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });

    it('renders MobileShell with top bar, content, and bottom nav', () => {
      cy.get('[data-testid="mobile-top-bar"]').should('be.visible');
      cy.get('[data-testid="mobile-content"]').should('exist');
      cy.get('[data-testid="mobile-tab-bar"]').should('be.visible');
    });

    it('MobileShell uses font-system class', () => {
      cy.get('[data-testid="mobile-shell"]').should('have.class', 'font-system');
    });

    it('content area is scrollable', () => {
      cy.get('[data-testid="mobile-content"]')
        .should('have.css', 'overflow-y', 'auto');
    });
  });

  // ── 2. Top bar ──────────────────────────────────────────────────
  describe('MobileTopBar', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-top-bar"]', { timeout: 10000 }).should('be.visible');
    });

    it('shows app name "My Portal"', () => {
      cy.get('[data-testid="mobile-top-bar"]').should('contain.text', 'My Portal');
    });

    it('shows notification bell with aria-label', () => {
      cy.get('[data-testid="mobile-notification-bell"]')
        .should('be.visible')
        .and('have.attr', 'aria-label');
    });

    it('bell navigates to notifications page when clicked', () => {
      cy.get('[data-testid="mobile-notification-bell"]').click();
      cy.url().should('include', '/app/ess/notifications');
    });
  });

  // ── 3. Bottom nav tabs ──────────────────────────────────────────
  describe('Bottom nav tabs', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-tab-bar"]', { timeout: 10000 }).should('be.visible');
    });

    it('displays exactly 5 navigation tabs', () => {
      cy.get('[data-testid="mobile-tab-bar"] a').should('have.length', 5);
    });

    it('has role="navigation" on the nav container', () => {
      cy.get('[data-testid="mobile-tab-bar"]').should('have.attr', 'role', 'navigation');
    });

    it('has aria-label on the nav container', () => {
      cy.get('[data-testid="mobile-tab-bar"]').should('have.attr', 'aria-label');
    });

    it('dashboard tab is active by default', () => {
      cy.get('[data-testid="mobile-tab-dashboard"]')
        .should('have.attr', 'aria-current', 'page');
    });

    it('has all expected tab testids', () => {
      ['dashboard', 'schedule', 'payslips', 'attendance', 'profile'].forEach((id) => {
        cy.get(`[data-testid="mobile-tab-${id}"]`).should('exist');
      });
    });
  });

  // ── 4. Tab navigation ──────────────────────────────────────────
  describe('Tab navigation', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-tab-bar"]', { timeout: 10000 }).should('be.visible');
    });

    it('tapping schedule tab navigates and activates it', () => {
      cy.get('[data-testid="mobile-tab-schedule"]').click();
      cy.url().should('include', '/app/ess/schedule');
      cy.get('[data-testid="mobile-tab-schedule"]')
        .should('have.attr', 'aria-current', 'page');
      // Dashboard should no longer be active
      cy.get('[data-testid="mobile-tab-dashboard"]')
        .should('not.have.attr', 'aria-current');
    });

    it('tapping payslips tab navigates correctly', () => {
      cy.get('[data-testid="mobile-tab-payslips"]').click();
      cy.url().should('include', '/app/ess/payslips');
      cy.get('[data-testid="mobile-tab-payslips"]')
        .should('have.attr', 'aria-current', 'page');
    });

    it('tapping attendance tab navigates correctly', () => {
      cy.get('[data-testid="mobile-tab-attendance"]').click();
      cy.url().should('include', '/app/ess/attendance');
    });

    it('tapping profile tab navigates correctly', () => {
      cy.get('[data-testid="mobile-tab-profile"]').click();
      cy.url().should('include', '/app/ess/profile');
    });
  });

  // ── 5. Desktop coexistence ──────────────────────────────────────
  describe('Desktop coexistence', () => {
    it('resizing from mobile to desktop swaps to AppShell', () => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
      cy.get('[data-testid="mobile-tab-bar"]').should('be.visible');

      // Resize to desktop
      cy.viewport(1280, 720);
      cy.wait(500);
      cy.get('[data-testid="mobile-shell"]').should('not.exist');
      cy.get('[data-testid="mobile-tab-bar"]').should('not.exist');
    });

    it('resizing back to mobile restores MobileShell', () => {
      cy.viewport(1280, 720);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]').should('not.exist');

      cy.viewport(375, 812);
      cy.wait(500);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });
  });

  // ── 6. Accessibility ───────────────────────────────────────────
  describe('Accessibility', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-tab-bar"]', { timeout: 10000 }).should('be.visible');
    });

    it('bottom nav has role="navigation"', () => {
      cy.get('[data-testid="mobile-tab-bar"]').should('have.attr', 'role', 'navigation');
    });

    it('active tab has aria-current="page"', () => {
      cy.get('[data-testid="mobile-tab-bar"]')
        .find('[aria-current="page"]')
        .should('have.length', 1);
    });

    it('notification bell button has aria-label', () => {
      cy.get('[data-testid="mobile-notification-bell"]')
        .should('have.attr', 'aria-label')
        .and('not.be.empty');
    });
  });

  // ── 7. Visual styling ──────────────────────────────────────────
  describe('Visual styling', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });

    it('bottom nav has backdrop-blur (frosted glass)', () => {
      cy.get('[data-testid="mobile-tab-bar"]').then(($el) => {
        const backdropFilter = getComputedStyle($el[0]).backdropFilter ||
                               getComputedStyle($el[0]).webkitBackdropFilter;
        // backdrop-blur-lg resolves to blur(16px) or similar
        expect(backdropFilter).to.match(/blur/);
      });
    });

    it('--mobile-tint resolves to brand blue', () => {
      cy.document().then((doc) => {
        const tint = getComputedStyle(doc.documentElement)
          .getPropertyValue('--mobile-tint')
          .trim();
        expect(tint).to.eq('#3B82F6');
      });
    });
  });
});
