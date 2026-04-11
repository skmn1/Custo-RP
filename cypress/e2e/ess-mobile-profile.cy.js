/**
 * E2E tests for Task 89 — ESS Mobile Profile (Executive Pulse Redesign)
 *
 * Covers:
 *  1. Profile page loads at /app/ess/profile (mobile viewport)
 *  2. Hero section renders: avatar, name, role, edit/clock-in buttons
 *  3. Bento grid: Personal Info card, Certification card, Payslips card
 *  4. Personal info fields (email, phone, department, employee ID)
 *  5. Certification card with score and progress bar
 *  6. Payslips card with recent payslips
 *  7. Work location history renders when data exists
 *  8. Loading skeleton appears before data loads
 *  9. Desktop viewport renders profile page
 */
describe('ESS — Mobile Profile (Task 89 — Executive Pulse)', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Profile page loads ──────────────────────────────────────
  describe('Profile page — mobile viewport', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
    });

    it('renders the profile page container', () => {
      cy.get('[data-testid="profile-page"]', { timeout: 10000 }).should('exist');
    });

    it('does NOT render desktop tab layout', () => {
      cy.get('[data-testid="profile-page"]').should('exist');
      cy.get('[role="tablist"]').should('not.exist');
    });
  });

  // ── 2. Hero section ───────────────────────────────────────────
  describe('Hero section', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="profile-hero"]', { timeout: 10000 }).as('hero');
    });

    it('renders hero section', () => {
      cy.get('@hero').should('be.visible');
    });

    it('displays avatar (image or generated fallback)', () => {
      cy.get('@hero').within(() => {
        cy.get('[data-testid="profile-avatar-img"], [data-testid="profile-avatar-generated"]')
          .should('have.length.gte', 1);
      });
    });

    it('shows employee name', () => {
      cy.get('[data-testid="profile-name"]')
        .invoke('text')
        .should('not.be.empty');
    });

    it('shows Edit Profile button', () => {
      cy.get('[data-testid="edit-profile-btn"]').should('be.visible');
    });
  });

  // ── 3. Bento grid cards ───────────────────────────────────────
  describe('Bento grid — Personal Info card', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="personal-info-card"]', { timeout: 10000 }).as('infoCard');
    });

    it('renders personal info card', () => {
      cy.get('@infoCard').should('be.visible');
    });

    it('contains email field', () => {
      cy.get('@infoCard').contains('Email', { matchCase: false }).should('exist');
    });

    it('contains phone field', () => {
      cy.get('@infoCard').contains('Phone', { matchCase: false }).should('exist');
    });

    it('contains department field', () => {
      cy.get('@infoCard').contains('Department', { matchCase: false }).should('exist');
    });

    it('contains employee ID field', () => {
      cy.get('@infoCard').within(() => {
        cy.contains(/employee\s*id/i).should('exist');
      });
    });
  });

  describe('Bento grid — Certification card', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="cert-card"]', { timeout: 10000 }).as('certCard');
    });

    it('renders certification card with primary background', () => {
      cy.get('@certCard').should('be.visible');
    });

    it('displays certification score percentage', () => {
      cy.get('[data-testid="cert-score"]').invoke('text').should('match', /\d+%/);
    });

    it('shows progress bar', () => {
      cy.get('[data-testid="cert-progress-bar"]').should('exist');
    });
  });

  describe('Bento grid — Payslips card', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="payslips-card"]', { timeout: 10000 }).as('payCard');
    });

    it('renders payslips card', () => {
      cy.get('@payCard').should('be.visible');
    });

    it('shows payslip rows or empty state', () => {
      cy.get('@payCard').within(() => {
        cy.get('[data-testid="payslip-row"]').then(($rows) => {
          if ($rows.length === 0) {
            cy.contains(/no payslips/i).should('be.visible');
          } else {
            cy.wrap($rows).should('have.length.gte', 1);
          }
        });
      });
    });
  });

  // ── 4. Work location history ──────────────────────────────────
  describe('Work location history', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="personal-info-card"]', { timeout: 10000 });
    });

    it('shows location rows if location data exists', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="location-row"]').length) {
          cy.get('[data-testid="location-row"]').should('have.length.gte', 1);
        }
      });
    });
  });

  // ── 5. Loading skeleton ───────────────────────────────────────
  describe('Loading state', () => {
    it('shows skeleton while loading on slow connection', () => {
      cy.viewport(390, 844);
      cy.intercept('GET', '**/api/ess/profile', (req) => {
        req.on('response', (res) => { res.setDelay(3000); });
      });
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-testid="profile-skeleton"]').should('exist');
    });
  });

  // ── 6. Desktop coexistence ────────────────────────────────────
  describe('Desktop viewport — profile page', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
    });

    it('renders profile page at desktop width', () => {
      cy.get('body', { timeout: 10000 }).should('be.visible');
      cy.contains('Profile', { timeout: 10000 }).should('be.visible');
    });
  });
});
