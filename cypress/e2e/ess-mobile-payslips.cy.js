/**
 * E2E tests for Task 67 — ESS Mobile Payslips
 *
 * Tests mobile payslip list and detail views using
 * a 390×844 (iPhone 14) viewport.
 */
describe('ESS Mobile Payslips', () => {
  const MOBILE_WIDTH = 390;
  const MOBILE_HEIGHT = 844;

  beforeEach(() => {
    cy.viewport(MOBILE_WIDTH, MOBILE_HEIGHT);
    // Stub auth and ESS context
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'test-token');
      win.localStorage.setItem('user_role', 'employee');
    });
  });

  describe('Payslip List View', () => {
    beforeEach(() => {
      cy.visit('/app/ess/payslips');
    });

    it('renders the mobile payslip list on narrow viewport', () => {
      cy.get('[data-testid="mobile-payslip-list"]').should('exist');
    });

    it('shows payslip rows with period and net pay', () => {
      cy.get('[data-testid="payslip-row"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="payslip-row"]').first().within(() => {
        cy.get('span').should('exist');
      });
    });

    it('navigates to detail view on row tap', () => {
      cy.get('[data-testid="payslip-row"]').first().click();
      cy.url().should('include', '/app/ess/payslips/');
      cy.get('[data-testid="mobile-payslip-detail"]').should('exist');
    });

    it('shows empty state when no payslips', () => {
      // Intercept API to return empty list
      cy.intercept('GET', '**/ess/payslips*', {
        statusCode: 200,
        body: { payslips: [], pagination: { page: 1, pageSize: 20, total: 0, hasNextPage: false } },
      }).as('emptyPayslips');
      cy.visit('/app/ess/payslips');
      cy.wait('@emptyPayslips');
      cy.get('[data-testid="mobile-payslip-empty"]').should('exist');
    });
  });

  describe('Payslip Detail View', () => {
    beforeEach(() => {
      cy.visit('/app/ess/payslips');
      // Navigate to first payslip
      cy.get('[data-testid="payslip-row"]').first().click();
      cy.get('[data-testid="mobile-payslip-detail"]').should('exist');
    });

    it('shows net pay hero section', () => {
      cy.get('[data-testid="payslip-net-hero"]').should('exist');
    });

    it('shows breakdown bar', () => {
      cy.get('[data-testid="pay-breakdown-bar"]').should('exist');
    });

    it('shows line items', () => {
      cy.get('[data-testid="payslip-line-item"]').should('have.length.greaterThan', 0);
    });

    it('has back navigation to list', () => {
      cy.get('a[href="/app/ess/payslips"]').should('exist');
      cy.get('a[href="/app/ess/payslips"]').click();
      cy.get('[data-testid="mobile-payslip-list"]').should('exist');
    });
  });

  describe('Desktop coexistence', () => {
    it('does NOT render mobile list at desktop width', () => {
      cy.viewport(1280, 800);
      cy.visit('/app/ess/payslips');
      cy.get('[data-testid="mobile-payslip-list"]').should('not.exist');
    });
  });
});
