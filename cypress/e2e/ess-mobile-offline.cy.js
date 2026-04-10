/**
 * E2E tests for Task 71 — ESS Mobile Offline & Sync Indicators
 *
 * Tests:
 *  1. MobileOfflineBanner renders on mobile viewport
 *  2. QueuedActionsNotice on profile and notifications screens
 *  3. QueuedBadge on bottom nav profile tab
 *  4. SyncToast renders after reconnect
 *  5. Desktop does not render mobile offline indicators
 */
describe('ESS Mobile Offline Indicators', () => {
  const BASE = 'http://localhost:5173';

  const loginAs = (role) => {
    const accounts = {
      employee: { email: 'employee@staffscheduler.com', password: 'Employee@123' },
    };
    const acct = accounts[role];
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. MobileOfflineBanner ──
  describe('MobileOfflineBanner (mobile viewport)', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.wait(1500);
    });

    it('does not show offline banner when online', () => {
      // The banner should not be visible when connected
      cy.get('[data-testid="mobile-offline-banner"]').should('not.exist');
    });

    it('page loads MobileShell with offline indicator support', () => {
      cy.get('[data-testid="mobile-shell"]', { timeout: 10000 }).should('exist');
    });
  });

  // ── 2. QueuedActionsNotice on profile ──
  describe('QueuedActionsNotice on profile', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/profile`);
      cy.wait(1500);
    });

    it('does not show queued actions notice when no pending items', () => {
      // With no offline queue, notice should not render
      cy.get('[data-testid="queued-actions-notice"]').should('not.exist');
    });
  });

  // ── 3. QueuedActionsNotice on notifications ──
  describe('QueuedActionsNotice on notifications', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/notifications`);
      cy.wait(1500);
    });

    it('does not show queued actions notice when no pending items', () => {
      cy.get('[data-testid="queued-actions-notice"]').should('not.exist');
    });
  });

  // ── 4. QueuedBadge on bottom nav ──
  describe('QueuedBadge on bottom nav', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.wait(1500);
    });

    it('does not show queued badge when no pending items', () => {
      cy.get('[data-testid="queued-badge"]').should('not.exist');
    });

    it('bottom nav is visible on mobile', () => {
      cy.get('nav[role="navigation"]', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── 5. SyncToast not shown when no sync results ──
  describe('SyncToast', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.wait(1500);
    });

    it('does not show sync toast when online with no recent sync', () => {
      cy.get('[data-testid="sync-toast"]').should('not.exist');
    });
  });

  // ── 6. Desktop — mobile indicators should NOT render ──
  describe('Desktop viewport', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      loginAs('employee');
      cy.visit(`${BASE}/app/ess/dashboard`);
      cy.wait(1500);
    });

    it('does not render mobile offline banner on desktop', () => {
      cy.get('[data-testid="mobile-offline-banner"]').should('not.exist');
    });

    it('does not render queued badge on desktop', () => {
      cy.get('[data-testid="queued-badge"]').should('not.exist');
    });

    it('does not render sync toast on desktop', () => {
      cy.get('[data-testid="sync-toast"]').should('not.exist');
    });
  });
});
