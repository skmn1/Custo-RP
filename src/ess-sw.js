/**
 * ESS Service Worker — Task 57
 *
 * Scoped to /app/ess/ via registration in EssLayout.
 * Handles:
 *  - Precaching (app shell injected by vite-plugin-pwa at build time)
 *  - Runtime caching for every ESS API namespace
 *  - Network-only enforcement for auth / write / notification endpoints
 *  - Skip-waiting on SKIP_WAITING message (update flow from EssUpdateBanner)
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// ─── Precache (injected by vite-plugin-pwa at build time) ──────────────────
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ─── Cache bucket names ─────────────────────────────────────────────────────
const CACHE_NAMES = [
  'ess-precache',
  'ess-api-dashboard',
  'ess-api-schedule',
  'ess-api-payslips',
  'ess-api-attendance',
  'ess-api-profile',
  'ess-i18n',
  'ess-images',
];

// ─── Security: never cache responses that set cookies ─────────────────────
const noSetCookiePlugin = {
  cacheWillUpdate: async ({ response }) => {
    if (response && response.headers.has('set-cookie')) {
      return null; // Do not cache
    }
    return response;
  },
};

// ─── Cache-hit header plugin (Task 58) ─────────────────────────────────────
// Adds `x-sw-cache-hit: true` to responses served from cache so the React UI
// can detect them and show a StaleDataIndicator / data-freshness timestamp.
const cacheHitPlugin = {
  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
    if (!cachedResponse) return cachedResponse;
    const headers = new Headers(cachedResponse.headers);
    headers.set('x-sw-cache-hit', 'true');
    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    });
  },
};

// ─── Security: block auth endpoints entirely ───────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth'),
  new NetworkOnly()
);

// ─── Security: block notification endpoints (always fresh) ─────────────────
// NOTE: Read GETs are blocked via NetworkOnly for security.
// Write operations (PUT/DELETE) are handled below with BackgroundSyncPlugin.
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/ess/notifications') &&
    request.method === 'GET',
  new NetworkOnly()
);

// ─── Background sync: notification writes (PUT/DELETE) ─────────────────────
// Queues notification mark-as-read and delete operations made while offline.
// The Workbox BackgroundSyncPlugin retries them automatically via the
// Background Sync API when connectivity is restored.
const notificationSyncPlugin = new BackgroundSyncPlugin('ess-notification-sync', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  async onSync({ queue }) {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error; // retry later
      }
    }
    // Notify all clients that notification sync completed
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'ESS_SYNC_COMPLETE', queue: 'notifications' });
    }
  },
});

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/ess/notifications') &&
    ['PUT', 'DELETE'].includes(request.method),
  new NetworkOnly({ plugins: [notificationSyncPlugin] }),
  'PUT'
);

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/ess/notifications') &&
    request.method === 'DELETE',
  new NetworkOnly({ plugins: [notificationSyncPlugin] }),
  'DELETE'
);

// ─── Background sync: profile change-request cancellation (DELETE) ──────────
const profileCancelSyncPlugin = new BackgroundSyncPlugin('ess-profile-cancel-sync', {
  maxRetentionTime: 24 * 60,
  async onSync({ queue }) {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'ESS_SYNC_COMPLETE', queue: 'profile-cancel' });
    }
  },
});

registerRoute(
  ({ url, request }) =>
    /\/api\/ess\/profile\/change-requests\//.test(url.pathname) &&
    request.method === 'DELETE',
  new NetworkOnly({ plugins: [profileCancelSyncPlugin] }),
  'DELETE'
);

// ─── Security: block push + sync endpoints ────────────────────────────────
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/ess/push') ||
    url.pathname.startsWith('/api/ess/sync'),
  new NetworkOnly()
);

// ─── Security: block payslip PDF download stream ──────────────────────────
registerRoute(
  ({ url }) => url.pathname.includes('/download'),
  new NetworkOnly()
);

// ─── ESS Dashboard ──────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname === '/api/ess/dashboard',
  new NetworkFirst({
    cacheName: 'ess-api-dashboard',
    networkTimeoutSeconds: 3,
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── ESS Schedule ───────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/ess/schedule'),
  new NetworkFirst({
    cacheName: 'ess-api-schedule',
    networkTimeoutSeconds: 3,
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── ESS Payslips (read — excludes /download, blocked above) ───────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/ess/payslips'),
  new NetworkFirst({
    cacheName: 'ess-api-payslips',
    networkTimeoutSeconds: 3,
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 2 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── ESS Attendance ─────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/ess/attendance'),
  new NetworkFirst({
    cacheName: 'ess-api-attendance',
    networkTimeoutSeconds: 3,
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── ESS Profile (long TTL — changes rarely) ────────────────────────────────
registerRoute(
  ({ url }) => url.pathname === '/api/ess/profile',
  new NetworkFirst({
    cacheName: 'ess-api-profile',
    networkTimeoutSeconds: 3,
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── i18n locale files (ESS namespace) ──────────────────────────────────────
registerRoute(
  ({ url }) => /\/locales\/.+\/ess\.json$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'ess-i18n',
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── Images (profile photos, icon assets) ───────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'ess-images',
    plugins: [
      noSetCookiePlugin,
      cacheHitPlugin,
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ─── Navigation: SPA shell fallback for /app/ess/* ──────────────────────────
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'ess-precache',
      networkTimeoutSeconds: 3,
      plugins: [
        noSetCookiePlugin,
        new CacheableResponsePlugin({ statuses: [200] }),
      ],
    }),
    {
      allowlist: [/^\/app\/ess\//],
      denylist: [/^\/api\//, /^\/locales\//],
    }
  )
);

// ─── Activate: clean up any orphaned ess-* caches ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (name) => name.startsWith('ess-') && !CACHE_NAMES.includes(name)
          )
          .map((name) => caches.delete(name))
      )
    )
  );
});

// ─── Message: allow EssUpdateBanner to trigger skipWaiting ──────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
