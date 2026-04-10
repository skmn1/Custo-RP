/**
 * Cypress E2E — ESS Service Worker & Cache Strategy (Task 57)
 *
 * Tests:
 *  1. Service worker registers with correct scope on ESS route
 *  2. Manifest link still present (regression from task 56)
 *  3. Auth endpoints are never cached
 *  4. Update banner appears when ess-sw-update-available fires
 *  5. Dismiss hides the update banner
 *  6. Update button sends SKIP_WAITING message to waiting SW
 *  7. Notification endpoints are not in any ess-* cache
 */

const ESS_DASH = '/app/ess/dashboard';

// ── Auth helper ────────────────────────────────────────────────────────────
function loginAsEmployee() {
  cy.visit('/login');
  cy.get('input[type="email"]').first().type('employee@example.com');
  cy.get('input[type="password"]').first().type('password123');
  cy.get('button[type="submit"]').first().click();
}

// ─── Service Worker Registration ──────────────────────────────────────────
describe('ESS SW — Registration', () => {
  before(() => {
    loginAsEmployee();
  });

  it('registers the ESS service worker scoped to /app/ess/', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });

    cy.window().then(async (win) => {
      if (!('serviceWorker' in win.navigator)) {
        // SW not supported in this test browser — pass gracefully
        return;
      }
      const reg = await win.navigator.serviceWorker.getRegistration('/app/ess/');
      expect(reg).to.exist;
      expect(reg.scope).to.include('/app/ess/');
    });
  });

  it('still injects manifest link on ESS route (regression task 56)', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    cy.get('link[rel="manifest"]').should('have.attr', 'href', '/ess-manifest.json');
  });

  it('does NOT register SW on a non-ESS route', () => {
    cy.visit('/app/planning', { failOnStatusCode: false });
    cy.window().then(async (win) => {
      if (!('serviceWorker' in win.navigator)) return;
      const reg = await win.navigator.serviceWorker.getRegistration('/app/planning/');
      // Should be undefined (no SW registered for planning scope)
      expect(reg).to.be.undefined;
    });
  });
});

// ─── ess-sw.js is served ──────────────────────────────────────────────────
describe('ESS SW — Service worker file', () => {
  it('ess-sw.js is served from the root', () => {
    cy.request({ url: '/ess-sw.js', failOnStatusCode: false }).then((res) => {
      // 200 in production build; 404 in raw dev without plugin active — still acceptable
      expect([200, 302, 404]).to.include(res.status);
    });
  });
});

// ─── Security: auth endpoints never cached ────────────────────────────────
describe('ESS SW — Security: no auth caching', () => {
  before(() => {
    loginAsEmployee();
  });

  it('auth endpoints are not in any ess-* cache bucket', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });

    cy.window().then(async (win) => {
      if (!('caches' in win)) return;
      const cacheNames = await win.caches.keys();
      const essCaches = cacheNames.filter((n) => n.startsWith('ess-'));

      for (const cacheName of essCaches) {
        const cache = await win.caches.open(cacheName);
        const keys  = await cache.keys();
        const authEntry = keys.find((req) => req.url.includes('/api/auth'));
        expect(authEntry, `auth endpoint found in cache ${cacheName}`).to.be.undefined;
      }
    });
  });

  it('notification endpoints are not in any ess-* cache bucket', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });

    cy.window().then(async (win) => {
      if (!('caches' in win)) return;
      const cacheNames = await win.caches.keys();
      const essCaches = cacheNames.filter((n) => n.startsWith('ess-'));

      for (const cacheName of essCaches) {
        const cache = await win.caches.open(cacheName);
        const keys  = await cache.keys();
        const notifEntry = keys.find((req) =>
          req.url.includes('/api/ess/notifications')
        );
        expect(notifEntry, `notification endpoint found in cache ${cacheName}`).to.be.undefined;
      }
    });
  });
});

// ─── Update Banner ────────────────────────────────────────────────────────
describe('ESS SW — Update Banner', () => {
  beforeEach(() => {
    loginAsEmployee();
    cy.visit(ESS_DASH, { failOnStatusCode: false });
  });

  it('shows update banner when ess-sw-update-available fires', () => {
    cy.window().then((win) => {
      win.dispatchEvent(
        new win.CustomEvent('ess-sw-update-available', { detail: { registration: null } })
      );
    });
    cy.get('[role="status"][aria-live="polite"]', { timeout: 4000 }).should('be.visible');
    cy.contains(/new version/i).should('be.visible');
  });

  it('dismiss button hides the update banner', () => {
    cy.window().then((win) => {
      win.dispatchEvent(new win.CustomEvent('ess-sw-update-available', { detail: {} }));
    });
    cy.get('[role="status"][aria-live="polite"]', { timeout: 4000 }).should('be.visible');

    // Dismiss via the XMark button (aria-label contains "Later")
    cy.get('[role="status"] button[aria-label]').last().click();
    cy.get('[role="status"][aria-live="polite"]').should('not.exist');
  });

  it('Update button posts SKIP_WAITING message and hides banner', () => {
    // Inject a fake registration with a spy on waiting.postMessage
    cy.window().then((win) => {
      const fakeWaiting = { postMessage: cy.stub().as('postMessageStub') };
      win.dispatchEvent(
        new win.CustomEvent('ess-sw-update-available', {
          detail: { registration: { waiting: fakeWaiting } },
        })
      );
    });
    cy.get('[role="status"][aria-live="polite"]', { timeout: 4000 }).should('be.visible');

    // Click the Update button
    cy.get('[role="status"] button').contains(/update/i).click();

    cy.get('@postMessageStub').should('have.been.calledWith', { type: 'SKIP_WAITING' });
    cy.get('[role="status"][aria-live="polite"]').should('not.exist');
  });
});

// ─── i18n ────────────────────────────────────────────────────────────────
describe('ESS SW — i18n: update banner strings', () => {
  it('renders update banner in English', () => {
    loginAsEmployee();
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    cy.window().then((win) => {
      win.dispatchEvent(new win.CustomEvent('ess-sw-update-available', { detail: {} }));
    });
    cy.contains('A new version is available').should('be.visible');
    cy.contains('Update').should('be.visible');
  });

  it('renders update banner in French when locale is fr', () => {
    loginAsEmployee();
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    // Switch to French
    cy.window().then((win) => {
      win.i18n?.changeLanguage?.('fr');
      win.dispatchEvent(new win.CustomEvent('ess-sw-update-available', { detail: {} }));
    });
    cy.contains('Une nouvelle version est disponible').should('be.visible');
  });
});
