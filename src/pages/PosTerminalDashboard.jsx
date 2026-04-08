import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const KpiCard = ({ icon: Icon, label, value, color = 'teal' }) => {
  const colors = {
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

const PosTerminalDashboard = () => {
  const { terminalId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['pos', 'common']);
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .dashboardKpis(terminalId)
      .then(({ data }) => {
        if (!cancelled) setKpis(data);
      })
      .catch(() => {
        if (!cancelled) setKpis(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [terminalId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{t('pos:dashboard.loadError')}</p>
      </div>
    );
  }

  const quickActions = [
    {
      label: t('pos:dashboard.quickActions.viewEmployees'),
      icon: UsersIcon,
      to: `/app/pos/${terminalId}/detail`,
    },
    {
      label: t('pos:dashboard.quickActions.stockLookup'),
      icon: ArchiveBoxIcon,
      to: `/app/pos/${terminalId}/stock`,
    },
    {
      label: t('pos:dashboard.quickActions.viewReports'),
      icon: CurrencyDollarIcon,
      to: `/app/pos/${terminalId}/reports`,
    },
    {
      label: t('pos:dashboard.quickActions.viewIncidents'),
      icon: ExclamationTriangleIcon,
      to: `/app/pos/${terminalId}/detail`,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {kpis.terminalName}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:dashboard.subtitle')}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard icon={UsersIcon} label={t('pos:dashboard.employees')} value={kpis.employeeCount} color="blue" />
        <KpiCard icon={ExclamationTriangleIcon} label={t('pos:dashboard.openIncidents')} value={kpis.openIncidents} color="red" />
        <KpiCard icon={ClockIcon} label={t('pos:dashboard.shiftsToday')} value={kpis.shiftsToday} color="green" />
        <KpiCard icon={CurrencyDollarIcon} label={t('pos:dashboard.salesToday')} value={`$${kpis.salesToday}`} color="teal" />
        <KpiCard icon={ShoppingBagIcon} label={t('pos:dashboard.transactions')} value={kpis.transactionCount} color="violet" />
        <KpiCard icon={ArchiveBoxIcon} label={t('pos:dashboard.lowStock')} value={kpis.lowStockAlerts} color="amber" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t('pos:dashboard.quickActionsTitle')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.to)}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all text-left"
            >
              <action.icon className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PosTerminalDashboard;
