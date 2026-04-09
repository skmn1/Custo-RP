import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdmin';
import {
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const INTERVAL_OPTIONS = [
  { value: 30000, label: '30s' },
  { value: 60000, label: '1m' },
  { value: 120000, label: '2m' },
  { value: 300000, label: '5m' },
];

function StatCard({ label, value, icon: Icon, status, link }) {
  const statusClasses = {
    normal: 'bg-white border-gray-200',
    amber: 'bg-amber-50 border-amber-300',
    red: 'bg-red-50 border-red-300',
    green: 'bg-green-50 border-green-300',
  };
  const iconClasses = {
    normal: 'text-gray-400',
    amber: 'text-amber-500',
    red: 'text-red-500',
    green: 'text-green-500',
  };

  const card = (
    <div className={`rounded-lg border p-4 ${statusClasses[status || 'normal']} transition-shadow hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
        {Icon && <Icon className={`h-8 w-8 flex-shrink-0 ${iconClasses[status || 'normal']}`} />}
      </div>
      {link && (
        <div className="mt-2">
          <span className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View →</span>
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link to={link} className="block">{card}</Link>;
  }
  return card;
}

function KpiSection({ title, children, unavailable, t }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
      {unavailable ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
          {t('admin:dashboard.unavailable')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

const FEED_ICONS = {
  shift_created: CalendarDaysIcon,
  shift_modified: CalendarDaysIcon,
  pay_run_approved: BanknotesIcon,
  invoice_finalised: DocumentTextIcon,
  invoice_overdue: ExclamationTriangleIcon,
  stock_adjustment: ArchiveBoxIcon,
  low_stock_triggered: ExclamationTriangleIcon,
  pos_session_opened: ShoppingCartIcon,
  pos_session_closed: ShoppingCartIcon,
  role_changed: UsersIcon,
};

function ActivityFeedItem({ entry }) {
  const Icon = FEED_ICONS[entry.action] || ClockIcon;
  const formattedTime = new Date(entry.timestamp).toLocaleString();

  const content = (
    <div className="flex items-start space-x-3 py-3 px-4 hover:bg-gray-50 transition-colors">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{entry.user}</span>{' '}
          <span className="text-gray-600">{entry.description}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formattedTime}</p>
      </div>
    </div>
  );

  if (entry.link) {
    return <Link to={entry.link} className="block">{content}</Link>;
  }
  return content;
}

const AdminDashboardPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [interval, setInterval] = useState(60000);
  const { kpis, kpiError, kpiLoading, feed, feedError, lastUpdated, refresh } = useAdminDashboard(interval);

  const k = kpis || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin:dashboard.title')}</h1>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('admin:dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-xs text-gray-500">{t('admin:dashboard.refreshInterval')}</label>
              <select
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-slate-500"
              >
                {INTERVAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={refresh}
                className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                {t('common:actions.refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {kpiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{kpiError}</div>
        )}

        {kpiLoading && !kpis ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
          </div>
        ) : (
          <>
            {/* ── People Section ── */}
            <KpiSection title={t('admin:dashboard.section.people')} t={t}>
              <StatCard
                label={t('admin:dashboard.kpi.activeEmployees')}
                value={k.activeEmployees}
                icon={UsersIcon}
                link="/app/hr/employees"
              />
              <StatCard
                label={t('admin:dashboard.kpi.shiftsThisWeek')}
                value={k.shiftsThisWeek}
                icon={CalendarDaysIcon}
                link="/app/planning/schedule"
              />
              <StatCard
                label={t('admin:dashboard.kpi.openTimeOff')}
                value={k.openTimeOffRequests}
                icon={ClockIcon}
                status={k.openTimeOffRequests > 0 ? 'amber' : 'normal'}
                link="/app/planning/time-off"
              />
              <StatCard
                label={t('admin:dashboard.kpi.pendingSwaps')}
                value={k.pendingShiftSwaps}
                icon={ArrowsRightLeftIcon}
                link="/app/planning/shift-swaps"
              />
            </KpiSection>

            {/* ── Payroll Section ── */}
            <KpiSection title={t('admin:dashboard.section.payroll')} t={t}>
              <StatCard
                label={t('admin:dashboard.kpi.nextPayRun')}
                value={k.nextPayRunDate || '—'}
                icon={CalendarDaysIcon}
                link="/app/payroll/runs"
              />
              <StatCard
                label={t('admin:dashboard.kpi.lastPayRunTotal')}
                value={k.lastPayRunTotal != null ? `€${Number(k.lastPayRunTotal).toLocaleString()}` : '—'}
                icon={BanknotesIcon}
              />
              <StatCard
                label={t('admin:dashboard.kpi.pendingPayRuns')}
                value={k.pendingPayRuns}
                icon={BanknotesIcon}
                status={k.pendingPayRuns > 0 ? 'red' : 'normal'}
                link="/app/payroll/runs"
              />
            </KpiSection>

            {/* ── Accounting Section ── */}
            <KpiSection title={t('admin:dashboard.section.accounting')} t={t}>
              <StatCard
                label={t('admin:dashboard.kpi.openArInvoices')}
                value={k.openArInvoices}
                icon={DocumentTextIcon}
                link="/app/accounting/invoices?type=AR"
              />
              <StatCard
                label={t('admin:dashboard.kpi.overdueArInvoices')}
                value={k.overdueArInvoices}
                icon={ExclamationTriangleIcon}
                status={k.overdueArInvoices > 0 ? 'red' : 'normal'}
                link="/app/accounting/aging"
              />
              <StatCard
                label={t('admin:dashboard.kpi.revenueMtd')}
                value={k.revenueMtd != null ? `€${Number(k.revenueMtd).toLocaleString()}` : '—'}
                icon={BanknotesIcon}
                link="/app/accounting/reports"
              />
            </KpiSection>

            {/* ── Stock Section ── */}
            <KpiSection title={t('admin:dashboard.section.stock')} t={t}>
              <StatCard
                label={t('admin:dashboard.kpi.lowStockAlerts')}
                value={k.lowStockAlerts}
                icon={ExclamationTriangleIcon}
                status={k.lowStockAlerts > 5 ? 'red' : k.lowStockAlerts > 0 ? 'amber' : 'normal'}
                link="/app/stock/reorder-queue"
              />
              <StatCard
                label={t('admin:dashboard.kpi.pendingPurchaseOrders')}
                value={k.pendingPurchaseOrders}
                icon={ArchiveBoxIcon}
                link="/app/stock/purchase-orders"
              />
              <StatCard
                label={t('admin:dashboard.kpi.totalInventoryValue')}
                value={k.totalInventoryValue != null ? `€${Number(k.totalInventoryValue).toLocaleString()}` : '—'}
                icon={ArchiveBoxIcon}
                link="/app/stock/valuation"
              />
            </KpiSection>

            {/* ── PoS Section ── */}
            <KpiSection title={t('admin:dashboard.section.pos')} t={t}>
              <StatCard
                label={t('admin:dashboard.kpi.activeSessions')}
                value={k.activePosSessions}
                icon={ShoppingCartIcon}
                status={k.activePosSessions > 0 ? 'green' : 'normal'}
              />
              <StatCard
                label={t('admin:dashboard.kpi.posSalesToday')}
                value={k.posSalesToday != null ? `€${Number(k.posSalesToday).toLocaleString()}` : '—'}
                icon={BanknotesIcon}
              />
              <StatCard
                label={t('admin:dashboard.kpi.posTransactionsToday')}
                value={k.posTransactionsToday}
                icon={ShoppingCartIcon}
              />
            </KpiSection>
          </>
        )}

        {/* ── Cross-App Activity Feed ── */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t('admin:dashboard.activityFeed.title')}
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
            {feedError && (
              <div className="p-4 text-sm text-red-600">{feedError}</div>
            )}
            {feed.length === 0 && !feedError && (
              <div className="p-8 text-center text-sm text-gray-400">
                {t('admin:dashboard.activityFeed.empty')}
              </div>
            )}
            {feed.map((entry, idx) => (
              <ActivityFeedItem key={entry.id || idx} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
