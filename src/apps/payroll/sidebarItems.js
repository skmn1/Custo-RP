/**
 * Sidebar navigation items for the Payroll app.
 * Items are filtered at render time by AppSidebar based on user role.
 *
 * super_admin and hr_manager see all 6 items.
 * employee sees only "My Pay Slips".
 */
export const payrollSidebarItems = [
  {
    label: 'common:nav.overview',
    icon: 'HomeIcon',
    to: '/app/payroll/overview',
    roles: ['super_admin', 'hr_manager'],
  },
  {
    label: 'common:nav.payRuns',
    icon: 'PlayCircleIcon',
    to: '/app/payroll/runs',
    roles: ['super_admin', 'hr_manager'],
  },
  {
    label: 'common:nav.paySlips',
    icon: 'DocumentTextIcon',
    to: '/app/payroll/slips',
    roles: ['super_admin', 'hr_manager'],
  },
  {
    label: 'common:nav.myPaySlips',
    icon: 'DocumentTextIcon',
    to: '/app/payroll/slips/mine',
    roles: ['employee'],
  },
  {
    label: 'common:nav.deductions',
    icon: 'MinusCircleIcon',
    to: '/app/payroll/deductions',
    roles: ['super_admin', 'hr_manager'],
  },
  {
    label: 'common:nav.directDeposit',
    icon: 'BuildingLibraryIcon',
    to: '/app/payroll/direct-deposit',
    roles: ['super_admin', 'hr_manager'],
  },
  {
    label: 'common:nav.export',
    icon: 'ArrowDownTrayIcon',
    to: '/app/payroll/export',
    roles: ['super_admin', 'hr_manager'],
  },
];
