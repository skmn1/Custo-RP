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
