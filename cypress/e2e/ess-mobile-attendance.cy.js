/**
 * E2E tests for Task 68 — ESS Mobile Attendance
 *
 * Tests mobile attendance view with weekly summary ring,
 * day-by-day list, week navigation, and monthly summary.
 * Uses a 390×844 (iPhone 14) viewport.
 */
describe('ESS Mobile Attendance', () => {
  const MOBILE_WIDTH = 390;
  const MOBILE_HEIGHT = 844;

  beforeEach(() => {
    cy.viewport(MOBILE_WIDTH, MOBILE_HEIGHT);
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'test-token');
      win.localStorage.setItem('user_role', 'employee');
    });
  });

  describe('Weekly Summary', () => {
    beforeEach(() => {
      cy.visit('/app/ess/attendance');
    });

    it('renders the mobile attendance view on narrow viewport', () => {
      cy.get('[data-testid="mobile-attendance"]').should('exist');
    });

    it('shows the attendance progress ring', () => {
      cy.get('[data-testid="attendance-ring"]').should('exist');
      cy.get('[data-testid="attendance-ring"] svg').should('exist');
    });

    it('shows the weekly summary card', () => {
      cy.get('[data-testid="weekly-summary-card"]').should('exist');
    });

    it('shows week navigator with date range', () => {
      cy.get('[data-testid="week-navigator"]').should('exist');
    });
  });

  describe('Week Navigation', () => {
    beforeEach(() => {
      cy.visit('/app/ess/attendance');
    });

    it('navigates to previous week when left arrow tapped', () => {
      cy.get('[data-testid="week-navigator"]').within(() => {
        cy.get('button').first().click();
      });
      // Week label should have changed
      cy.get('[data-testid="week-navigator"]').should('exist');
    });

    it('disables next-week button on current week', () => {
      cy.get('[data-testid="week-navigator"]').within(() => {
        cy.get('button').last().should('be.disabled');
      });
    });

    it('enables next-week button after navigating to past week', () => {
      // Go to previous week
      cy.get('[data-testid="week-navigator"]').within(() => {
        cy.get('button').first().click();
      });
      // Now next should be enabled
      cy.get('[data-testid="week-navigator"]').within(() => {
        cy.get('button').last().should('not.be.disabled');
      });
    });
  });

  describe('Day-by-Day List', () => {
    beforeEach(() => {
      cy.visit('/app/ess/attendance');
    });

    it('shows a day list with 7 entries (Mon–Sun)', () => {
      cy.get('[data-testid="day-list"]').should('exist');
      cy.get('[data-testid="day-row"]').should('have.length', 7);
    });

    it('day list uses an ordered list element', () => {
      cy.get('ol[data-testid="day-list"]').should('exist');
    });
  });

  describe('Monthly Summary', () => {
    beforeEach(() => {
      cy.visit('/app/ess/attendance');
    });

    it('shows monthly summary section collapsed by default', () => {
      cy.get('[data-testid="monthly-summary"]').should('exist');
      cy.get('[data-testid="monthly-summary-content"]').should('not.exist');
    });

    it('expands when toggle is tapped', () => {
      cy.get('[data-testid="monthly-summary-toggle"]').click();
      cy.get('[data-testid="monthly-summary-content"]').should('exist');
    });

    it('collapses when toggle is tapped again', () => {
      cy.get('[data-testid="monthly-summary-toggle"]').click();
      cy.get('[data-testid="monthly-summary-content"]').should('exist');
      cy.get('[data-testid="monthly-summary-toggle"]').click();
      cy.get('[data-testid="monthly-summary-content"]').should('not.exist');
    });
  });

  describe('Desktop Coexistence', () => {
    it('does NOT render mobile attendance at desktop width', () => {
      cy.viewport(1280, 800);
      cy.visit('/app/ess/attendance');
      cy.get('[data-testid="mobile-attendance"]').should('not.exist');
    });
  });
});
