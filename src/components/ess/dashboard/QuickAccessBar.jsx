import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const shortcuts = [
  { key: 'schedule', icon: CalendarDaysIcon, to: '/app/ess/schedule', labelKey: 'nav.schedule' },
  { key: 'payslips', icon: DocumentTextIcon, to: '/app/ess/payslips', labelKey: 'nav.payslips' },
  { key: 'attendance', icon: ClockIcon, to: '/app/ess/attendance', labelKey: 'nav.attendance' },
  { key: 'profile', icon: UserCircleIcon, to: '/app/ess/profile', labelKey: 'nav.profile' },
];

const QuickAccessBar = () => {
  const { t } = useTranslation('ess');

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        {t('dashboard.quickAccess')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {shortcuts.map(({ key, icon: Icon, to, labelKey }) => (
          <Link
            key={key}
            to={to}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-750 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
          >
            <Icon className="h-5 w-5 text-indigo-500" />
            {t(labelKey)}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessBar;
