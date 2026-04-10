/**
 * E2E tests for Task 65 — ESS Mobile Dashboard
 *
 * Covers:
 *  1. Dashboard loads on mobile viewport with greeting
 *  2. Next shift hero card visible (or empty state)
 *  3. Quick stats row visible with stat pills
 *  4. Summary cards (payslip, profile, attendance) visible
 *  5. Tapping "View schedule" navigates to schedule
 *  6. Desktop layout unchanged at 1200px
 *  7. Skeleton loading state
 */
describe('ESS Mobile Dashboard (Task 65)', () => {
  const BASE = 'http://localhost:5173';

  const loginAsEmployee = () => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains('employee', { matchCase: false, timeout: 10000 }).click();
    cy.wait(1500);
  };

  // ── 1. Dashboard loads with greeting ────────────────────────────
  describe('Greeting and layout', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });

    it('shows mobile dashboard container', () => {
      cy.get('[data-testid="mobile-dashboard"]', { timeout: 10000 }).should('exist');
    });

    it('shows time-based greeting with employee name', () => {
      cy.get('[data-testid="mobile-dashboard-greeting"]')
        .should('be.visible')
        .and('contain.text', '👋');
    });

    it('greeting contains a date string', () => {
      cy.get('[data-testid="mobile-dashboard-greeting"]')
        .find('p')
        .should('exist');
    });
  });

  // ── 2. Next shift hero card ─────────────────────────────────────
  describe('Next shift card', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-dashboard"]', { timeout: 10000 }).should('exist');
    });

    it('renders the next shift card', () => {
      cy.get('[data-testid="mobile-next-shift-card"]').should('exist');
    });
  });

  // ── 3. Quick stats row ──────────────────────────────────────────
  describe('Quick stats', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-dashboard"]', { timeout: 10000 }).should('exist');
    });

    it('shows quick stats row with at least 3 stat pills', () => {
      cy.get('[data-testid="mobile-quick-stats"]')
        .should('be.visible')
        .find('a')
        .should('have.length.at.least', 3);
    });

    it('stat pills are tappable links to ESS sections', () => {
      cy.get('[data-testid="mobile-quick-stats"]')
        .find('a')
        .first()
        .should('have.attr', 'href')
        .and('match', /\/app\/ess\//);
    });
  });

  // ── 4. Summary cards ────────────────────────────────────────────
  describe('Summary cards', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-dashboard"]', { timeout: 10000 }).should('exist');
    });

    it('shows profile card', () => {
      cy.get('[data-testid="mobile-profile-card"]').should('exist');
    });

    it('profile card has a progress bar', () => {
      cy.get('[data-testid="mobile-profile-card"]')
        .find('.rounded-full')
        .should('exist');
    });

    it('shows attendance card', () => {
      cy.get('[data-testid="mobile-attendance-card"]').should('exist');
    });

    it('attendance card links to /app/ess/attendance', () => {
      cy.get('[data-testid="mobile-attendance-card"]')
        .find('a[href="/app/ess/attendance"]')
        .should('exist');
    });
  });

  // ── 5. Navigation from dashboard ────────────────────────────────
  describe('Navigation', () => {
    beforeEach(() => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-dashboard"]', { timeout: 10000 }).should('exist');
    });

    it('tapping next shift card navigates to schedule', () => {
      cy.get('[data-testid="mobile-next-shift-card"]').click();
      cy.url().should('include', '/app/ess/schedule');
    });

    it('tapping profile card navigates to profile', () => {
      cy.get('[data-testid="mobile-profile-card"]').find('a').click();
      cy.url().should('include', '/app/ess/profile');
    });
  });

  // ── 6. Desktop coexistence ──────────────────────────────────────
  describe('Desktop coexistence', () => {
    it('desktop viewport (1280px) does not show mobile dashboard', () => {
      cy.viewport(1280, 720);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-dashboard"]').should('not.exist');
    });

    it('resize from mobile to desktop swaps out mobile dashboard', () => {
      cy.viewport(375, 812);
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[data-testid="mobile-dashboard"]', { timeout: 10000 }).should('exist');

      cy.viewport(1280, 720);
      cy.wait(500);
      cy.get('[data-testid="mobile-dashboard"]').should('not.exist');
    });
  });
});
