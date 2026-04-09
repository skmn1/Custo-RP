/**
 * Admin app sidebar navigation items.
 * All items restricted to super_admin role.
 */
export const adminSidebarItems = [
  { label: 'admin:nav.dashboard',    icon: 'HomeIcon',                   to: '/app/admin/dashboard' },
  { label: 'admin:nav.users',        icon: 'UsersIcon',                  to: '/app/admin/users' },
  { label: 'admin:nav.appAccess',    icon: 'KeyIcon',                    to: '/app/admin/app-access' },
  { label: 'admin:nav.posTerminals', icon: 'ShoppingCartIcon',           to: '/app/admin/pos-terminals' },
  { label: 'admin:nav.auditLog',     icon: 'ClipboardDocumentListIcon',  to: '/app/admin/audit-log' },
  { label: 'admin:nav.settings',     icon: 'Cog6ToothIcon',              to: '/app/admin/settings' },
  { label: 'admin:nav.system',       icon: 'ServerIcon',                 to: '/app/admin/system' },
];
