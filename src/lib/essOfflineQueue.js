/**
 * essOfflineQueue — Task 59
 *
 * Custom IndexedDB-backed mutation queue for ESS offline write operations.
 *
 * Uses the `idb` library for a clean Promise-based IndexedDB API.
 *
 * DB name:    ess-offline-queue
 * Store name: pending-mutations
 *
 * Entry shape:
 *   id          — auto-increment key
 *   employeeId  — UUID; enforces per-employee isolation
 *   type        — 'profile-change-request'
 *   url         — relative API path, e.g. '/api/ess/profile/change-request'
 *   method      — 'POST' | 'PUT' | 'DELETE'
 *   body        — serialisable JS object (request body)
 *   headers     — plain object of additional request headers
 *   timestamp   — Date.now() at enqueue time
 *   status      — 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict'
 *   retryCount  — current retry attempt count
 *   maxRetries  — maximum attempts before marking 'failed'
 *   lastError   — human-readable error from the last attempt
 */

import { openDB } from 'idb';

const DB_NAME    = 'ess-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'pending-mutations';

/** Open (or reuse) the IndexedDB database. */
async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath:       'id',
          autoIncrement: true,
        });
        store.createIndex('by-status',    'status');
        store.createIndex('by-timestamp', 'timestamp');
        store.createIndex('by-employee',  'employeeId');
      }
    },
  });
}

// ─── Write operations ───────────────────────────────────────────────────────

/**
 * Add a mutation to the queue.
 *
 * @param {{ employeeId, type, url, method, body, headers?, maxRetries? }} mutation
 * @returns {Promise<number>} The auto-assigned record ID.
 */
export async function enqueueMutation(mutation) {
  const db = await getDb();
  return db.add(STORE_NAME, {
    employeeId:  mutation.employeeId,
    type:        mutation.type,
    url:         mutation.url,
    method:      mutation.method,
    body:        mutation.body ?? null,
    headers:     mutation.headers ?? { 'Content-Type': 'application/json' },
    timestamp:   Date.now(),
    status:      'pending',
    retryCount:  0,
    maxRetries:  mutation.maxRetries ?? 3,
    lastError:   null,
  });
}

// ─── Read operations ────────────────────────────────────────────────────────

/**
 * Return all pending mutations for an employee, ordered by timestamp (FIFO).
 */
export async function getPendingMutations(employeeId) {
  const db  = await getDb();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-employee', employeeId);
  return all
    .filter((m) => m.status === 'pending')
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Return ALL mutations for an employee regardless of status (for UI display).
 */
export async function getAllMutations(employeeId) {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-employee', employeeId);
  return all.sort((a, b) => a.timestamp - b.timestamp);
}

// ─── Replay ─────────────────────────────────────────────────────────────────

/**
 * Replay all pending mutations for an employee in FIFO order.
 *
 * Each mutation is processed sequentially (not parallel) to preserve ordering
 * and prevent race conditions.
 *
 * @param {string}   employeeId  — authenticated employee UUID
 * @param {function} getAuthToken — async function that returns a fresh JWT
 * @returns {Promise<Array<{ id, status }>>} per-mutation results
 */
export async function replayQueue(employeeId, getAuthToken) {
  const db      = await getDb();
  const pending = await getPendingMutations(employeeId);
  const results = [];

  for (const mutation of pending) {
    // ── Mark as syncing ──────────────────────────────────────
    {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.put({ ...mutation, status: 'syncing' });
      await tx.done;
    }

    try {
      const token = await getAuthToken();

      const response = await fetch(mutation.url, {
        method:  mutation.method,
        headers: {
          ...mutation.headers,
          Authorization: `Bearer ${token}`,
        },
        body: mutation.body ? JSON.stringify(mutation.body) : undefined,
      });

      if (response.ok || response.status === 204) {
        // ── Success ────────────────────────────────────────
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.objectStore(STORE_NAME).put({ ...mutation, status: 'synced' });
        await tx.done;
        results.push({ id: mutation.id, status: 'synced' });

      } else if (response.status === 409) {
        // ── Conflict — HR already processed this field ──────
        let errorDetail = 'A change for this field was already processed';
        try {
          const body = await response.json();
          errorDetail = body?.error?.message ?? errorDetail;
        } catch { /* ignore */ }

        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.objectStore(STORE_NAME).put({
          ...mutation,
          status:    'conflict',
          lastError: errorDetail,
        });
        await tx.done;
        results.push({ id: mutation.id, status: 'conflict' });

      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      const newRetryCount = mutation.retryCount + 1;
      const nextStatus    = newRetryCount >= mutation.maxRetries ? 'failed' : 'pending';

      const tx = db.transaction(STORE_NAME, 'readwrite');
      await tx.objectStore(STORE_NAME).put({
        ...mutation,
        retryCount: newRetryCount,
        lastError:  error.message,
        status:     nextStatus,
      });
      await tx.done;
      results.push({ id: mutation.id, status: nextStatus });
    }
  }

  return results;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

/**
 * Remove all 'synced' entries for an employee (called after successful replay).
 */
export async function clearSyncedMutations(employeeId) {
  const db  = await getDb();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-employee', employeeId);
  const tx  = db.transaction(STORE_NAME, 'readwrite');
  for (const entry of all.filter((m) => m.status === 'synced')) {
    await tx.objectStore(STORE_NAME).delete(entry.id);
  }
  await tx.done;
}

/**
 * Remove a single entry (used for "Discard" action on failed mutations).
 */
export async function discardMutation(id) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/**
 * Remove ALL entries for an employee (called on logout — Task 61).
 */
export async function clearAllMutations(employeeId) {
  const db  = await getDb();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-employee', employeeId);
  const tx  = db.transaction(STORE_NAME, 'readwrite');
  for (const entry of all) {
    await tx.objectStore(STORE_NAME).delete(entry.id);
  }
  await tx.done;
}

/**
 * Reset a mutation back to 'pending' (used by the "Retry" action on failed mutations).
 */
export async function retryMutation(id) {
  const db    = await getDb();
  const entry = await db.get(STORE_NAME, id);
  if (!entry) return;
  await db.put(STORE_NAME, {
    ...entry,
    status:     'pending',
    retryCount: 0,
    lastError:  null,
  });
}
