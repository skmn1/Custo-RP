/**
 * ESS Service Worker registration utility — Task 57
 *
 * Registers /ess-sw.js scoped to /app/ess/ and exposes an update-notification
 * mechanism via the custom `ess-sw-update-available` window event.
 *
 * Called from EssLayout.jsx inside a useEffect hook.
 * Returns the ServiceWorkerRegistration (or undefined when unsupported).
 */

let registrationPromise = null;

/**
 * Register the ESS service worker.
 * Idempotent — returns the same promise on repeated calls.
 * @returns {Promise<ServiceWorkerRegistration | undefined>}
 */
export async function registerEssServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return undefined;
  }

  // In development, the SW file may not exist or have the wrong MIME type.
  // Skip registration to avoid noisy console errors.
  if (import.meta.env.DEV) {
    return undefined;
  }

  // Deduplicate simultaneous calls (e.g. React StrictMode double-invoke)
  if (registrationPromise) {
    return registrationPromise;
  }

  registrationPromise = (async () => {
    try {
      const registration = await navigator.serviceWorker.register('/ess-sw.js', {
        scope: '/app/ess/',
        type: 'classic',
      });

      // ── Detect a newly installed (waiting) worker ──────────────────────
      const listenForWaiting = (sw) => {
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            // A new SW is waiting — notify the UI
            window.dispatchEvent(
              new CustomEvent('ess-sw-update-available', { detail: { registration } })
            );
          }
        });
      };

      // Check current installing worker (race condition on first load)
      if (registration.installing) {
        listenForWaiting(registration.installing);
      }

      // Watch for future updates
      registration.addEventListener('updatefound', () => {
        listenForWaiting(registration.installing);
      });

      // Reload all ESS tabs once the new SW takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      return registration;
    } catch (err) {
      // Registration errors are non-fatal — the app works without a SW
      console.error('[ESS SW] Registration failed:', err);
      registrationPromise = null; // allow retry
      return undefined;
    }
  })();

  return registrationPromise;
}

/**
 * Retrieve the current ESS SW registration (if any).
 * Useful for EssUpdateBanner to call registration.waiting.postMessage().
 * @returns {Promise<ServiceWorkerRegistration | undefined>}
 */
export async function getEssServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return undefined;
  try {
    return await navigator.serviceWorker.getRegistration('/app/ess/');
  } catch {
    return undefined;
  }
}
