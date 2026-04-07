/**
 * E2E: Language switching between French and English
 *
 * Validates that the FR/EN toggle in the navbar properly
 * switches all visible content and persists across navigation.
 */

describe('i18n — Language switching', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('scheduler.locale', 'fr');
    });
    cy.visit('/');
  });

  it('starts in French by default', () => {
    cy.contains('Bienvenue dans Staff Scheduler').should('be.visible');
  });

  it('switches to English when EN button is clicked', () => {
    // Click the EN toggle in the navbar
    cy.get('[data-testid="lang-en-btn"], button').contains('EN').click();

    // Dashboard should now be in English
    cy.contains('Welcome to Staff Scheduler').should('be.visible');
    cy.contains('Weekly View').should('be.visible');
    cy.contains('Staff Management').should('be.visible');
    cy.contains('Analytics').should('be.visible');
  });

  it('switches back to French when FR button is clicked', () => {
    // Switch to English first
    cy.get('[data-testid="lang-en-btn"], button').contains('EN').click();
    cy.contains('Welcome to Staff Scheduler').should('be.visible');

    // Switch back to French
    cy.get('[data-testid="lang-fr-btn"], button').contains('FR').click();
    cy.contains('Bienvenue dans Staff Scheduler').should('be.visible');
    cy.contains('Vue hebdomadaire').should('be.visible');
  });

  it('persists language choice across page navigation', () => {
    // Switch to English
    cy.get('[data-testid="lang-en-btn"], button').contains('EN').click();
    cy.contains('Welcome to Staff Scheduler').should('be.visible');

    // Navigate to employees page
    cy.contains('Employees').click();
    cy.contains('Employee Management').should('be.visible');

    // Navigate back to dashboard
    cy.contains('Dashboard').click();
    cy.contains('Welcome to Staff Scheduler').should('be.visible');
  });

  it('persists language choice on page reload', () => {
    // Switch to English
    cy.get('[data-testid="lang-en-btn"], button').contains('EN').click();
    cy.contains('Welcome to Staff Scheduler').should('be.visible');

    // Reload the page
    cy.reload();
    cy.contains('Welcome to Staff Scheduler').should('be.visible');
  });

  it('switches payroll tab labels when language changes', () => {
    // Start in French — go to payroll
    cy.visit('/payroll');
    cy.contains('Gestion de la Paie').should('be.visible');

    // Switch to English
    cy.get('[data-testid="lang-en-btn"], button').contains('EN').click();
    cy.contains('Payroll Management').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Statistics').should('be.visible');
  });
});
