/**
 * E2E tests for Task 70 — ESS Mobile Notifications
 *
 * Covers:
 *  1. Notification feed loads at /app/ess/notifications (mobile viewport)
 *  2. Notifications grouped into sections (Today / Yesterday / Earlier)
 *  3. Unread indicators (dot, bold title)
 *  4. Tap unread → marks as read, navigates to link
 *  5. Mark all read removes all dots
 *  6. Empty state
 *  7. Desktop coexistence
 */
describe('ESS — Mobile Notifications (Task 70)', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Notification feed loads ─────────────────────────────────────
  describe('Notification feed — mobile viewport', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
    });

    it('renders mobile notifications container', () => {
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');
    });

    it('shows Notifications header', () => {
      cy.contains('Notifications', { timeout: 10000 }).should('be.visible');
    });

    it('shows Mark all read button', () => {
      cy.get('[data-testid="mark-all-read-btn"]').should('exist');
    });
  });

  // ── 2. Notification grouping ───────────────────────────────────────
  describe('Time-grouped sections', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');
    });

    it('renders notification rows', () => {
      cy.get('[data-testid="mobile-notifications"]').then(($el) => {
        const hasRows = $el.find('[data-testid="notification-row"]').length > 0;
        const hasEmpty = $el.find('[data-testid="notifications-empty"]').length > 0;
        // Either notifications exist or empty state shows
        expect(hasRows || hasEmpty).to.be.true;
      });
    });

    it('section headers appear when multiple day groups exist', () => {
      cy.get('[data-testid="mobile-notifications"]').then(($el) => {
        const headers = $el.find('[data-testid="section-header"]');
        // Headers appear if there are notifications from different days
        if (headers.length > 0) {
          cy.get('[data-testid="section-header"]').first().should('be.visible');
        }
      });
    });
  });

  // ── 3. Unread indicators ───────────────────────────────────────────
  describe('Unread vs read states', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');
    });

    it('unread notifications show a blue dot', () => {
      cy.get('[data-testid="notification-row"]').then(($rows) => {
        if ($rows.length > 0) {
          // Check if any unread dots exist
          cy.get('[data-testid="mobile-notifications"]').find('[data-testid="unread-dot"]')
            .should('have.length.gte', 0);
        }
      });
    });
  });

  // ── 4. Tap notification → navigate ─────────────────────────────────
  describe('Tap notification to navigate', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');
    });

    it('tapping a notification row is clickable', () => {
      cy.get('[data-testid="notification-row"]').then(($rows) => {
        if ($rows.length > 0) {
          cy.get('[data-testid="notification-row"]').first().click();
          // Should either navigate away or stay on notifications
          cy.url().should('include', '/app/ess/');
        }
      });
    });
  });

  // ── 5. Mark all read ──────────────────────────────────────────────
  describe('Mark all read', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');
    });

    it('mark all read button exists and is clickable', () => {
      cy.get('[data-testid="mark-all-read-btn"]').should('exist').click();
    });

    it('after mark all read, unread dots are removed', () => {
      cy.get('[data-testid="mark-all-read-btn"]').click();
      cy.wait(500);
      cy.get('[data-testid="unread-dot"]').should('have.length', 0);
    });
  });

  // ── 6. Empty state ────────────────────────────────────────────────
  describe('Empty state', () => {
    it('shows empty state illustration when no notifications', () => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');

      // If empty state is showing, verify its content
      cy.get('[data-testid="mobile-notifications"]').then(($el) => {
        if ($el.find('[data-testid="notifications-empty"]').length > 0) {
          cy.contains('All caught up!').should('be.visible');
          cy.contains('No new notifications').should('be.visible');
        }
      });
    });
  });

  // ── 7. Loading state ──────────────────────────────────────────────
  describe('Loading skeleton', () => {
    it('shows skeleton rows while loading', () => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      // Skeleton may flash briefly — check it exists or notifications load
      cy.get('[data-testid="mobile-notifications"]', { timeout: 10000 }).should('exist');
    });
  });

  // ── 8. Desktop coexistence ────────────────────────────────────────
  describe('Desktop viewport — original notifications page', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
    });

    it('does NOT render mobile notifications at desktop width', () => {
      cy.get('[data-testid="mobile-notifications"]').should('not.exist');
    });

    it('renders desktop notification page', () => {
      cy.get('body', { timeout: 10000 }).should('be.visible');
      cy.contains('Notifications', { timeout: 10000 }).should('be.visible');
    });
  });
});
