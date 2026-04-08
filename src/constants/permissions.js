/**
 * Centralized role-permission matrix for Staff Scheduler Pro.
 * 7-role RBAC model — see constants/roles.js for canonical names.
 *
 * Each role maps to a list of permission strings.
 * Use the `can(role, permission)` helper to check access.
 */

import { normaliseRole } from './roles';

export const PERMISSIONS = {
  super_admin: [
    'dashboard:view',
    'schedule:view-all', 'schedule:view-own', 'schedule:create', 'schedule:edit', 'schedule:delete',
    'employees:view-all', 'employees:view-own', 'employees:create', 'employees:edit', 'employees:edit-own', 'employees:delete',
    'payroll:view-all', 'payroll:view-own', 'payroll:export', 'payroll:modify-rates',
    'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:approve', 'invoices:export',
    'stock:view', 'stock:create', 'stock:edit', 'stock:delete',
    'pos:view', 'pos:create', 'pos:edit', 'pos:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'settings:view', 'settings:edit',
  ],
  hr_manager: [
    'dashboard:view',
    'schedule:view-all', 'schedule:view-own', 'schedule:create', 'schedule:edit', 'schedule:delete',
    'employees:view-all', 'employees:view-own', 'employees:create', 'employees:edit', 'employees:edit-own',
    'payroll:view-all', 'payroll:view-own', 'payroll:export',
    'invoices:view',
    'settings:view',
  ],
  planner: [
    'dashboard:view',
    'schedule:view-all', 'schedule:view-own', 'schedule:create', 'schedule:edit', 'schedule:delete',
    'employees:view-all', 'employees:view-own',
    'settings:view',
  ],
  accounting_agent: [
    'dashboard:view',
    'employees:view-all', 'employees:view-own',
    'payroll:view-all', 'payroll:view-own', 'payroll:export', 'payroll:modify-rates',
    'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:approve', 'invoices:export',
    'settings:view',
  ],
  stock_manager: [
    'dashboard:view',
    'stock:view', 'stock:create', 'stock:edit', 'stock:delete',
    'pos:view',
    'settings:view',
  ],
  pos_manager: [
    'dashboard:view',
    'invoices:view', 'invoices:create', 'invoices:edit',
    'stock:view',
    'pos:view', 'pos:create', 'pos:edit', 'pos:delete',
    'settings:view',
  ],
  employee: [
    'dashboard:view',
    'schedule:view-own',
    'employees:view-own', 'employees:edit-own',
    'payroll:view-own',
    'settings:view',
  ],
};

/**
 * Check if a role has a specific permission.
 * @param {string} role - User role (normalised automatically)
 * @param {string} permission - Permission string (e.g., 'employees:create')
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perms = PERMISSIONS[normaliseRole(role)];
  return perms ? perms.includes(permission) : false;
}

/**
 * Check if a role has ANY of the given permissions.
 */
export function hasAnyPermission(role, ...permissions) {
  return permissions.some((p) => hasPermission(role, p));
}
