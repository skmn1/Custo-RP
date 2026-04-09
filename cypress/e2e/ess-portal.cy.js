/**
 * E2E tests for Task 48 — Employee Portal Shell & Access Lockdown
 *
 * Covers:
 *  1. Employee sees only the ESS tile in the App Launcher
 *  2. Employee navigates to ESS dashboard and sees the sidebar
 *  3. Employee is redirected from /app/planning/* to /access-denied
 *  4. Employee is redirected from legacy planning routes to ESS equivalents
 *  5. Planner is NOT affected — still sees Planning app
 *  6. super_admin sees ESS tile alongside other tiles
 */
describe('ESS — Employee Portal Shell & Access Lockdown (Task 48)', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. App Launcher — employee sees only ESS tile ───────────────────
  describe('App Launcher — employee role', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/`);
    });

    it('shows the ESS tile', () => {
      cy.contains('Employee Portal', { timeout: 10000 }).should('be.visible');
    });

    it('does NOT show Planning tile', () => {
      cy.contains('Planning').should('not.exist');
    });

    it('does NOT show HR tile', () => {
      cy.contains('HR').should('not.exist');
    });

    it('does NOT show Payroll tile', () => {
      cy.contains('Payroll').should('not.exist');
    });

    it('does NOT show Admin tile', () => {
      cy.contains('Admin').should('not.exist');
    });
  });

  // ── 2. ESS Portal — navigation ──────────────────────────────────────
  describe('ESS Portal — employee navigation', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess`);
    });

    it('redirects /app/ess to /app/ess/dashboard', () => {
      cy.url().should('include', '/app/ess/dashboard');
    });

    it('renders the ESS sidebar with all nav items', () => {
      cy.url().should('include', '/app/ess/dashboard', { timeout: 10000 });
      cy.contains('My Schedule').should('be.visible');
      cy.contains('My Payslips').should('be.visible');
      cy.contains('Attendance').should('be.visible');
      cy.contains('My Profile').should('be.visible');
      cy.contains('Notifications').should('be.visible');
    });

    it('navigates to My Schedule', () => {
      cy.contains('My Schedule').click();
      cy.url().should('include', '/app/ess/schedule');
    });

    it('navigates to My Profile', () => {
      cy.contains('My Profile').click();
      cy.url().should('include', '/app/ess/profile');
    });
  });

  // ── 3. Access lockdown — employee blocked from admin apps ────────────
  describe('Access lockdown — employee blocked from planning', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('redirects employee from /app/planning to /access-denied', () => {
      cy.visit(`${BASE}/app/planning`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/planning/schedule to /access-denied', () => {
      cy.visit(`${BASE}/app/planning/schedule`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/hr to /access-denied', () => {
      cy.visit(`${BASE}/app/hr`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/payroll to /access-denied', () => {
      cy.visit(`${BASE}/app/payroll`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/admin to /access-denied', () => {
      cy.visit(`${BASE}/app/admin`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/accounting to /access-denied', () => {
      cy.visit(`${BASE}/app/accounting`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/stock to /access-denied', () => {
      cy.visit(`${BASE}/app/stock`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });

    it('redirects employee from /app/pos to /access-denied', () => {
      cy.visit(`${BASE}/app/pos`);
      cy.url().should('include', '/access-denied', { timeout: 8000 });
    });
  });

  // ── 4. Legacy route redirects (employee) ───────────────────────────
  describe('Legacy route redirects — employee role', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('redirects /app/planning/my-schedule to /app/ess/schedule', () => {
      cy.visit(`${BASE}/app/planning/my-schedule`);
      cy.url().should('include', '/app/ess/schedule', { timeout: 8000 });
    });

    it('redirects /app/planning/my-profile to /app/ess/profile', () => {
      cy.visit(`${BASE}/app/planning/my-profile`);
      cy.url().should('include', '/app/ess/profile', { timeout: 8000 });
    });

    it('redirects /app/planning/leave to /app/ess/schedule', () => {
      cy.visit(`${BASE}/app/planning/leave`);
      cy.url().should('include', '/app/ess/schedule', { timeout: 8000 });
    });

    it('redirects /app/hr/profile/me to /app/ess/profile', () => {
      cy.visit(`${BASE}/app/hr/profile/me`);
      cy.url().should('include', '/app/ess/profile', { timeout: 8000 });
    });
  });

  // ── 5. Planner is NOT affected ──────────────────────────────────────
  describe('Planner role — unaffected by lockdown', () => {
    beforeEach(() => {
      loginAs('planner');
      cy.visit(`${BASE}/`);
    });

    it('sees the Planning tile in the launcher', () => {
      cy.contains('Planning', { timeout: 10000 }).should('be.visible');
    });

    it('can access /app/planning/schedule without redirect', () => {
      cy.visit(`${BASE}/app/planning/schedule`);
      cy.url().should('include', '/app/planning/schedule', { timeout: 8000 });
      cy.url().should('not.include', '/access-denied');
    });
  });

  // ── 6. super_admin sees ESS tile alongside other tiles ───────────────
  describe('super_admin — ESS tile visible alongside other tiles', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/`);
    });

    it('sees the ESS (Employee Portal) tile', () => {
      cy.contains('Employee Portal', { timeout: 10000 }).should('be.visible');
    });

    it('still sees the Admin tile', () => {
      cy.contains('Admin').should('be.visible');
    });

    it('can access /app/ess/dashboard', () => {
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.url().should('include', '/app/ess/dashboard', { timeout: 8000 });
    });
  });
});
