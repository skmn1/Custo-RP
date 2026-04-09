import { apiFetch } from './config';

// ── User Management ──────────────────────────────────────────────

export function fetchUsers() {
  return apiFetch('/admin/users');
}

export function fetchUser(id) {
  return apiFetch(`/admin/users/${id}`);
}

export function createUser(data) {
  return apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUser(id, data) {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function updateUserRole(id, role) {
  return apiFetch(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export function deactivateUser(id) {
  return apiFetch(`/admin/users/${id}/deactivate`, {
    method: 'PUT',
  });
}

export function activateUser(id) {
  return apiFetch(`/admin/users/${id}/activate`, {
    method: 'PUT',
  });
}

export function deleteUser(id) {
  return apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export function fetchRoles() {
  return apiFetch('/admin/users/roles');
}

export function fetchPosAssignments(userId) {
  return apiFetch(`/admin/users/${userId}/pos-assignments`);
}

export function assignTerminal(userId, posTerminalId) {
  return apiFetch(`/admin/users/${userId}/pos-assignments`, {
    method: 'POST',
    body: JSON.stringify({ posTerminalId }),
  });
}

export function removeTerminalAssignment(userId, terminalId) {
  return apiFetch(`/admin/users/${userId}/pos-assignments/${terminalId}`, {
    method: 'DELETE',
  });
}

// ── Suspend / Unsuspend ──────────────────────────────────────────

export function suspendUser(id) {
  return apiFetch(`/admin/users/${id}/suspend`, { method: 'PUT' });
}

export function unsuspendUser(id) {
  return apiFetch(`/admin/users/${id}/unsuspend`, { method: 'PUT' });
}

export function resetUserPassword(id) {
  return apiFetch(`/admin/users/${id}/reset-password`, { method: 'POST' });
}

// ── Invitations ──────────────────────────────────────────────────

export function fetchInvitations() {
  return apiFetch('/admin/invitations');
}

export function createInvitation(data) {
  return apiFetch('/admin/invitations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function rescindInvitation(id) {
  return apiFetch(`/admin/invitations/${id}`, { method: 'DELETE' });
}

// ── Dashboard KPIs & Activity Feed ──────────────────────────────

export function fetchDashboardKpis() {
  return apiFetch('/admin/dashboard-kpis');
}

export function fetchActivityFeed(limit = 20, app = null) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (app) params.set('app', app);
  return apiFetch(`/admin/activity-feed?${params}`);
}

// ── App Access Matrix ────────────────────────────────────────────

export function fetchAppAccessMatrix() {
  return apiFetch('/admin/app-access');
}

export function updateAppAccessMatrix(matrix) {
  return apiFetch('/admin/app-access', {
    method: 'PUT',
    body: JSON.stringify(matrix),
  });
}

// ── PoS Terminal Management ──────────────────────────────────────

export function fetchAdminPosTerminals() {
  return apiFetch('/admin/pos-terminals');
}

export function createPosTerminal(data) {
  return apiFetch('/admin/pos-terminals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePosTerminal(id, data) {
  return apiFetch(`/admin/pos-terminals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deactivatePosTerminal(id) {
  return apiFetch(`/admin/pos-terminals/${id}`, { method: 'DELETE' });
}

// ── Audit Log ────────────────────────────────────────────────────

export function fetchAuditLog(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
  });
  const qs = searchParams.toString();
  return apiFetch(`/admin/audit-log${qs ? '?' + qs : ''}`);
}

export function exportAuditLog(params = {}, format = 'csv') {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
  });
  searchParams.set('format', format);
  return apiFetch(`/admin/audit-log/export?${searchParams}`);
}

// ── System Health ────────────────────────────────────────────────

export function fetchSystemHealth() {
  return apiFetch('/admin/system-health');
}
