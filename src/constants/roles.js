/**
 * Canonical role constants for the 7-role RBAC model.
 * Mirror of backend RoleConstants.java — keep in sync.
 */

export const ROLES = {
  SUPER_ADMIN:      'super_admin',
  HR_MANAGER:       'hr_manager',
  PLANNER:          'planner',
  ACCOUNTING_AGENT: 'accounting_agent',
  STOCK_MANAGER:    'stock_manager',
  POS_MANAGER:      'pos_manager',
  EMPLOYEE:         'employee',
};

/** Ordered list of all valid roles (for dropdowns, admin UI). */
export const ALL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_MANAGER,
  ROLES.PLANNER,
  ROLES.ACCOUNTING_AGENT,
  ROLES.STOCK_MANAGER,
  ROLES.POS_MANAGER,
  ROLES.EMPLOYEE,
];

/** Legacy alias map for backward-compatible role normalisation. */
const ROLE_ALIASES = {
  admin:   ROLES.SUPER_ADMIN,
  manager: ROLES.HR_MANAGER,
  viewer:  ROLES.EMPLOYEE,
};

/**
 * Normalise a role string to its canonical form.
 * Handles legacy aliases (admin → super_admin, etc.).
 */
export function normaliseRole(role) {
  if (!role) return ROLES.EMPLOYEE;
  const key = role.trim().toLowerCase();
  if (ALL_ROLES.includes(key)) return key;
  return ROLE_ALIASES[key] || key;
}
