import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArchiveBoxIcon,
  TruckIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  PlayCircleIcon,
  PlusCircleIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const KpiCard = ({ icon: Icon, label, value, color = 'teal', subtext }) => {
  const colorMap = {
    teal:   'bg-teal-50   dark:bg-teal-900/20   text-teal-600   dark:text-teal-400',
    blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400',
    amber:  'bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400',
    red:    'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400',
    green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    rose:   'bg-rose-50   dark:bg-rose-900/20   text-rose-600   dark:text-rose-400',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value ?? '—'}</p>
          {subtext && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ children }) => (
  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 mt-6">
    {children}
  </h2>
);

const PosLocationDashboard = () => {
  const { posLocationId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['pos', 'common']);
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .dashboardKpis(posLocationId)
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
  }, [posLocationId]);

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

  // Determine session status
  const sessionOpen = Boolean(kpis.sessionOpen);
  const sessionLabel = sessionOpen
    ? t('pos:locationStatus.open')
    : t('pos:locationStatus.closed');

  // Quick actions
  const quickActions = [
    {
      label: sessionOpen ? t('pos:dashboard.actions.closeSession') : t('pos:dashboard.actions.openSession'),
      icon: PlayCircleIcon,
      to: `/app/pos/${posLocationId}/session`,
    },
    {
      label: t('pos:dashboard.actions.newTransaction'),
      icon: PlusCircleIcon,
      to: `/app/pos/${posLocationId}/transactions`,
    },
    {
      label: t('pos:dashboard.actions.newPurchaseOrder'),
      icon: TruckIcon,
      to: `/app/pos/${posLocationId}/purchases`,
    },
    {
      label: t('pos:dashboard.actions.newInvoice'),
      icon: DocumentTextIcon,
      to: `/app/pos/${posLocationId}/invoices/new`,
    },
    {
      label: t('pos:dashboard.actions.viewSchedule'),
      icon: CalendarIcon,
      to: `/app/pos/${posLocationId}/schedule`,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {kpis.posLocationName ?? kpis.terminalName}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:dashboard.subtitle', 'Location overview and key metrics')}
        </p>
      </div>

      {/* ── Row 1: Sales ── */}
      <SectionHeading>{t('pos:nav.group.sales')}</SectionHeading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={QuestionMarkCircleIcon}
          label={t('pos:dashboard.sessionStatus')}
          value={sessionLabel}
          color={sessionOpen ? 'green' : 'amber'}
        />
        <KpiCard
          icon={CurrencyDollarIcon}
          label={t('pos:dashboard.salesToday')}
          value={kpis.salesToday != null ? `$${kpis.salesToday}` : '—'}
          color="teal"
        />
        <KpiCard
          icon={ShoppingBagIcon}
          label={t('pos:dashboard.transactionsToday')}
          value={kpis.transactionCount ?? 0}
          color="violet"
        />
        <KpiCard
          icon={CurrencyDollarIcon}
          label={t('pos:dashboard.averageBasket')}
          value={kpis.avgBasket != null ? `$${kpis.avgBasket}` : '—'}
          color="blue"
        />
      </div>

      {/* ── Row 2: Operations ── */}
      <SectionHeading>{t('pos:nav.group.operations')}</SectionHeading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={TruckIcon}
          label={t('pos:dashboard.openPurchaseOrders')}
          value={kpis.openPurchaseOrders ?? 0}
          color="indigo"
        />
        <KpiCard
          icon={ArchiveBoxIcon}
          label={t('pos:dashboard.lowStockAlerts')}
          value={kpis.lowStockAlerts ?? 0}
          color="amber"
        />
        <KpiCard
          icon={DocumentTextIcon}
          label={t('pos:dashboard.openApInvoices')}
          value={kpis.openApInvoices ?? 0}
          color="rose"
        />
        <KpiCard
          icon={DocumentTextIcon}
          label={t('pos:dashboard.openArInvoices')}
          value={kpis.openArInvoices ?? 0}
          color="red"
        />
      </div>

      {/* ── Row 3: People ── */}
      <SectionHeading>{t('pos:nav.group.people')}</SectionHeading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={UsersIcon}
          label={t('pos:dashboard.staffOnShift')}
          value={kpis.staffOnShift ?? 0}
          color="green"
        />
        <KpiCard
          icon={CalendarIcon}
          label={t('pos:dashboard.upcomingShifts')}
          value={kpis.upcomingShifts ?? 0}
          color="blue"
        />
        <KpiCard
          icon={ClockIcon}
          label={t('pos:dashboard.pendingLeave')}
          value={kpis.pendingLeave ?? 0}
          color="amber"
        />
        <KpiCard
          icon={BanknotesIcon}
          label={t('pos:dashboard.nextPayroll')}
          value={kpis.nextPayrollDate ?? '—'}
          color="violet"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t('pos:dashboard.quickActionsTitle', 'Quick Actions')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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

export default PosLocationDashboard;
