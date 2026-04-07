import { API_BASE_URL } from './config';
import i18n from '../i18n';

function getHeaders(includeAuth = false) {
  const lang = (i18n && i18n.language) ? i18n.language : 'fr';
  const acceptLanguage = lang.startsWith('fr')
    ? 'fr-FR,fr;q=0.9,en;q=0.8'
    : 'en-US,en;q=0.9,fr;q=0.8';

  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': acceptLanguage,
  };

  if (includeAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function authFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, options);

  if (res.status === 204) return null;

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
    err.body = data;
    err.code = data?.error?.code;
    throw err;
  }

  return data;
}

export async function loginApi(email, password) {
  return authFetch('/auth/login', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi({ email, password, firstName, lastName }) {
  return authFetch('/auth/register', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function refreshTokenApi(refreshToken) {
  return authFetch('/auth/refresh', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutApi(refreshToken) {
  const token = localStorage.getItem('accessToken');
  return authFetch('/auth/logout', {
    method: 'POST',
    headers: {
      ...getHeaders(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getMeApi() {
  return authFetch('/auth/me', {
    method: 'GET',
    headers: getHeaders(true),
  });
}

export async function updateProfileApi(firstName, lastName) {
  return authFetch('/auth/me', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ firstName, lastName }),
  });
}

export async function changePasswordApi(currentPassword, newPassword) {
  return authFetch('/auth/change-password', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
