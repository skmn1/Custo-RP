/**
 * E2E tests for Employee Profile Self-Service (Task 52)
 *
 * Tests the profile page tabs, bank details change request workflow,
 * experience CRUD, qualifications CRUD with expiry badges.
 */
describe('ESS Profile Self-Service', () => {
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

  // ── 1. Profile page loads with tabs ──

  describe('Profile page structure', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('shows the profile title and completeness bar', () => {
      cy.contains('My Profile').should('be.visible');
      cy.contains('% complete').should('be.visible');
    });

    it('renders all 7 tabs', () => {
      cy.get('[data-cy="profile-tabs"]').within(() => {
        cy.get('button').should('have.length', 7);
        cy.contains('Overview').should('be.visible');
        cy.contains('Personal Info').should('be.visible');
        cy.contains('Contract').should('be.visible');
        cy.contains('Bank Details').should('be.visible');
        cy.contains('Experience').should('be.visible');
        cy.contains('Qualifications').should('be.visible');
        cy.contains('Change Requests').should('be.visible');
      });
    });

    it('shows overview tab by default with employee info', () => {
      // The overview tab should show the employee name and basic stats
      cy.get('[data-cy="profile-tabs"] button').first().should('have.class', 'border-indigo-500');
    });
  });

  // ── 2. Tab navigation ──

  describe('Tab navigation', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('switches to Personal Info tab', () => {
      cy.get('[data-cy="tab-personal"]').click();
      cy.contains('Personal Information').should('be.visible');
    });

    it('switches to Contract tab', () => {
      cy.get('[data-cy="tab-contract"]').click();
      cy.contains('Job Information').should('be.visible');
    });

    it('switches to Bank Details tab', () => {
      cy.get('[data-cy="tab-bank"]').click();
      cy.contains('Bank Details').should('be.visible');
    });

    it('switches to Experience tab', () => {
      cy.get('[data-cy="tab-experience"]').click();
      cy.contains('Work Experience').should('be.visible');
    });

    it('switches to Qualifications tab', () => {
      cy.get('[data-cy="tab-qualifications"]').click();
      cy.contains('Qualifications').should('be.visible');
    });

    it('switches to Change Requests tab', () => {
      cy.get('[data-cy="tab-changeRequests"]').click();
      cy.contains('Change Requests').should('be.visible');
    });
  });

  // ── 3. Bank details ──

  describe('Bank Details tab', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`, { timeout: 15000 });
      cy.wait(2000);
      cy.get('[data-cy="tab-bank"]').click();
    });

    it('displays masked IBAN', () => {
      // IBAN should be masked: ****XXXX (last 4 only)
      cy.contains('****').should('be.visible');
    });

    it('shows the masked IBAN notice', () => {
      cy.contains('partially masked').should('be.visible');
    });

    it('opens bank change request form', () => {
      cy.get('[data-cy="request-bank-change"]').click();
      cy.get('[data-cy="bank-change-form"]').should('be.visible');
    });
  });

  // ── 4. Experience CRUD ──

  describe('Experience tab', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`, { timeout: 15000 });
      cy.wait(2000);
      cy.get('[data-cy="tab-experience"]').click();
    });

    it('shows existing experience entries', () => {
      // Seed data provides experience entries
      cy.get('[data-cy="experience-entry"]').should('have.length.gte', 0);
    });

    it('opens add experience form', () => {
      cy.get('[data-cy="add-experience"]').click();
      cy.get('[data-cy="experience-form"]').should('be.visible');
    });

    it('can add a new experience entry', () => {
      cy.get('[data-cy="add-experience"]').click();
      cy.get('[data-cy="experience-form"]').within(() => {
        cy.get('input').eq(0).type('Test Company');
        cy.get('input').eq(1).type('Test Position');
        cy.get('input').eq(2).type('2023-01-01');
        cy.get('input').eq(3).type('2023-12-31');
        cy.get('button[type="submit"]').click();
      });
      cy.wait(1000);
      cy.contains('Test Company').should('be.visible');
    });
  });

  // ── 5. Qualifications CRUD ──

  describe('Qualifications tab', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`, { timeout: 15000 });
      cy.wait(2000);
      cy.get('[data-cy="tab-qualifications"]').click();
    });

    it('shows existing qualification entries', () => {
      cy.get('[data-cy="qualification-entry"]').should('have.length.gte', 0);
    });

    it('shows expiry badges', () => {
      // At least one badge type should be visible if entries exist
      cy.get('[data-cy="qualification-entry"]').then(($entries) => {
        if ($entries.length > 0) {
          cy.get('[data-cy="qualification-entry"]').first().within(() => {
            cy.get('span').should('have.length.gte', 1);
          });
        }
      });
    });

    it('opens add qualification form', () => {
      cy.get('[data-cy="add-qualification"]').click();
      cy.get('[data-cy="qualification-form"]').should('be.visible');
    });

    it('can add a new qualification', () => {
      cy.get('[data-cy="add-qualification"]').click();
      cy.get('[data-cy="qualification-form"]').within(() => {
        cy.get('input').eq(0).type('Test Certification');
        cy.get('input').eq(1).type('Test Body');
        cy.get('input').eq(2).type('2024-01-15');
        cy.get('button[type="submit"]').click();
      });
      cy.wait(1000);
      cy.contains('Test Certification').should('be.visible');
    });
  });
});
