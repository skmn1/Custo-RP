import { apiFetch } from './config';

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
