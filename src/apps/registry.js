/**
 * Central client-side app registry.
 * Each entry describes one ERP sub-application.
 *
 * icon  — Heroicons 24/outline component name (resolved at render time)
 * color — Tailwind color token used for theming (--app-color)
 * roles — roles that may access this app
 */
export const APPS = [
  {
    id: 'planning',
    name: 'planning',
    icon: 'CalendarDaysIcon',
    color: 'blue',
    route: '/app/planning',
    roles: ['super_admin', 'hr_manager', 'planner', 'employee', 'admin', 'manager'],
  },
  {
    id: 'hr',
    name: 'hr',
    icon: 'UsersIcon',
    color: 'green',
    route: '/app/hr',
    roles: ['super_admin', 'hr_manager', 'admin', 'manager'],
  },
  {
    id: 'payroll',
    name: 'payroll',
    icon: 'BanknotesIcon',
    color: 'violet',
    route: '/app/payroll',
    roles: ['super_admin', 'hr_manager', 'admin', 'manager'],
  },
  {
    id: 'accounting',
    name: 'accounting',
    icon: 'ReceiptPercentIcon',
    color: 'amber',
    route: '/app/accounting',
    roles: ['super_admin', 'accounting_agent', 'admin', 'manager'],
  },
  {
    id: 'stock',
    name: 'stock',
    icon: 'ArchiveBoxIcon',
    color: 'orange',
    route: '/app/stock',
    roles: ['super_admin', 'stock_manager', 'pos_manager', 'admin', 'manager'],
  },
  {
    id: 'pos',
    name: 'pos',
    icon: 'ShoppingCartIcon',
    color: 'teal',
    route: '/app/pos',
    roles: ['super_admin', 'pos_manager', 'admin', 'manager'],
  },
  {
    id: 'admin',
    name: 'admin',
    icon: 'Cog8ToothIcon',
    color: 'slate',
    route: '/app/admin',
    roles: ['super_admin', 'admin'],
  },
];

/**
 * Returns apps accessible by the given role.
 */
export function getAccessibleApps(userRole) {
  if (!userRole) return [];
  return APPS.filter((app) => app.roles.includes(userRole));
}

/**
 * Find an app entry by its id.
 */
export function getAppById(appId) {
  return APPS.find((app) => app.id === appId) || null;
}
