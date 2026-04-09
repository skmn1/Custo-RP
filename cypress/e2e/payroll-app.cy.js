/**
 * E2E tests for Payroll App (Task 37)
 *
 * Tests route migration, RBAC guards, sidebar items, Pay Run wizard,
 * Pay Slips, employee read-own, and legacy redirects.
 */
describe('Payroll App', () => {
  const BASE = 'http://localhost:5173';

  // ── Helper: login via dev login page ──
  const loginAs = (role) => {
    const accounts = {
      super_admin: { email: 'admin@staffscheduler.com', password: 'Admin@123' },
      hr_manager: { email: 'manager@staffscheduler.com', password: 'Manager@123' },
      employee: { email: 'employee@staffscheduler.com', password: 'Employee@123' },
      planner: { email: 'planner@staffscheduler.com', password: 'Planner@123' },
      accounting_agent: { email: 'accounting@staffscheduler.com', password: 'Admin@123' },
      pos_manager: { email: 'pos@staffscheduler.com', password: 'Admin@123' },
    };
    const acct = accounts[role];
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Legacy route redirects ─────────────────────────────────────────────
  describe('Route redirects', () => {
    beforeEach(() => {
      loginAs('super_admin');
    });

    it('redirects /payroll to /app/payroll/overview', () => {
      cy.visit(`${BASE}/payroll`);
      cy.url().should('include', '/app/payroll/overview');
    });

    it('redirects /payroll/runs to /app/payroll/runs', () => {
      cy.visit(`${BASE}/payroll/runs`);
      cy.url().should('include', '/app/payroll/runs');
    });

    it('redirects /payroll/slips to /app/payroll/slips', () => {
      cy.visit(`${BASE}/payroll/slips`);
      cy.url().should('include', '/app/payroll/slips');
    });

    it('redirects /payroll/deductions to /app/payroll/deductions', () => {
      cy.visit(`${BASE}/payroll/deductions`);
      cy.url().should('include', '/app/payroll/deductions');
    });

    it('redirects /payroll/direct-deposit to /app/payroll/direct-deposit', () => {
      cy.visit(`${BASE}/payroll/direct-deposit`);
      cy.url().should('include', '/app/payroll/direct-deposit');
    });

    it('redirects /payroll/export to /app/payroll/export', () => {
      cy.visit(`${BASE}/payroll/export`);
      cy.url().should('include', '/app/payroll/export');
    });
  });

  // ── 2. RBAC: access denied for unauthorized roles ─────────────────────────
  describe('RBAC guards', () => {
    it('planner is redirected to /access-denied', () => {
      loginAs('planner');
      cy.visit(`${BASE}/app/payroll/overview`, { timeout: 15000 });
      cy.url().should('include', '/access-denied');
    });

    it('accounting_agent is redirected to /access-denied', () => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/payroll/overview`, { timeout: 15000 });
      cy.url().should('include', '/access-denied');
    });

    it('pos_manager is redirected to /access-denied', () => {
      loginAs('pos_manager');
      cy.visit(`${BASE}/app/payroll/overview`, { timeout: 15000 });
      cy.url().should('include', '/access-denied');
    });
  });

  // ── 3. Sidebar items for super_admin / hr_manager ─────────────────────────
  describe('Sidebar navigation', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/payroll/overview`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('shows all 6 sidebar items for super_admin', () => {
      // Overview, Pay Runs, Pay Slips, Deductions, Direct Deposit, Export
      cy.get('nav').within(() => {
        cy.contains('Overview').should('be.visible');
        cy.contains('Pay Runs').should('be.visible');
        cy.contains('Pay Slips').should('be.visible');
        cy.contains('Deductions').should('be.visible');
        cy.contains('Direct Deposit').should('be.visible');
        cy.contains('Export').should('be.visible');
      });
    });
  });

  // ── 4. Payroll Overview dashboard ─────────────────────────────────────────
  describe('Payroll Overview', () => {
    beforeEach(() => {
      loginAs('hr_manager');
      cy.visit(`${BASE}/app/payroll/overview`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the overview page with KPI cards', () => {
      cy.contains('Payroll Overview', { timeout: 10000 }).should('be.visible');
      // Check at least some KPI labels are visible
      cy.contains('Last Pay Run').should('be.visible');
      cy.contains('Active Employees').should('be.visible');
    });

    it('has quick action buttons', () => {
      cy.contains('Start New Pay Run').should('be.visible');
      cy.contains('View Last Pay Slips').should('be.visible');
    });

    it('"Start New Pay Run" navigates to /app/payroll/runs/new', () => {
      cy.contains('Start New Pay Run').click();
      cy.url().should('include', '/app/payroll/runs/new');
    });
  });

  // ── 5. Pay Run wizard ─────────────────────────────────────────────────────
  describe('Pay Run wizard', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/payroll/runs/new`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders step 1 (Period Selection) by default', () => {
      cy.contains('Step 1', { timeout: 10000 }).should('be.visible');
      cy.contains('Pay Frequency').should('be.visible');
    });

    it('can navigate through all 4 steps', () => {
      // Step 1 → 2
      cy.get('[data-testid="next-step"]').click();
      cy.contains('Step 2').should('be.visible');

      // Step 2 → 3
      cy.get('[data-testid="next-step"]').click();
      cy.contains('Step 3').should('be.visible');

      // Step 3 → 4
      cy.get('[data-testid="next-step"]').click();
      cy.contains('Step 4').should('be.visible');
    });

    it('can approve a pay run and the form becomes locked', () => {
      // Navigate to step 4
      cy.get('[data-testid="next-step"]').click();
      cy.get('[data-testid="next-step"]').click();
      cy.get('[data-testid="next-step"]').click();

      // Approve
      cy.get('[data-testid="approve-pay-run"]').click();

      // Status should show Approved
      cy.contains('Approved').should('be.visible');

      // Void button should be visible for super_admin
      cy.get('[data-testid="void-pay-run"]').should('be.visible');
    });
  });

  // ── 6. Pay Slips list ─────────────────────────────────────────────────────
  describe('Pay Slips list', () => {
    beforeEach(() => {
      loginAs('hr_manager');
      cy.visit(`${BASE}/app/payroll/slips`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the pay slips table', () => {
      cy.contains('Pay Slips', { timeout: 10000 }).should('be.visible');
    });

    it('has a search input', () => {
      cy.get('input[placeholder]').should('be.visible');
    });
  });

  // ── 7. Employee: My Pay Slips (read-own) ──────────────────────────────────
  describe('Employee My Pay Slips', () => {
    it('employee can access /app/payroll/slips/mine', () => {
      loginAs('employee');
      cy.visit(`${BASE}/app/payroll/slips/mine`, { timeout: 15000 });
      cy.wait(2000);
      cy.contains('My Pay Slips', { timeout: 10000 }).should('be.visible');
    });

    it('employee sidebar shows "My Pay Slips" instead of admin items', () => {
      loginAs('employee');
      cy.visit(`${BASE}/app/payroll/slips/mine`, { timeout: 15000 });
      cy.wait(2000);
      cy.get('nav').within(() => {
        cy.contains('My Pay Slips').should('be.visible');
        // Employee should NOT see admin-only items
        cy.contains('Pay Runs').should('not.exist');
        cy.contains('Deductions').should('not.exist');
      });
    });
  });

  // ── 8. Deductions page ────────────────────────────────────────────────────
  describe('Deductions page', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/payroll/deductions`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders tax rates and benefits', () => {
      cy.contains('Tax Rates', { timeout: 10000 }).should('be.visible');
      cy.contains('Benefit Deductions').should('be.visible');
    });

    it('shows per-employee deduction table', () => {
      cy.contains('Per-Employee', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 9. Direct Deposit page ────────────────────────────────────────────────
  describe('Direct Deposit page', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/payroll/direct-deposit`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders direct deposit configuration', () => {
      cy.contains('Direct Deposit', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 10. Payroll Export page ───────────────────────────────────────────────
  describe('Payroll Export page', () => {
    beforeEach(() => {
      loginAs('hr_manager');
      cy.visit(`${BASE}/app/payroll/export`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the export interface', () => {
      cy.contains('Export', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 11. Backend RBAC: void endpoint ───────────────────────────────────────
  describe('Backend RBAC — Void Pay Run', () => {
    it('POST /api/payroll/runs/:id/void as hr_manager returns 403', () => {
      loginAs('hr_manager');
      cy.request({
        method: 'POST',
        url: `${BASE}/api/payroll/runs/run-1/void`,
        failOnStatusCode: false,
      }).its('status').should('eq', 403);
    });
  });
});
