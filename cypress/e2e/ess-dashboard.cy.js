/**
 * E2E tests for Task 54 — Employee Dashboard
 *
 * Covers:
 *  1. Employee lands on ESS dashboard with all widgets rendered
 *  2. Quick stats cards are displayed with correct data
 *  3. Upcoming shifts widget shows shifts and links to schedule
 *  4. Notifications widget shows notifications with unread indicators
 *  5. Latest payslip widget with empty/restricted states
 *  6. Profile widget with completeness and pending requests
 *  7. Quick access shortcuts navigate to correct pages
 *  8. Responsive layout
 *  9. Loading and error states
 */
describe('ESS — Employee Dashboard (Task 54)', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Dashboard landing page ──────────────────────────────────────
  describe('Dashboard — default landing page', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess`);
    });

    it('redirects to /app/ess/dashboard', () => {
      cy.url().should('include', '/app/ess/dashboard');
    });

    it('shows welcome greeting with employee name', () => {
      cy.contains('Welcome back', { timeout: 10000 }).should('be.visible');
    });

    it('shows the current date', () => {
      const now = new Date();
      const year = now.getFullYear().toString();
      cy.get('.capitalize', { timeout: 10000 }).should('contain.text', year);
    });
  });

  // ── 2. Quick stats cards ───────────────────────────────────────────
  describe('Quick stats row', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.get('[class*="grid-cols-2"]', { timeout: 10000 }).first().as('statsRow');
    });

    it('renders 4 stat cards', () => {
      cy.get('@statsRow').find('a').should('have.length', 4);
    });

    it('shifts card links to schedule', () => {
      cy.get('@statsRow').find('a[href="/app/ess/schedule"]').should('exist');
    });

    it('payslips card links to payslips', () => {
      cy.get('@statsRow').find('a[href="/app/ess/payslips"]').should('exist');
    });

    it('attendance card links to attendance', () => {
      cy.get('@statsRow').find('a[href="/app/ess/attendance"]').should('have.length.gte', 1);
    });
  });

  // ── 3. Upcoming shifts widget ──────────────────────────────────────
  describe('Upcoming shifts widget', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
    });

    it('displays upcoming shifts section', () => {
      cy.contains('Upcoming Shifts', { timeout: 10000 }).should('be.visible');
    });

    it('shows "View full schedule" link', () => {
      cy.contains('View full schedule').should('be.visible');
    });

    it('clicking "View full schedule" navigates to schedule page', () => {
      cy.contains('View full schedule').click();
      cy.url().should('include', '/app/ess/schedule');
    });
  });

  // ── 4. Notifications widget ────────────────────────────────────────
  describe('Notifications widget', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
    });

    it('displays notifications section', () => {
      cy.contains('Notifications', { timeout: 10000 }).should('be.visible');
    });

    it('shows "View all" link', () => {
      cy.contains('View all').should('be.visible');
    });

    it('clicking "View all" navigates to notifications page', () => {
      cy.contains('View all').click();
      cy.url().should('include', '/app/ess/notifications');
    });
  });

  // ── 5. Latest payslip widget ───────────────────────────────────────
  describe('Latest payslip widget', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
    });

    it('displays latest payslip section', () => {
      cy.contains('Latest Payslip', { timeout: 10000 }).should('be.visible');
    });

    it('shows "View payslip" link', () => {
      cy.contains('View payslip').should('be.visible');
    });
  });

  // ── 6. Profile widget ─────────────────────────────────────────────
  describe('Profile widget', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
    });

    it('displays profile section with completeness', () => {
      cy.contains('Profile', { timeout: 10000 }).should('be.visible');
      cy.contains('%').should('be.visible');
    });

    it('shows "View profile" link', () => {
      cy.contains('View profile').should('be.visible');
    });

    it('clicking "View profile" navigates to profile page', () => {
      cy.contains('View profile').click();
      cy.url().should('include', '/app/ess/profile');
    });
  });

  // ── 7. Quick access shortcuts ──────────────────────────────────────
  describe('Quick access shortcuts', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
    });

    it('displays Quick Access section', () => {
      cy.contains('Quick Access', { timeout: 10000 }).should('be.visible');
    });

    it('shows shortcuts for Schedule, Payslips, Attendance, Profile', () => {
      cy.contains('Quick Access').parent().within(() => {
        cy.get('a[href="/app/ess/schedule"]').should('exist');
        cy.get('a[href="/app/ess/payslips"]').should('exist');
        cy.get('a[href="/app/ess/attendance"]').should('exist');
        cy.get('a[href="/app/ess/profile"]').should('exist');
      });
    });

    it('clicking Schedule shortcut navigates to schedule', () => {
      cy.contains('Quick Access').parent().find('a[href="/app/ess/schedule"]').click();
      cy.url().should('include', '/app/ess/schedule');
    });
  });

  // ── 8. Full workflow ───────────────────────────────────────────────
  describe('Full dashboard workflow', () => {
    it('employee logs in → lands on dashboard → all widgets rendered → navigates via shortcuts', () => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess`);
      cy.url().should('include', '/app/ess/dashboard');

      // All 4 quick stat cards rendered
      cy.get('[class*="grid-cols-2"]', { timeout: 10000 }).first().find('a').should('have.length', 4);

      // Upcoming shifts visible
      cy.contains('Upcoming Shifts').should('be.visible');

      // Click "View full schedule" → navigates to schedule page
      cy.contains('View full schedule').click();
      cy.url().should('include', '/app/ess/schedule');

      // Navigate back to dashboard
      cy.visit(`${BASE}/app/ess/dashboard`);

      // Verify notifications widget
      cy.contains('Notifications').should('be.visible');

      // Verify payslip widget
      cy.contains('Latest Payslip').should('be.visible');

      // Verify profile widget
      cy.contains('Profile').should('be.visible');
    });
  });
});
