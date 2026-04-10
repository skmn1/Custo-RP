/**
 * ess-push.cy.js — Task 60: Web Push Notifications (ESS)
 *
 * Tests cover:
 *  - VAPID public key endpoint
 *  - Push subscription CRUD
 *  - Permission prompt visibility gating (visit count + dismiss)
 *  - Blocked-state info card on preferences page
 *  - Notification preferences toggles
 */

describe('ESS Web Push Notifications', () => {
  // ─── Shared helpers ──────────────────────────────────────────────────────────

  const loginAsEmployee = () => {
    cy.session('ess-employee', () => {
      cy.visit('/');
      cy.get('[data-cy=username]').type('employee1');
      cy.get('[data-cy=password]').type('password');
      cy.get('[data-cy=login-btn]').click();
      cy.url().should('include', '/app/ess');
    });
  };

  beforeEach(() => {
    loginAsEmployee();
  });

  // ─── Backend API: VAPID key ───────────────────────────────────────────────────

  describe('GET /api/ess/push/vapid-key', () => {
    it('returns the VAPID public key for an authenticated employee', () => {
      cy.request({
        method: 'GET',
        url: '/api/ess/push/vapid-key',
        failOnStatusCode: false,
      }).then((res) => {
        // 200 when VAPID is configured, 503 when not configured in CI
        expect([200, 503]).to.include(res.status);
        if (res.status === 200) {
          expect(res.body.data).to.have.property('publicKey').that.is.a('string').and.not.be.empty;
        }
      });
    });

    it('returns 401 for unauthenticated requests', () => {
      cy.request({
        method: 'GET',
        url: '/api/ess/push/vapid-key',
        headers: { Authorization: '' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  // ─── Backend API: Subscribe ───────────────────────────────────────────────────

  describe('POST /api/ess/push/subscribe', () => {
    const makeSubscription = (suffix = '1') => ({
      endpoint: `https://fcm.googleapis.com/fcm/send/test-endpoint-${suffix}`,
      keys: {
        p256dh: 'BLFY7oTCiF2LGwtx9Ey3Wn7C8jqp6y2l8sMBVxFq0rCmk2N1kQpU0MzSfLcxhKGRx9Q0+uMXVuB2bDa0NWljgg=',
        auth: 'testAuthKey123456',
      },
    });

    it('stores a new push subscription and returns 201', () => {
      const sub = makeSubscription('cy-1');
      cy.request({
        method: 'POST',
        url: '/api/ess/push/subscribe',
        body: sub,
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.data).to.have.property('subscribed', true);
        expect(res.body.data).to.have.property('id').that.is.a('string');
      });
    });

    it('upserts (updates) an existing subscription with the same endpoint', () => {
      const sub = makeSubscription('cy-2');
      cy.request({ method: 'POST', url: '/api/ess/push/subscribe', body: sub });
      // Second call with same endpoint
      cy.request({ method: 'POST', url: '/api/ess/push/subscribe', body: sub }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.data.subscribed).to.eq(true);
      });
    });

    it('returns 400 when endpoint is missing', () => {
      cy.request({
        method: 'POST',
        url: '/api/ess/push/subscribe',
        body: { keys: { p256dh: 'a', auth: 'b' } },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  // ─── Backend API: Unsubscribe ─────────────────────────────────────────────────

  describe('DELETE /api/ess/push/subscribe', () => {
    it('soft-deletes (deactivates) a subscription and returns 204', () => {
      const endpoint = 'https://fcm.googleapis.com/fcm/send/test-delete-cy';
      // First subscribe
      cy.request({
        method: 'POST',
        url: '/api/ess/push/subscribe',
        body: {
          endpoint,
          keys: { p256dh: 'BLFY7oTCiF2LGwtx9Ey3Wn7C8jqp6y2l8sMBVxFq0rCmk2N1kQpU0MzSfLcxhKGRx9Q0+uMXVuB2bDa0NWljgg=', auth: 'authKy' },
        },
        failOnStatusCode: false,
      });
      // Then unsubscribe
      cy.request({
        method: 'DELETE',
        url: '/api/ess/push/subscribe',
        body: { endpoint },
        failOnStatusCode: false,
      }).then((res) => {
        expect([204, 404]).to.include(res.status);
      });
    });
  });

  // ─── Frontend: Permission Prompt ──────────────────────────────────────────────

  describe('EssPushPermissionPrompt', () => {
    it('does NOT show prompt when visit count is below 3', () => {
      cy.visit('/app/ess', {
        onBeforeLoad(win) {
          win.localStorage.setItem('ess-visit-count', '1');
          // Notification.permission === 'default' (stub)
          Object.defineProperty(win.Notification, 'permission', { value: 'default', configurable: true });
        },
      });
      cy.get('[data-testid=ess-push-permission-prompt]').should('not.exist');
    });

    it('shows prompt when visit count is >= 3 and permission is default and not dismissed', () => {
      cy.visit('/app/ess', {
        onBeforeLoad(win) {
          win.localStorage.setItem('ess-visit-count', '3');
          win.localStorage.removeItem('ess-push-dismissed');
          Object.defineProperty(win.Notification, 'permission', { value: 'default', configurable: true });
        },
      });
      cy.get('[data-testid=ess-push-permission-prompt]', { timeout: 6000 }).should('be.visible');
    });

    it('sets ess-push-dismissed localStorage key when dismiss button is clicked', () => {
      cy.visit('/app/ess', {
        onBeforeLoad(win) {
          win.localStorage.setItem('ess-visit-count', '5');
          win.localStorage.removeItem('ess-push-dismissed');
          Object.defineProperty(win.Notification, 'permission', { value: 'default', configurable: true });
        },
      });
      cy.get('[data-testid=ess-push-dismiss-btn]', { timeout: 6000 }).click();
      cy.window().then((win) => {
        expect(win.localStorage.getItem('ess-push-dismissed')).to.not.be.null;
      });
      cy.get('[data-testid=ess-push-permission-prompt]').should('not.exist');
    });

    it('does NOT show prompt when dismissed within 14 days', () => {
      const recentDismiss = Date.now() - 5 * 24 * 60 * 60 * 1000; // 5 days ago
      cy.visit('/app/ess', {
        onBeforeLoad(win) {
          win.localStorage.setItem('ess-visit-count', '10');
          win.localStorage.setItem('ess-push-dismissed', String(recentDismiss));
          Object.defineProperty(win.Notification, 'permission', { value: 'default', configurable: true });
        },
      });
      cy.get('[data-testid=ess-push-permission-prompt]').should('not.exist');
    });

    it('does NOT show prompt when Notification.permission is already granted', () => {
      cy.visit('/app/ess', {
        onBeforeLoad(win) {
          win.localStorage.setItem('ess-visit-count', '5');
          Object.defineProperty(win.Notification, 'permission', { value: 'granted', configurable: true });
        },
      });
      cy.get('[data-testid=ess-push-permission-prompt]').should('not.exist');
    });
  });

  // ─── Frontend: Notification Preferences ──────────────────────────────────────

  describe('Notification Preferences (EssNotificationsPage)', () => {
    it('shows blocked info card when Notification.permission is denied', () => {
      cy.visit('/app/ess/notifications', {
        onBeforeLoad(win) {
          Object.defineProperty(win.Notification, 'permission', { value: 'denied', configurable: true });
        },
      });
      cy.get('[data-cy=push-blocked-banner]', { timeout: 6000 }).should('be.visible');
      // No push toggle buttons should appear
      cy.get('[data-cy^=pref-push-]').should('not.exist');
    });

    it('shows preference toggles when Notification.permission is granted', () => {
      cy.visit('/app/ess/notifications', {
        onBeforeLoad(win) {
          Object.defineProperty(win.Notification, 'permission', { value: 'granted', configurable: true });
        },
      });
      cy.get('[data-cy=notification-preferences]', { timeout: 6000 }).should('be.visible');
      // At least one category row
      cy.get('[data-cy=pref-row-payslip]').should('exist');
      cy.get('[data-cy=pref-push-payslip]').should('exist');
      cy.get('[data-cy=pref-inapp-payslip]').should('exist');
    });

    it('PUT /api/ess/notifications/preferences/{category} — updates a preference', () => {
      cy.request({
        method: 'PUT',
        url: '/api/ess/notifications/preferences/payslip',
        body: { pushEnabled: false },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
      });
      // Reset
      cy.request({
        method: 'PUT',
        url: '/api/ess/notifications/preferences/payslip',
        body: { pushEnabled: true },
        failOnStatusCode: false,
      });
    });

    it('validates unknown category returns 400', () => {
      cy.request({
        method: 'PUT',
        url: '/api/ess/notifications/preferences/unknown_cat',
        body: { pushEnabled: false },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });
});
