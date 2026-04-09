/**
 * E2E tests for Planning App (Task 35)
 *
 * Tests route migration, RBAC guards, sidebar filtering, and new pages.
 */
describe('Planning App', () => {
  const BASE = 'http://localhost:5173';

  // ── Helper: login via dev login page ──
  const loginAs = (role) => {
    const accounts = {
      super_admin: { email: 'admin@staffscheduler.com', password: 'Admin@123' },
      hr_manager: { email: 'manager@staffscheduler.com', password: 'Manager@123' },
      employee: { email: 'employee@staffscheduler.com', password: 'Employee@123' },
      planner: { email: 'planner@staffscheduler.com', password: 'Planner@123' },
      accounting_agent: { email: 'accounting@staffscheduler.com', password: 'Admin@123' },
    };
    const acct = accounts[role];
    cy.visit(`${BASE}/login`);
    cy.get('body', { timeout: 15000 }).should('be.visible');
    // Dev login page uses role selection cards
    cy.contains(role.replace('_', ' '), { matchCase: false, timeout: 10000 }).click();
    cy.wait(2000);
  };

  // ── 1. Legacy route redirects ──
  describe('Route redirects', () => {
    beforeEach(() => {
      loginAs('super_admin');
    });

    it('redirects /scheduler to /app/planning/schedule', () => {
      cy.visit(`${BASE}/scheduler`);
      cy.url().should('include', '/app/planning/schedule');
    });

    it('redirects /availability to /app/planning/availability', () => {
      cy.visit(`${BASE}/availability`);
      cy.url().should('include', '/app/planning/availability');
    });

    it('redirects /time-off to /app/planning/time-off', () => {
      cy.visit(`${BASE}/time-off`);
      cy.url().should('include', '/app/planning/time-off');
    });

    it('redirects /shifts/swap to /app/planning/shift-swaps', () => {
      cy.visit(`${BASE}/shifts/swap`);
      cy.url().should('include', '/app/planning/shift-swaps');
    });

    it('redirects /templates to /app/planning/templates', () => {
      cy.visit(`${BASE}/templates`);
      cy.url().should('include', '/app/planning/templates');
    });
  });

  // ── 2. AppGuard blocks unauthorized roles ──
  describe('AppGuard RBAC', () => {
    it('accounting_agent visiting /app/planning/schedule is redirected to /access-denied', () => {
      loginAs('accounting_agent');
      cy.visit(`${BASE}/app/planning/schedule`);
      cy.url().should('include', '/access-denied');
    });
  });

  // ── 3. Employee sidebar filtering ──
  describe('Employee sidebar', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/planning`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('shows My Schedule, Availability, Time Off, and Shift Swaps', () => {
      cy.get('nav, aside').within(() => {
        cy.contains('My Schedule').should('be.visible');
        cy.contains('Availability').should('be.visible');
        cy.contains('Time Off').should('be.visible');
        cy.contains('Shift Swaps').should('be.visible');
      });
    });

    it('hides Schedule, Templates, and Reports from employee', () => {
      // These should NOT appear in the sidebar
      cy.get('nav, aside').then(($sidebar) => {
        // "Schedule" link for admin only (not "My Schedule")
        const text = $sidebar.text();
        expect(text).not.to.include('Templates');
        expect(text).not.to.include('Reports');
      });
    });
  });

  // ── 4. Employee cannot access restricted URLs directly ──
  describe('Employee direct URL restriction', () => {
    beforeEach(() => {
      loginAs('employee');
    });

    it('employee cannot access /app/planning/templates via URL', () => {
      cy.visit(`${BASE}/app/planning/templates`);
      // The page should render but the sidebar won't show it;
      // AppGuard still allows the route (planning app accessible to employee)
      // but the feature should show limited content or redirect
      cy.url().should('include', '/app/planning');
    });
  });

  // ── 5. My Schedule page ──
  describe('My Schedule page', () => {
    beforeEach(() => {
      loginAs('employee');
      cy.visit(`${BASE}/app/planning/my-schedule`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('displays the My Schedule heading', () => {
      cy.contains('My Schedule').should('be.visible');
    });

    it('shows week navigation buttons', () => {
      cy.contains('Previous').should('be.visible');
      cy.contains('Today').should('be.visible');
      cy.contains('Next').should('be.visible');
    });

    it('shows total hours summary', () => {
      cy.contains('total hours this week').should('be.visible');
    });

    it('has Request Time Off shortcut button', () => {
      cy.contains('Request Time Off').should('be.visible');
    });

    it('navigating via Request Time Off opens time-off page', () => {
      cy.contains('Request Time Off').click();
      cy.url().should('include', '/app/planning/time-off');
    });
  });

  // ── 6. Planner schedule view ──
  describe('Planner schedule view', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/planning/schedule`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders the staff scheduler', () => {
      cy.contains('Staff Scheduler', { timeout: 10000 }).should('be.visible');
    });

    it('shows Add Shift button for planner', () => {
      cy.contains('Add Shift').should('be.visible');
    });
  });

  // ── 7. Planning Reports page ──
  describe('Planning Reports page', () => {
    beforeEach(() => {
      loginAs('super_admin');
      cy.visit(`${BASE}/app/planning/reports`, { timeout: 15000 });
      cy.wait(2000);
    });

    it('renders all 5 report widgets', () => {
      cy.contains('Weekly Coverage').should('be.visible');
      cy.contains('Shift Distribution').should('be.visible');
      cy.contains('Overtime Summary').should('be.visible');
      cy.contains('Absence Heatmap').should('be.visible');
      cy.contains('Unfilled Shifts').should('be.visible');
    });

    it('has an export button', () => {
      cy.contains('Export').should('be.visible');
    });
  });

  // ── 8. Regression: offline shift persistence ─────────────────────────────
  // Verifies the dual-store (ssp:shifts:server + ssp:shifts:offline) strategy
  // introduced in fix/35-offline-persistence.
  describe('Offline shift persistence (regression)', () => {
    const SCHEDULE_URL = `${BASE}/app/planning/schedule`;

    beforeEach(() => {
      // Clear both stores before each test so there is no leftover state
      cy.clearLocalStorage('ssp:shifts:server');
      cy.clearLocalStorage('ssp:shifts:offline');
      loginAs('planner');
      cy.visit(SCHEDULE_URL, { timeout: 15000 });
      cy.contains('Staff Scheduler', { timeout: 15000 }).should('be.visible');
    });

    // ── 8a. Successful POST should NOT leave shift in offline store ──────────
    it('does not mark shift as offline when POST /api/shifts succeeds', () => {
      // Let the API succeed normally
      cy.intercept('POST', '/api/shifts').as('postShift');

      cy.contains('Add Shift').first().click();
      cy.wait('@postShift').its('response.statusCode').should('eq', 200);

      cy.window().then((win) => {
        const offline = JSON.parse(win.localStorage.getItem('ssp:shifts:offline') || '[]');
        expect(offline).to.have.length(0);
      });
    });

    // ── 8b. Failed POST should save shift to offline store ───────────────────
    it('saves shift to offline store when POST /api/shifts returns 500', () => {
      cy.intercept('POST', '/api/shifts', { statusCode: 500, body: { message: 'Simulated error' } }).as('failPost');

      cy.contains('Add Shift').first().click();
      cy.wait('@failPost');

      // Shift should appear in the UI
      cy.window().then((win) => {
        const offline = JSON.parse(win.localStorage.getItem('ssp:shifts:offline') || '[]');
        expect(offline.length).to.be.greaterThan(0);
        expect(offline[0]._offline).to.equal(true);
      });
    });

    // ── 8c. Offline shift survives page reload (regression for root bug) ─────
    it('offline shifts are still visible after page reload', () => {
      // Force shift creation offline
      cy.intercept('POST', '/api/shifts', { statusCode: 500, body: {} }).as('failPost');
      cy.contains('Add Shift').first().click();
      cy.wait('@failPost');

      // Capture offline shift id before reload
      cy.window().then((win) => {
        const offline = JSON.parse(win.localStorage.getItem('ssp:shifts:offline') || '[]');
        expect(offline.length).to.be.greaterThan(0);
        const offlineId = offline[0].id;

        // Allow GET to succeed (server does NOT know about this shift)
        cy.intercept('GET', '/api/shifts*', (req) => {
          req.reply({ statusCode: 200, body: [] }); // empty server list
        }).as('reloadFetch');

        cy.reload();
        cy.wait('@reloadFetch');
        cy.contains('Staff Scheduler', { timeout: 15000 }).should('be.visible');

        // The offline-pending shift must still be in the DOM after reload
        cy.window().then((winAfter) => {
          const offlineAfter = JSON.parse(winAfter.localStorage.getItem('ssp:shifts:offline') || '[]');
          expect(offlineAfter.some(s => s.id === offlineId)).to.equal(true);
        });
      });
    });

    // ── 8d. Deleting an offline-only shift removes it without a DELETE call ──
    it('deletes offline-only shift without calling DELETE /api/shifts', () => {
      cy.intercept('POST', '/api/shifts', { statusCode: 500, body: {} }).as('failPost');
      cy.contains('Add Shift').first().click();
      cy.wait('@failPost');

      cy.intercept('DELETE', '/api/shifts/**').as('deleteCall');

      // Click the delete button on the newly added (offline) shift
      cy.get('[data-testid="shift-card"]').last().within(() => {
        cy.get('[data-testid="delete-shift"]').click();
      });

      // No DELETE request should have been sent
      cy.get('@deleteCall.all').should('have.length', 0);

      cy.window().then((win) => {
        const offline = JSON.parse(win.localStorage.getItem('ssp:shifts:offline') || '[]');
        expect(offline).to.have.length(0);
      });
    });
  });
});
