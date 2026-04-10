/**
 * Custom Cypress commands for PWA / Service Worker testing.
 *
 * Usage:
 *   cy.goOffline()     – intercept all API calls + dispatch 'offline' event
 *   cy.goOnline()      – restore network + dispatch 'online' event
 *   cy.waitForSw()     – wait until the service worker is active (controller != null)
 *   cy.clearSwCaches() – delete all caches via SW message ESS_CLEAR_EMPLOYEE
 */

// ---------------------------------------------------------------------------
// cy.goOffline() — flush API requests to network errors + fire 'offline' DOM event
// ---------------------------------------------------------------------------
Cypress.Commands.add('goOffline', () => {
  cy.log('Going offline…');
  cy.intercept('/api/**', { forceNetworkError: true }).as('apiOffline');
  cy.intercept('/app/ess/api/**', { forceNetworkError: true }).as('essApiOffline');
  cy.window().then((win) => {
    win.dispatchEvent(new win.Event('offline'));
  });
});

// ---------------------------------------------------------------------------
// cy.goOnline() — remove network intercepts + fire 'online' DOM event
// ---------------------------------------------------------------------------
Cypress.Commands.add('goOnline', () => {
  cy.log('Going online…');
  // Remove the forceNetworkError intercepts by re-routing to the real server
  cy.intercept('/api/**').as('apiOnline');
  cy.intercept('/app/ess/api/**').as('essApiOnline');
  cy.window().then((win) => {
    win.dispatchEvent(new win.Event('online'));
  });
});

// ---------------------------------------------------------------------------
// cy.waitForSw() — poll navigator.serviceWorker.controller until truthy
// ---------------------------------------------------------------------------
Cypress.Commands.add('waitForSw', (opts = {}) => {
  const timeout = opts.timeout || 10000;
  cy.window({ timeout }).should((win) => {
    expect(
      win.navigator.serviceWorker && win.navigator.serviceWorker.controller,
      'Service Worker controller must be active'
    ).to.be.ok;
  });
});

// ---------------------------------------------------------------------------
// cy.clearSwCaches() — send ESS_CLEAR_EMPLOYEE to all active SW registrations
// ---------------------------------------------------------------------------
Cypress.Commands.add('clearSwCaches', () => {
  cy.window().then((win) => {
    if (!win.navigator.serviceWorker) return;
    return win.navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        const target = reg.active || reg.installing || reg.waiting;
        if (target) target.postMessage({ type: 'ESS_CLEAR_EMPLOYEE' });
      });
    });
  });
});
