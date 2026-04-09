export const accountingSidebarItems = [
  { label: 'common:nav.dashboard',  icon: 'HomeIcon',           to: '/app/accounting/dashboard' },
  { label: 'common:nav.arInvoices', icon: 'ArrowUpRightIcon',   to: '/app/accounting/invoices?type=AR' },
  { label: 'common:nav.apInvoices', icon: 'ArrowDownLeftIcon',  to: '/app/accounting/invoices?type=AP' },
  { label: 'common:nav.payments',   icon: 'CreditCardIcon',     to: '/app/accounting/payments' },
  { label: 'common:nav.aging',      icon: 'ClockIcon',          to: '/app/accounting/aging' },
  { label: 'common:nav.reports',    icon: 'ChartBarIcon',       to: '/app/accounting/reports' },
  { label: 'common:nav.accountingSettings', icon: 'Cog6ToothIcon', to: '/app/accounting/settings' },
];
