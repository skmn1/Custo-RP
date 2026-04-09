import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/config';

const EssDashboardPage = () => {
  const { t } = useTranslation('ess');
  const { user } = useAuth();
  const [me, setMe] = useState(null);

  useEffect(() => {
    apiFetch('/ess/me')
      .then((res) => setMe(res.data))
      .catch(() => {});
  }, []);

  const firstName = user?.firstName || me?.firstName || '';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        {t('dashboard.title')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {t('welcome', { firstName })}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label={t('dashboard.nextShift')} value={t('dashboard.noUpcomingShift')} color="indigo" />
        <StatCard label={t('dashboard.hoursThisWeek')} value="—" color="blue" />
        <StatCard label={t('dashboard.pendingRequests')} value="0" color="amber" />
        <StatCard label={t('dashboard.latestPayslip')} value="—" color="green" />
      </div>

      <div className="flex gap-4">
        <Link
          to="/app/ess/schedule"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t('dashboard.viewSchedule')}
        </Link>
        <Link
          to="/app/ess/payslips"
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          {t('dashboard.viewPayslips')}
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800',
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color] || colors.indigo}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
};

export default EssDashboardPage;
