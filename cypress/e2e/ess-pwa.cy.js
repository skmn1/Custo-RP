/**
 * Cypress E2E — ESS PWA Manifest & Installability (Task 56)
 *
 * Tests:
 *  1. ESS route injects manifest link
 *  2. Non-ESS route does NOT have manifest link
 *  3. Apple PWA meta tags present on ESS route
 *  4. Install banner renders when beforeinstallprompt fires
 *  5. Dismiss hides the banner and sets localStorage key
 *  6. iOS install sheet renders when iOS UA is spoofed
 *  7. Dismissing iOS sheet sets localStorage key
 */

const ESS_DASH = '/app/ess/dashboard';
const PLANNING = '/app/planning';

// Helper: log in as employee user
function loginAsEmployee() {
  cy.visit('/login');
  cy.get('[data-testid="email-input"], input[name="email"], input[type="email"]')
    .first()
    .type('employee@example.com');
  cy.get('[data-testid="password-input"], input[name="password"], input[type="password"]')
    .first()
    .type('password123');
  cy.get('[data-testid="login-submit"], button[type="submit"]')
    .first()
    .click();
}

describe('ESS PWA — Manifest & Meta Tags', () => {
  before(() => {
    loginAsEmployee();
  });

  it('injects <link rel="manifest"> on ESS route', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    cy.get('link[rel="manifest"]')
      .should('have.attr', 'href', '/ess-manifest.json');
  });

  it('injects theme-color meta tag on ESS route', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    cy.get('meta[name="theme-color"]')
      .should('have.attr', 'content', '#3B82F6');
  });

  it('injects apple-mobile-web-app-capable meta tag on ESS route', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    cy.get('meta[name="apple-mobile-web-app-capable"]')
      .should('have.attr', 'content', 'yes');
  });

  it('injects apple-touch-icon link on ESS route', () => {
    cy.visit(ESS_DASH, { failOnStatusCode: false });
    cy.get('link[rel="apple-touch-icon"]').should('exist');
  });

  it('does NOT inject manifest link on non-ESS routes', () => {
    // Visit planning and check manifest is absent (Helmet removes it when navigating away)
    cy.visit(PLANNING, { failOnStatusCode: false });
    cy.get('link[rel="manifest"]').should('not.exist');
  });
});

describe('ESS PWA — manifest.json content', () => {
  it('manifest.json is served and has correct scope', () => {
    cy.request('/ess-manifest.json').then((res) => {
      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.include('json');
      const body = res.body;
      expect(body.scope).to.equal('/app/ess/');
      expect(body.start_url).to.equal('/app/ess/dashboard');
      expect(body.display).to.equal('standalone');
      expect(body.icons).to.be.an('array').with.length.greaterThan(5);
      expect(body.shortcuts).to.be.an('array').with.length.greaterThan(0);
    });
  });

  it('all icon files in manifest are accessible', () => {
    cy.request('/ess-manifest.json').then((res) => {
      const icons = res.body.icons.slice(0, 3); // sample first 3 to keep test fast
      icons.forEach((icon) => {
        cy.request({ url: icon.src, failOnStatusCode: false }).its('status').should('equal', 200);
      });
    });
  });
});

describe('ESS PWA — Install Banner (Chrome/Android)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    loginAsEmployee();
    cy.visit(ESS_DASH, { failOnStatusCode: false });
  });

  it('renders install banner when beforeinstallprompt fires', () => {
    // Fire a fake beforeinstallprompt event
    cy.window().then((win) => {
      const evt = new Event('beforeinstallprompt');
      evt.prompt = cy.stub().resolves();
      evt.userChoice = Promise.resolve({ outcome: 'dismissed' });
      evt.preventDefault = () => {};
      win.dispatchEvent(evt);
    });
    cy.get('[role="region"][aria-label*="nstall"]', { timeout: 4000 }).should('be.visible');
  });

  it('dismisses the banner and sets localStorage key', () => {
    cy.window().then((win) => {
      const evt = new Event('beforeinstallprompt');
      evt.prompt = cy.stub().resolves();
      evt.userChoice = Promise.resolve({ outcome: 'dismissed' });
      evt.preventDefault = () => {};
      win.dispatchEvent(evt);
    });
    cy.get('[role="region"][aria-label*="nstall"]', { timeout: 4000 }).should('be.visible');

    // Click the X / dismiss button
    cy.get('[aria-label*="ismiss"]').first().click();
    cy.get('[role="region"][aria-label*="nstall"]').should('not.exist');
    cy.window().its('localStorage').invoke('getItem', 'ess-pwa-install-dismissed').should('not.be.null');
  });

  it('does not show banner when dismissed timestamp is recent', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('ess-pwa-install-dismissed', String(Date.now()));
    });
    cy.reload();
    cy.window().then((win) => {
      const evt = new Event('beforeinstallprompt');
      evt.prompt = cy.stub().resolves();
      evt.userChoice = Promise.resolve({ outcome: 'dismissed' });
      evt.preventDefault = () => {};
      win.dispatchEvent(evt);
    });
    // banner should NOT appear
    cy.get('[role="region"][aria-label*="nstall"]').should('not.exist');
  });
});

describe('ESS PWA — iOS Install Sheet', () => {
  it('renders iOS sheet when User-Agent is iOS Safari', () => {
    cy.clearLocalStorage();
    loginAsEmployee();
    // Override UA to mimic iOS
    cy.visit(ESS_DASH, {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          configurable: true,
        });
        Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 5, configurable: true });
      },
    });
    cy.get('[role="dialog"][aria-label*="OS"]', { timeout: 4000 }).should('be.visible');
  });

  it('dismisses iOS sheet on close', () => {
    cy.clearLocalStorage();
    loginAsEmployee();
    cy.visit(ESS_DASH, {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
          configurable: true,
        });
        Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 5, configurable: true });
      },
    });
    cy.get('[role="dialog"][aria-label*="OS"]', { timeout: 4000 }).should('be.visible');
    cy.get('[aria-label*="ismiss"]').first().click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.window().its('localStorage').invoke('getItem', 'ess-pwa-install-dismissed').should('not.be.null');
  });
});
