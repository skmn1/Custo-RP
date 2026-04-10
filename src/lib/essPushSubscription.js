/**
 * essPushSubscription — Task 60
 *
 * Handles browser push subscription setup and teardown.
 * Fetches the VAPID public key from the backend and registers/unregisters
 * the browser via the Push API.
 */

import { api, apiFetch } from '../api/config';

// ─── URL-base64 → Uint8Array ────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ─── Simple helper for remembering dismissed-prompt timestamp ───────────────

export function isDismissedRecently(key, days) {
  const stored = localStorage.getItem(key);
  if (!stored) return false;
  const dismissedAt = parseInt(stored, 10);
  if (Number.isNaN(dismissedAt)) return false;
  const msThreshold = days * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt < msThreshold;
}

// ─── Subscribe ───────────────────────────────────────────────────────────────

/**
 * Subscribe the current browser to push notifications.
 *  1. Fetches the VAPID public key from GET /api/ess/push/vapid-key
 *  2. Calls PushManager.subscribe()
 *  3. Registers the subscription with POST /api/ess/push/subscribe
 *
 * @throws {Error} if the browser PushManager is unavailable or the request fails
 */
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported by this browser.');
  }

  const registration = await navigator.serviceWorker.ready;

  // Fetch VAPID public key from backend (avoids hard-coding in frontend build)
  let vapidPublicKey;

  // First try the env variable (faster, avoids round-trip in prod)
  const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (envKey) {
    vapidPublicKey = envKey;
  } else {
    const resp = await apiFetch('/ess/push/vapid-key');
    vapidPublicKey = resp?.data?.publicKey;
  }

  if (!vapidPublicKey) {
    throw new Error('VAPID public key not available — push is not configured on this server.');
  }

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Send subscription to backend
  const subJson = subscription.toJSON();
  await api.post('/ess/push/subscribe', {
    endpoint: subJson.endpoint,
    keys: {
      p256dh: subJson.keys.p256dh,
      auth:   subJson.keys.auth,
    },
  });

  return subscription;
}

// ─── Unsubscribe ─────────────────────────────────────────────────────────────

/**
 * Unsubscribe the current browser from push notifications.
 *  1. Calls DELETE /api/ess/push/subscribe on the backend
 *  2. Calls PushSubscription.unsubscribe() on the browser
 */
export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    try {
      // Notify backend first (soft-delete)
      await apiFetch('/ess/push/subscribe', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    } catch {
      // Best-effort — still unsubscribe locally
    }
    await subscription.unsubscribe();
  }
}

// ─── Get current subscription state ─────────────────────────────────────────

/**
 * Returns the current push subscription, or null if none.
 */
export async function getCurrentPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}
