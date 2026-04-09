/**
 * Sidebar navigation items for the Planning app.
 * Items are filtered at render time by AppSidebar based on user role.
 */
export const planningSidebarItems = [
  {
    label: 'common:nav.schedule',
    icon: 'CalendarDaysIcon',
    to: '/app/planning/schedule',
    roles: ['super_admin', 'hr_manager', 'planner'],
  },
  {
    label: 'common:nav.mySchedule',
    icon: 'UserCircleIcon',
    to: '/app/planning/my-schedule',
    roles: ['employee'],
  },
  {
    label: 'common:nav.availability',
    icon: 'ClockIcon',
    to: '/app/planning/availability',
    roles: ['super_admin', 'hr_manager', 'planner', 'employee'],
  },
  {
    label: 'common:nav.timeOff',
    icon: 'SunIcon',
    to: '/app/planning/time-off',
    roles: ['super_admin', 'hr_manager', 'planner', 'employee'],
  },
  {
    label: 'common:nav.shiftSwaps',
    icon: 'ArrowsRightLeftIcon',
    to: '/app/planning/shift-swaps',
    roles: ['super_admin', 'hr_manager', 'planner', 'employee'],
  },
  {
    label: 'common:nav.templates',
    icon: 'DocumentDuplicateIcon',
    to: '/app/planning/templates',
    roles: ['super_admin', 'hr_manager', 'planner'],
  },
  {
    label: 'common:nav.planningReports',
    icon: 'ChartBarIcon',
    to: '/app/planning/reports',
    roles: ['super_admin', 'hr_manager', 'planner'],
  },
];
