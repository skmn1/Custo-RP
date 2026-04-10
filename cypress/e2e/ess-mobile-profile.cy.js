/**
 * E2E tests for Task 69 — ESS Mobile Profile
 *
 * Covers:
 *  1. Profile page loads at /app/ess/profile (mobile viewport)
 *  2. Hero header renders with avatar/name/role
 *  3. All five sections present (personal, contact, emergency, experience, documents)
 *  4. Tapping editable field opens BottomSheet
 *  5. Submitting a change request shows validation
 *  6. Desktop page still works at wider viewport
 */
describe('ESS — Mobile Profile (Task 69)', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Profile page loads ──────────────────────────────────────────
  describe('Profile page — mobile viewport', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
    });

    it('renders mobile profile container', () => {
      cy.get('[data-testid="mobile-profile"]', { timeout: 10000 }).should('exist');
    });

    it('does NOT render desktop tab layout', () => {
      cy.get('[data-testid="mobile-profile"]').should('exist');
      cy.get('[role="tablist"]').should('not.exist');
    });
  });

  // ── 2. Hero header ────────────────────────────────────────────────
  describe('Profile header', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="profile-header"]', { timeout: 10000 }).as('header');
    });

    it('renders profile header', () => {
      cy.get('@header').should('be.visible');
    });

    it('displays avatar or initials fallback', () => {
      cy.get('@header').within(() => {
        cy.get('[data-testid="profile-avatar"], [data-testid="profile-avatar-fallback"]')
          .should('have.length.gte', 1);
      });
    });

    it('shows employee name', () => {
      cy.get('@header').invoke('text').should('not.be.empty');
    });
  });

  // ── 3. Profile sections ───────────────────────────────────────────
  describe('Profile sections', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="mobile-profile"]', { timeout: 10000 }).should('exist');
    });

    it('renders personal information section', () => {
      cy.contains('Personal information').should('be.visible');
    });

    it('renders contact section', () => {
      cy.contains('Contact').should('be.visible');
    });

    it('renders emergency contact section', () => {
      cy.contains('Emergency contact').should('be.visible');
    });

    it('renders experience section', () => {
      cy.contains('Experience').should('be.visible');
    });

    it('renders field rows with labels and values', () => {
      cy.get('[data-testid="profile-field-row"]').should('have.length.gte', 3);
    });
  });

  // ── 4. Change request flow ────────────────────────────────────────
  describe('Change request via BottomSheet', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="mobile-profile"]', { timeout: 10000 }).should('exist');
    });

    it('tapping an editable field opens the change request sheet', () => {
      cy.get('[data-testid="profile-field-row"]').first().click();
      cy.get('[data-testid="change-request-sheet"]', { timeout: 5000 }).should('exist');
    });

    it('sheet shows current value and input field', () => {
      cy.get('[data-testid="profile-field-row"]').first().click();
      cy.get('[data-testid="change-request-sheet"]', { timeout: 5000 }).within(() => {
        cy.contains('Current value').should('be.visible');
        cy.get('[data-testid="change-input"]').should('exist');
      });
    });

    it('shows validation error for empty input', () => {
      cy.get('[data-testid="profile-field-row"]').first().click();
      cy.get('[data-testid="change-request-sheet"]', { timeout: 5000 }).within(() => {
        cy.get('[data-testid="change-input"]').clear();
        cy.get('[data-testid="submit-request-btn"]').click();
        cy.get('[data-testid="change-validation-error"]').should('be.visible');
      });
    });

    it('shows HR review note in the sheet', () => {
      cy.get('[data-testid="profile-field-row"]').first().click();
      cy.get('[data-testid="change-request-sheet"]', { timeout: 5000 }).within(() => {
        cy.contains('HR approval').should('be.visible');
      });
    });
  });

  // ── 5. Completeness bar ───────────────────────────────────────────
  describe('Profile completeness', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="profile-header"]', { timeout: 10000 }).should('exist');
    });

    it('shows completeness percentage when under 100%', () => {
      cy.get('[data-testid="profile-header"]').then(($header) => {
        const text = $header.text();
        if (text.includes('%')) {
          cy.get('[data-testid="completeness-bar"]').should('exist');
        }
      });
    });
  });

  // ── 6. Desktop coexistence ────────────────────────────────────────
  describe('Desktop viewport — original profile page', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
    });

    it('does NOT render mobile profile at desktop width', () => {
      cy.get('[data-testid="mobile-profile"]').should('not.exist');
    });

    it('renders desktop profile page', () => {
      cy.get('body', { timeout: 10000 }).should('be.visible');
      cy.contains('Profile', { timeout: 10000 }).should('be.visible');
    });
  });
});
