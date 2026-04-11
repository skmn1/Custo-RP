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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {t('dashboard.quickAccess')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {shortcuts.map(({ key, icon: Icon, to, labelKey }) => (
          <Link
            key={key}
            to={to}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 text-gray-700 text-sm font-medium transition-colors"
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
