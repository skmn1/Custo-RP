/**
 * Centralized role-permission matrix for Staff Scheduler Pro.
 *
 * Each role maps to a list of permission strings.
 * Use the `can(role, permission)` helper to check access.
 */

export const PERMISSIONS = {
  admin: [
    'dashboard:view',
    'schedule:view-all', 'schedule:view-own', 'schedule:create', 'schedule:edit', 'schedule:delete',
    'employees:view-all', 'employees:view-own', 'employees:create', 'employees:edit', 'employees:edit-own', 'employees:delete',
    'payroll:view-all', 'payroll:view-own', 'payroll:export', 'payroll:modify-rates',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'settings:view', 'settings:edit',
  ],
  manager: [
    'dashboard:view',
    'schedule:view-all', 'schedule:view-own', 'schedule:create', 'schedule:edit', 'schedule:delete',
    'employees:view-all', 'employees:view-own', 'employees:create', 'employees:edit', 'employees:edit-own',
    'payroll:view-all', 'payroll:view-own', 'payroll:export',
    'settings:view',
  ],
  employee: [
    'dashboard:view',
    'schedule:view-own',
    'employees:view-own', 'employees:edit-own',
    'payroll:view-own',
    'settings:view',
  ],
  viewer: [
    'dashboard:view',
    'schedule:view-all', 'schedule:view-own',
    'employees:view-all', 'employees:view-own',
    'settings:view',
  ],
};

/**
 * Check if a role has a specific permission.
 * @param {string} role - User role (admin, manager, employee, viewer)
 * @param {string} permission - Permission string (e.g., 'employees:create')
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perms = PERMISSIONS[role.toLowerCase()];
  return perms ? perms.includes(permission) : false;
}

/**
 * Check if a role has ANY of the given permissions.
 */
export function hasAnyPermission(role, ...permissions) {
  return permissions.some((p) => hasPermission(role, p));
}
