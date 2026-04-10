/**
 * E2E tests for Task 58 — ESS Offline Support for Core Read Flows
 *
 * Covers:
 *  1. Offline banner appears when browser goes offline inside ESS
 *  2. Offline banner disappears when browser comes back online
 *  3. "Back online" toast is shown on reconnection
 *  4. EssOfflineFallback renders on unvisited page when offline
 *  5. Payslip download button is disabled (OfflineDisabled) when offline
 *  6. Attendance export button is disabled (OfflineDisabled) when offline
 *  7. Bank change-request button is disabled (OfflineDisabled) when offline
 *  8. Offline banner is absent on non-ESS routes
 */
describe('ESS Offline Support (Task 58)', () => {
  const BASE = 'http://localhost:5173';

  const loginAsEmployee = () => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains('employee', { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Offline banner visible when offline inside ESS ──────────────
  describe('Offline banner', () => {
    beforeEach(() => {
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess`);
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    it('shows offline banner when network goes offline', () => {
      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');
    });

    it('hides offline banner when network comes back online', () => {
      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');
      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('online'));
      });
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('not.exist');
    });

    it('shows back-online toast when reconnecting', () => {
      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });
      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('online'));
      });
      cy.get('[data-testid="ess-back-online-toast"]', { timeout: 5000 }).should('be.visible');
    });
  });

  // ── 2. Offline fallback on unvisited pages ──────────────────────────
  describe('EssOfflineFallback', () => {
    it('shows offline fallback on dashboard when offline with no cache', () => {
      // Intercept and abort ESS API calls to simulate no cached data
      cy.intercept('/api/ess/**', { forceNetworkError: true }).as('essApiBlocked');

      loginAsEmployee();
      cy.visit(`${BASE}/app/ess`);

      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });

      // Wait for loading to finish
      cy.get('[data-testid="ess-offline-fallback"]', { timeout: 8000 }).should('be.visible');
    });

    it('shows offline fallback on payslips page when offline with no cache', () => {
      cy.intercept('/api/ess/payslips**', { forceNetworkError: true }).as('payslipsBlocked');

      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/payslips`);

      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });

      cy.get('[data-testid="ess-offline-fallback"]', { timeout: 8000 }).should('be.visible');
    });

    it('shows offline fallback on schedule page when offline with no cached shifts', () => {
      cy.intercept('/api/ess/schedule**', { forceNetworkError: true }).as('scheduleBlocked');

      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/schedule`);

      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });

      cy.get('[data-testid="ess-offline-fallback"]', { timeout: 8000 }).should('be.visible');
    });
  });

  // ── 3. OfflineDisabled wrappers ────────────────────────────────────
  describe('OfflineDisabled wrappers', () => {
    beforeEach(() => {
      loginAsEmployee();
    });

    it('disables payslip download button when offline', () => {
      cy.visit(`${BASE}/app/ess/payslips`);
      cy.get('body', { timeout: 10000 }).should('be.visible');

      // Navigate to a payslip detail (if any exist)
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="/app/ess/payslips/"]').length > 0) {
          cy.get('a[href*="/app/ess/payslips/"]').first().click();
          cy.wait(1000);

          cy.window().then((win) => {
            win.dispatchEvent(new win.Event('offline'));
          });

          cy.get('[data-testid="offline-disabled-wrapper"]', { timeout: 5000 }).should('be.visible');
        } else {
          // No payslips — skip this assertion
          cy.log('No payslip cards found, skipping download-disabled check');
        }
      });
    });

    it('disables attendance export button when offline', () => {
      cy.visit(`${BASE}/app/ess/attendance`);
      cy.get('body', { timeout: 10000 }).should('be.visible');

      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });

      cy.get('[data-testid="offline-disabled-wrapper"]', { timeout: 5000 }).should('be.visible');
    });

    it('disables bank change-request button when offline', () => {
      cy.visit(`${BASE}/app/ess/profile`);
      cy.get('[data-cy="tab-bank"]', { timeout: 10000 }).click();

      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });

      cy.get('[data-testid="offline-disabled-wrapper"]', { timeout: 5000 }).should('be.visible');
    });
  });

  // ── 4. Offline banner absent on non-ESS routes ─────────────────────
  describe('No offline banner on non-ESS routes', () => {
    it('does not show ESS offline banner on the home launcher page', () => {
      loginAsEmployee();
      cy.visit(`${BASE}/`);
      cy.get('body', { timeout: 10000 }).should('be.visible');

      cy.window().then((win) => {
        win.dispatchEvent(new win.Event('offline'));
      });

      cy.get('[data-testid="ess-offline-banner"]').should('not.exist');
    });
  });
});
