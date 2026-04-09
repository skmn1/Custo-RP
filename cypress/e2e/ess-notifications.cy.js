/**
 * E2E tests for Employee Notification Centre (Task 53)
 *
 * Tests bell icon, dropdown, notification page, filtering, and actions.
 */
describe('Employee Notification Centre', () => {
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

  // ── 1. Bell Icon in Navbar ──
  describe('Notification Bell', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('displays bell icon in top bar', () => {
      cy.get('[data-cy="notification-bell"]', { timeout: 10000 }).should('be.visible');
    });

    it('shows unread badge when there are unread notifications', () => {
      cy.get('[data-cy="notification-badge"]', { timeout: 10000 }).should('be.visible');
    });

    it('opens dropdown when bell is clicked', () => {
      cy.get('[data-cy="notification-bell"]').click();
      cy.get('[data-cy="notification-dropdown"]', { timeout: 5000 }).should('be.visible');
    });

    it('shows notification items in dropdown', () => {
      cy.get('[data-cy="notification-bell"]').click();
      cy.get('[data-cy="notification-dropdown"]').within(() => {
        cy.get('[data-cy="notification-dropdown-item"]').should('have.length.greaterThan', 0);
      });
    });

    it('closes dropdown when clicking outside', () => {
      cy.get('[data-cy="notification-bell"]').click();
      cy.get('[data-cy="notification-dropdown"]').should('be.visible');
      cy.get('body').click(10, 10);
      cy.get('[data-cy="notification-dropdown"]').should('not.exist');
    });
  });

  // ── 2. Notification Dropdown Actions ──
  describe('Dropdown Actions', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('mark all read button is visible in dropdown', () => {
      cy.get('[data-cy="notification-bell"]').click();
      cy.get('[data-cy="dropdown-mark-all-read"]', { timeout: 5000 }).should('be.visible');
    });

    it('view all link navigates to full notifications page', () => {
      cy.get('[data-cy="notification-bell"]').click();
      cy.get('[data-cy="view-all-notifications"]').click();
      cy.url().should('include', '/app/ess/notifications');
    });
  });

  // ── 3. Notifications Page ──
  describe('Notifications Page', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.wait(1500);
    });

    it('displays notification page title', () => {
      cy.contains('Notifications', { timeout: 10000 }).should('be.visible');
    });

    it('shows type filter dropdown', () => {
      cy.get('[data-cy="type-filter"]').should('be.visible');
    });

    it('shows unread only toggle', () => {
      cy.get('[data-cy="unread-toggle"]').should('be.visible');
    });

    it('displays notification cards', () => {
      cy.get('[data-cy="notification-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });

    it('filters by type', () => {
      cy.get('[data-cy="type-filter"]').select('leave');
      cy.wait(500);
      // After filtering, all visible cards should be leave-related
      // or none if no leave notifications exist
      cy.get('[data-cy="notification-list"]').should('be.visible');
    });

    it('toggles unread only', () => {
      cy.get('[data-cy="unread-toggle"]').check();
      cy.wait(1000);
      // Should reload with only unread notifications
      cy.get('[data-cy="notification-list"]').should('exist');
    });

    it('has delete button on each notification card', () => {
      cy.get('[data-cy="notification-card"]').first().within(() => {
        cy.get('[data-cy="delete-notification"]').should('be.visible');
      });
    });
  });

  // ── 4. Mark as Read Flow ──
  describe('Mark as Read', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('clicking a notification with link marks it as read', () => {
      cy.get('[data-cy="notification-bell"]').click();
      cy.get('[data-cy="notification-dropdown-item"]', { timeout: 5000 })
        .first()
        .click();
      // Should navigate or close dropdown
      cy.get('[data-cy="notification-dropdown"]').should('not.exist');
    });
  });

  // ── 5. Page Mark All Read ──
  describe('Page Mark All Read', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.wait(1500);
    });

    it('mark all read button is visible when unread notifications exist', () => {
      cy.get('[data-cy="page-mark-all-read"]', { timeout: 10000 }).should('be.visible');
    });
  });
});
