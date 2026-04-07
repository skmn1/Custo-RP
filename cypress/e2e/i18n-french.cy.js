/**
 * E2E: French language content verification
 *
 * Validates that the default French locale renders correctly
 * across all major pages.
 */

describe('i18n — French default locale', () => {
  beforeEach(() => {
    // Ensure French is the active locale via localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('scheduler.locale', 'fr');
    });
  });

  it('renders the dashboard in French', () => {
    cy.visit('/');
    cy.contains('Bienvenue dans Staff Scheduler').should('be.visible');
    cy.contains('Vue hebdomadaire').should('be.visible');
    cy.contains('Gestion du personnel').should('be.visible');
    cy.contains('Analyses').should('be.visible');
  });

  it('renders the navbar in French', () => {
    cy.visit('/');
    cy.contains('Tableau de bord').should('be.visible');
    cy.contains('Planning').should('be.visible');
    cy.contains('Employés').should('be.visible');
    cy.contains('Paie').should('be.visible');
    cy.contains('Points de vente').should('be.visible');
  });

  it('renders the scheduler page in French', () => {
    cy.visit('/scheduler');
    // Check for French day abbreviations (Mon→Lun, etc.)
    cy.contains('Lun').should('exist');
    cy.contains('Mar').should('exist');
    cy.contains('Mer').should('exist');
  });

  it('renders the employees page in French', () => {
    cy.visit('/employees');
    cy.contains('Gestion des Employés').should('be.visible');
    cy.get('button').contains('Ajouter un Employé').should('be.visible');
  });

  it('renders the payroll page in French', () => {
    cy.visit('/payroll');
    cy.contains('Gestion de la Paie').should('be.visible');
    cy.contains('Tableau de bord').should('be.visible');
    cy.contains('Statistiques').should('be.visible');
    cy.contains('Comptabilité').should('be.visible');
    cy.contains('Exporter').should('be.visible');
  });

  it('renders the POS list page in French', () => {
    cy.visit('/pos');
    cy.contains('Points de Vente').should('be.visible');
    cy.get('[data-testid="create-pos-btn"]').should('be.visible');
  });
});
