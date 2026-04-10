/**
 * essLogoutCleanup — Task 61: ESS PWA Security & Data Hygiene
 *
 * Performs a full security wipe of all ESS PWA storage on logout:
 *  1. Deletes all ess-api-* cache buckets (employee-specific data)
 *  2. Clears the IndexedDB offline queue for the logging-out employee
 *  3. Unsubscribes from push notifications (soft-delete on server)
 *  4. Removes ESS-specific localStorage entries
 *  5. Sends ESS_CLEAR_EMPLOYEE message to the service worker
 *
 * IMPORTANT: Call this BEFORE clearAuthTokens() so that the push unsubscribe
 * API call still has a valid auth token.
 *
 * ess-precache is intentionally NOT cleared — it contains only static build
 * assets (HTML, CSS, JS, fonts, icons) and is not employee-specific.
 */

import { clearAllMutations } from './essOfflineQueue';
import { unsubscribeFromPush } from './essPushSubscription';

/** ESS localStorage keys that are per-employee and must be cleared on logout. */
const ESS_LOCAL_STORAGE_KEYS = [
  'ess-pwa-install-dismissed',
  'ess-pwa-installed',
  'ess-push-dismissed',
  'ess-visit-count',
];

/**
 * Wipe all ESS PWA storage for the given employee, then clear the SW context.
 *
 * @param {string|null} employeeId — the employee's ID (UUID or short code).
 *   Pass null when the employee ID is not available; IndexedDB wipe is skipped.
 */
export async function essLogoutCleanup(employeeId) {
  await Promise.allSettled([
    _wipeCaches(),
    _wipeIndexedDb(employeeId),
    _wipePushSubscription(),
  ]);

  _wipeLocalStorage();
  _notifyServiceWorker();
}

// ─── Step 1: Wipe ess-api-* runtime caches ─────────────────────────────────

async function _wipeCaches() {
  if (!('caches' in globalThis)) return;
  try {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('ess-api-') || n === 'ess-i18n' || n === 'ess-images')
        .map((n) => caches.delete(n))
    );
  } catch {
    // Non-fatal — the SW will also purge on receiving ESS_CLEAR_EMPLOYEE
  }
}

// ─── Step 2: Clear employee's IndexedDB mutation queue ─────────────────────

async function _wipeIndexedDb(employeeId) {
  if (!employeeId) return;
  try {
    await clearAllMutations(employeeId);
  } catch {
    // Non-fatal
  }
}

// ─── Step 3: Unsubscribe from push notifications ────────────────────────────

async function _wipePushSubscription() {
  try {
    await unsubscribeFromPush();
  } catch {
    // Non-fatal — user may already be logged out on the server
  }
}

// ─── Step 4: Clear ESS localStorage entries ─────────────────────────────────

function _wipeLocalStorage() {
  ESS_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

// ─── Step 5: Notify service worker to clear employee context + purge caches ─

function _notifyServiceWorker() {
  try {
    navigator.serviceWorker?.controller?.postMessage({
      type: 'ESS_CLEAR_EMPLOYEE',
    });
  } catch {
    // Non-fatal — SW may not be registered (e.g. non-HTTPS environment)
  }
}
