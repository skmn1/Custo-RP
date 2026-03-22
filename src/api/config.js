/**
 * API configuration and fetch utility for Staff Scheduler Pro.
 *
 * In development the Vite dev-server runs on :5173 while the
 * Spring Boot backend runs on :8080.  The Vite proxy in
 * vite.config.js forwards /api/* calls so you can use relative
 * paths.  If the proxy is not configured, set API_BASE_URL to
 * the full backend origin.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Thin wrapper around `fetch` that:
 *  - prepends the base URL
 *  - sets Content-Type for JSON bodies
 *  - parses JSON responses
 *  - throws a structured error on non-2xx
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  // 204 No Content — nothing to parse
  if (res.status === 204) return null;

  // Try to read JSON body (may be error payload)
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

/** Convenience helpers */
export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};
