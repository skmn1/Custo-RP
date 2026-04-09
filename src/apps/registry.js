/**
 * Central client-side app registry.
 * Each entry describes one ERP sub-application.
 *
 * icon  — Heroicons 24/outline component name (resolved at render time)
 * color — Tailwind color token used for theming (--app-color)
 * roles — canonical roles that may access this app
 */

import { normaliseRole } from '../constants/roles';

export const APPS = [
  {
    id: 'planning',
    name: 'planning',
    icon: 'CalendarDaysIcon',
    color: 'blue',
    route: '/app/planning',
    roles: ['super_admin', 'hr_manager', 'planner'],
  },
  {
    id: 'hr',
    name: 'hr',
    icon: 'UsersIcon',
    color: 'green',
    route: '/app/hr',
    roles: ['super_admin', 'hr_manager', 'planner', 'accounting_agent'],
  },
  {
    id: 'payroll',
    name: 'payroll',
    icon: 'BanknotesIcon',
    color: 'violet',
    route: '/app/payroll',
    roles: ['super_admin', 'hr_manager'],
  },
  {
    id: 'accounting',
    name: 'accounting',
    icon: 'ReceiptPercentIcon',
    color: 'amber',
    route: '/app/accounting',
    roles: ['super_admin', 'accounting_agent'],
  },
  {
    id: 'stock',
    name: 'stock',
    icon: 'ArchiveBoxIcon',
    color: 'orange',
    route: '/app/stock',
    roles: ['super_admin', 'stock_manager', 'pos_manager'],
  },
  {
    id: 'pos',
    name: 'pos',
    icon: 'ShoppingCartIcon',
    color: 'teal',
    route: '/app/pos',
    roles: ['super_admin', 'pos_manager'],
  },
  {
    id: 'admin',
    name: 'admin',
    icon: 'Cog8ToothIcon',
    color: 'slate',
    route: '/app/admin',
    roles: ['super_admin'],
  },
  {
    id: 'ess',
    name: 'ess',
    icon: 'UserCircleIcon',
    color: 'indigo',
    route: '/app/ess',
    roles: ['super_admin', 'hr_manager', 'employee'],
  },
];

/**
 * Returns apps accessible by the given role.
 * Normalises the role before comparison.
 */
export function getAccessibleApps(userRole) {
  if (!userRole) return [];
  const role = normaliseRole(userRole);
  return APPS.filter((app) => app.roles.includes(role));
}

/**
 * Find an app entry by its id.
 */
export function getAppById(appId) {
  return APPS.find((app) => app.id === appId) || null;
}
