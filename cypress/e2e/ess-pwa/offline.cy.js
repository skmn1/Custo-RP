/**
 * E2E tests for Task 62 — ESS PWA Offline QA
 *
 * Validates offline UX using the cy.goOffline() / cy.goOnline() custom commands.
 * Covers all major ESS pages and the cached-content path when SW is active.
 */
describe('ESS PWA Offline QA (Task 62)', () => {
  const BASE = 'http://localhost:5173';

  const loginAsEmployee = () => {
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.contains('employee', { matchCase: false, timeout: 10000 }).click();
    cy.wait(1500);
  };

  // ── 1. Offline banner lifecycle using custom pwa-commands ──────────
  describe('Offline banner lifecycle (pwa-commands)', () => {
    beforeEach(() => {
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess`);
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    afterEach(() => {
      cy.goOnline();
    });

    it('shows offline banner via cy.goOffline()', () => {
      cy.goOffline();
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');
    });

    it('hides banner and shows back-online toast via cy.goOnline()', () => {
      cy.goOffline();
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');
      cy.goOnline();
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('not.exist');
      cy.get('[data-testid="ess-back-online-toast"]', { timeout: 5000 }).should('be.visible');
    });

    it('back-online toast auto-dismisses', () => {
      cy.goOffline();
      cy.goOnline();
      cy.get('[data-testid="ess-back-online-toast"]', { timeout: 5000 }).should('be.visible');
      // Toast should disappear within 5 s
      cy.get('[data-testid="ess-back-online-toast"]', { timeout: 8000 }).should('not.exist');
    });
  });

  // ── 2. Schedule page offline behaviour ────────────────────────────
  describe('Schedule page — offline', () => {
    beforeEach(() => {
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/schedule`);
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    afterEach(() => {
      cy.goOnline();
    });

    it('renders stale data indicator when offline', () => {
      cy.goOffline();
      // If SW served cached data the StaleDataIndicator should appear
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="stale-data-indicator"]').length > 0) {
          cy.get('[data-testid="stale-data-indicator"]').should('be.visible');
        } else {
          // Without a warm cache the offline-fallback appears instead
          cy.get('[data-testid="ess-offline-fallback"]', { timeout: 8000 }).should('be.visible');
        }
      });
    });

    it('shift cards render from cache when offline', () => {
      // Pre-warm: load page online first
      cy.visit(`${BASE}/app/ess/schedule`);
      cy.get('body', { timeout: 10000 }).should('be.visible');

      cy.goOffline();

      // Either cached shift cards or the offline fallback — both are valid
      cy.get('[data-testid="shift-card"], [data-testid="ess-offline-fallback"]', {
        timeout: 8000,
      }).should('be.visible');
    });
  });

  // ── 3. Payslips offline behaviour ─────────────────────────────────
  describe('Payslips page — offline', () => {
    beforeEach(() => {
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/payslips`);
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    afterEach(() => {
      cy.goOnline();
    });

    it('shows offline fallback when payslips API is blocked', () => {
      cy.goOffline();
      cy.get('[data-testid="ess-offline-fallback"], [data-testid="stale-data-indicator"]', {
        timeout: 8000,
      }).should('be.visible');
    });

    it('disables the payslip download button while offline', () => {
      cy.get('body').then(($body) => {
        // Only assert if a payslip row is currently visible
        if ($body.find('a[href*="/app/ess/payslips/"]').length > 0) {
          cy.get('a[href*="/app/ess/payslips/"]').first().click();
          cy.get('body', { timeout: 5000 }).should('be.visible');
          cy.goOffline();
          cy.get('[data-testid="offline-disabled-wrapper"]', { timeout: 5000 }).should(
            'be.visible'
          );
        } else {
          cy.log('No payslip items found; download-disabled assertion skipped');
        }
      });
    });
  });

  // ── 4. Attendance offline behaviour ───────────────────────────────
  describe('Attendance page — offline', () => {
    beforeEach(() => {
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess/attendance`);
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    afterEach(() => {
      cy.goOnline();
    });

    it('shows offline fallback or stale data on attendance page', () => {
      cy.goOffline();
      cy.get('[data-testid="ess-offline-fallback"], [data-testid="stale-data-indicator"]', {
        timeout: 8000,
      }).should('be.visible');
    });

    it('disables export button while offline', () => {
      cy.goOffline();
      cy.get('[data-testid="offline-disabled-wrapper"]', { timeout: 8000 }).should('be.visible');
    });
  });

  // ── 5. Cross-page offline persistence ─────────────────────────────
  describe('Cross-page navigation while offline', () => {
    it('offline banner persists as user navigates between ESS pages', () => {
      loginAsEmployee();
      cy.visit(`${BASE}/app/ess`);
      cy.get('body', { timeout: 10000 }).should('be.visible');

      cy.goOffline();
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');

      // Navigate to schedule
      cy.visit(`${BASE}/app/ess/schedule`);
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');

      // Navigate to payslips
      cy.visit(`${BASE}/app/ess/payslips`);
      cy.get('[data-testid="ess-offline-banner"]', { timeout: 5000 }).should('be.visible');

      cy.goOnline();
    });
  });

  // ── 6. Non-ESS routes do NOT show ESS offline banner ──────────────
  describe('No ESS offline banner on non-ESS routes', () => {
    it('does not show ess-offline-banner on the launcher page', () => {
      loginAsEmployee();
      cy.visit(`${BASE}/`);
      cy.get('body', { timeout: 10000 }).should('be.visible');
      cy.goOffline();
      cy.get('[data-testid="ess-offline-banner"]').should('not.exist');
      cy.goOnline();
    });
  });
});
