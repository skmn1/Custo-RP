/**
 * API configuration and fetch utility for Staff Scheduler Pro.
 *
 * In development the Vite dev-server runs on :5173 while the
 * Spring Boot backend runs on :8080.  The Vite proxy in
 * vite.config.js forwards /api/* calls so you can use relative
 * paths.  If the proxy is not configured, set API_BASE_URL to
 * the full backend origin.
 */

import i18n from '../i18n';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const lang = (i18n && i18n.language) ? i18n.language : 'fr';
  const acceptLanguage = lang.startsWith('fr') ? 'fr-FR,fr;q=0.9,en;q=0.8' : 'en-US,en;q=0.9,fr;q=0.8';

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': acceptLanguage },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error('Refresh failed');

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}

/**
 * Thin wrapper around `fetch` that:
 *  - prepends the base URL
 *  - sets Content-Type for JSON bodies
 *  - attaches Authorization header when a token exists
 *  - auto-refreshes on 401
 *  - parses JSON responses
 *  - throws a structured error on non-2xx
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const lang = (i18n && i18n.language) ? i18n.language : 'fr';
  const acceptLanguage = lang.startsWith('fr') ? 'fr-FR,fr;q=0.9,en;q=0.8' : 'en-US,en;q=0.9,fr;q=0.8';

  const accessToken = localStorage.getItem('accessToken');

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    'Accept-Language': acceptLanguage,
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  let res = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && accessToken && !path.startsWith('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await tryRefreshToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);
        // Retry the original request with new token
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        };
        res = await fetch(url, { ...options, headers: retryHeaders });
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    } else {
      // Another request is already refreshing — queue this one
      const newToken = await new Promise((resolve) => {
        addRefreshSubscriber(resolve);
      });
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`,
      };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

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
      data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.code = data?.error?.code || null;
    err.body = data;
    err.retryAfter = res.headers.get('Retry-After') ? parseInt(res.headers.get('Retry-After'), 10) : null;
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
