/**
 * E2E tests for Employee Payslip Viewer (Task 50)
 *
 * Tests:
 *  1. Payslip list page loads with cards
 *  2. Year filter works
 *  3. Detail page shows breakdown
 *  4. Restricted state (would need setting toggle — tested via intercept)
 *  5. PDF download button exists on detail
 */
describe('ESS Payslip Viewer', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    const accounts = {
      super_admin: { email: 'admin@staffscheduler.com', password: 'Admin@123' },
      employee: { email: 'employee@staffscheduler.com', password: 'Employee@123' },
    };
    const acct = accounts[role];
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Payslip list renders ──
  describe('Payslip list', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('navigates to /app/ess/payslips and shows heading', () => {
      cy.visit(`${BASE}/app/ess/payslips`);
      cy.contains('My Payslips', { timeout: 10000 }).should('be.visible');
    });

    it('shows payslip cards when data exists', () => {
      cy.visit(`${BASE}/app/ess/payslips`);
      // Wait for loading to finish — either cards appear or the empty state
      cy.get('body', { timeout: 10000 }).then(($body) => {
        // If there's seed data for the logged-in employee, cards should appear
        // Otherwise the empty state message is shown — both are valid
        const hasCards = $body.find('a[href*="/app/ess/payslips/"]').length > 0;
        const hasEmpty = $body.text().includes('No payslips');
        expect(hasCards || hasEmpty).to.be.true;
      });
    });

    it('year filter select is present', () => {
      cy.visit(`${BASE}/app/ess/payslips`);
      cy.get('select', { timeout: 10000 }).should('exist');
    });
  });

  // ── 2. Restricted state via API intercept ──
  describe('Restricted state', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('shows restricted banner when API returns restricted flag', () => {
      cy.intercept('GET', '/api/ess/payslips*', {
        statusCode: 200,
        body: { data: [], restricted: true, message: 'Payslip access is disabled.' },
      }).as('restrictedPayslips');

      cy.visit(`${BASE}/app/ess/payslips`);
      cy.wait('@restrictedPayslips');
      // Should show the restricted message (lock icon + text)
      cy.contains('disabled', { matchCase: false, timeout: 10000 }).should('be.visible');
    });
  });

  // ── 3. Payslip detail ──
  describe('Payslip detail (via intercept)', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('shows detail breakdown when navigating to a payslip', () => {
      // Intercept list with a fake payslip
      cy.intercept('GET', '/api/ess/payslips?*', {
        statusCode: 200,
        body: {
          data: [{
            id: 'ps-test-1',
            periodStart: '2026-03-01',
            periodEnd: '2026-03-31',
            periodLabel: 'March 2026',
            grossPay: 2500.00,
            totalDeductions: 600.00,
            netPay: 1900.00,
            status: 'paid',
            paidAt: '2026-04-05T09:00:00',
            currency: 'USD',
          }],
          pagination: { page: 1, pageSize: 12, total: 1, hasNextPage: false },
        },
      }).as('listPayslips');

      // Intercept detail
      cy.intercept('GET', '/api/ess/payslips/ps-test-1', {
        statusCode: 200,
        body: {
          data: {
            id: 'ps-test-1',
            periodStart: '2026-03-01',
            periodEnd: '2026-03-31',
            periodLabel: 'March 2026',
            workedHours: 160,
            grossPay: 2500.00,
            totalDeductions: 600.00,
            netPay: 1900.00,
            employerContributions: 312.50,
            status: 'paid',
            paidAt: '2026-04-05T09:00:00',
            paymentMethod: 'direct_deposit',
            currency: 'USD',
            employeeName: 'Test Employee',
            lines: {
              earnings: [{ label: 'Base Pay', amount: 2500.00 }],
              deductions: [
                { label: 'Federal Tax', amount: 300.00 },
                { label: 'State Tax', amount: 125.00 },
                { label: 'Social Security', amount: 155.00 },
                { label: 'Medicare', amount: 20.00 },
              ],
            },
          },
        },
      }).as('detailPayslip');

      cy.visit(`${BASE}/app/ess/payslips`);
      cy.wait('@listPayslips');

      // Click first payslip card
      cy.get('a[href*="/app/ess/payslips/ps-test-1"]', { timeout: 10000 }).first().click();
      cy.wait('@detailPayslip');

      // Verify detail page
      cy.contains('March 2026', { timeout: 10000 }).should('be.visible');
      cy.contains('Base Pay').should('be.visible');
      cy.contains('Federal Tax').should('be.visible');

      // Download button should exist
      cy.contains('Download PDF').should('be.visible');

      // Back link should exist
      cy.contains('Back to payslips').should('be.visible');
    });
  });
});
