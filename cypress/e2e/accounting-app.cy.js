/**
 * E2E tests for Accounting App (Task 38)
 *
 * Tests route migration, RBAC guards, sidebar, dashboard widgets,
 * payments log, reports, settings, and AR/AP filtering.
 */
describe('Accounting App', () => {
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

  // ── 1. Legacy route redirects ─────────────────────────────────────────
  describe('Route redirects', () => {
    beforeEach(() => {
      loginAs('super_admin');
    });

    it('redirects /invoices to /app/accounting/invoices', () => {
      cy.visit(`${BASE}/invoices`);
      cy.url().should('include', '/app/accounting/invoices');
    });

    it('redirects /invoices/new to /app/accounting/invoices/new', () => {
      cy.visit(`${BASE}/invoices/new`);
      cy.url().should('include', '/app/accounting/invoices/new');
    });

    it('redirects /invoices/aging to /app/accounting/aging', () => {
      cy.visit(`${BASE}/invoices/aging`);
      cy.url().should('include', '/app/accounting/aging');
    });
  });

  // ── 2. RBAC: access denied for unauthorized roles ─────────────────────
  describe('RBAC guards', () => {
    it('hr_manager is redirected to /access-denied', () => {
      loginAs('hr_manager');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.url().should('include', '/access-denied');
    });

    it('employee is redirected to /access-denied', () => {
      loginAs('employee');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.url().should('include', '/access-denied');
    });

    it('planner is redirected to /access-denied', () => {
      loginAs('planner');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.url().should('include', '/access-denied');
    });

    it('accounting_agent can access /app/accounting/dashboard', () => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.url().should('include', '/app/accounting/dashboard');
      cy.get('[data-testid="accounting-dashboard"]', { timeout: 10000 }).should('be.visible');
    });

    it('super_admin can access /app/accounting/dashboard', () => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.url().should('include', '/app/accounting/dashboard');
      cy.get('[data-testid="accounting-dashboard"]', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 3. Sidebar navigation ─────────────────────────────────────────────
  describe('Sidebar navigation', () => {
    beforeEach(() => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('shows all 7 sidebar items', () => {
      cy.get('nav').within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('AR Invoices').should('be.visible');
        cy.contains('AP Invoices').should('be.visible');
        cy.contains('Payments').should('be.visible');
        cy.contains('Aging').should('be.visible');
        cy.contains('Reports').should('be.visible');
        cy.contains('Settings').should('be.visible');
      });
    });
  });

  // ── 4. Accounting Dashboard ───────────────────────────────────────────
  describe('Accounting Dashboard', () => {
    beforeEach(() => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/accounting/dashboard`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders all 4 KPI stat cards', () => {
      cy.get('[data-testid="kpi-ar-open"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="kpi-ap-open"]').should('be.visible');
      cy.get('[data-testid="kpi-overdue-ar"]').should('be.visible');
      cy.get('[data-testid="kpi-revenue-mtd"]').should('be.visible');
    });

    it('renders the overdue invoice table', () => {
      cy.get('[data-testid="overdue-table"]', { timeout: 10000 }).should('be.visible');
    });

    it('renders the AR vs AP chart', () => {
      cy.contains('AR vs AP', { timeout: 10000 }).should('be.visible');
    });

    it('renders the cash flow projection chart', () => {
      cy.contains('Cash Flow Projection', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 5. Payments Log ───────────────────────────────────────────────────
  describe('Payments Log', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/accounting/payments`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the payments page', () => {
      cy.get('[data-testid="payments-page"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Payments Log').should('be.visible');
    });

    it('has date and method filters', () => {
      cy.get('[data-testid="payment-filters"]').within(() => {
        cy.get('input[type="date"]').should('have.length', 2);
        cy.get('select').should('have.length.at.least', 1);
      });
    });

    it('has an export button', () => {
      cy.contains('Export').should('be.visible');
    });
  });

  // ── 6. AR Aging Report ────────────────────────────────────────────────
  describe('AR Aging Report', () => {
    beforeEach(() => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/accounting/aging`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the aging page with bucket cards', () => {
      cy.get('[data-testid="aging-page"]', { timeout: 10000 }).should('be.visible');
      cy.contains('AR Aging Report').should('be.visible');
      // Expect at least the bucket labels
      cy.contains('Current').should('be.visible');
    });
  });

  // ── 7. Reports ────────────────────────────────────────────────────────
  describe('Accounting Reports', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/accounting/reports`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the reports page with tabs', () => {
      cy.get('[data-testid="reports-page"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Revenue').should('be.visible');
      cy.contains('Expenses').should('be.visible');
      cy.contains('Tax Summary').should('be.visible');
      cy.contains('Outstanding').should('be.visible');
    });

    it('can switch to Tax Summary tab', () => {
      cy.contains('Tax Summary').click();
      cy.get('[data-testid="tax-summary"]', { timeout: 5000 }).should('be.visible');
    });
  });

  // ── 8. Accounting Settings ────────────────────────────────────────────
  describe('Accounting Settings', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/accounting/settings`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders settings form', () => {
      cy.get('[data-testid="accounting-settings"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Accounting Settings').should('be.visible');
    });

    it('has a save button', () => {
      cy.contains('Save').should('be.visible');
    });
  });

  // ── 9. Invoice list with AR/AP filter ─────────────────────────────────
  describe('Invoice list AR/AP filtering', () => {
    it('navigates to invoices with ?type=AR from sidebar', () => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/accounting/invoices?type=AR`, { timeout: 15000 });
      cy.url().should('include', 'type=AR');
    });

    it('navigates to invoices with ?type=AP from sidebar', () => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/accounting/invoices?type=AP`, { timeout: 15000 });
      cy.url().should('include', 'type=AP');
    });
  });

  // ── 10. Index redirect ────────────────────────────────────────────────
  describe('Index redirect', () => {
    it('/app/accounting redirects to /app/accounting/dashboard', () => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/accounting`);
      cy.url().should('include', '/app/accounting/dashboard');
    });
  });
});
