import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';
import StatCard from '../components/ui/StatCard';

/**
 * Payroll Overview Dashboard — landing page for /app/payroll/overview.
 * Shows KPI stat cards (last pay run, next pay run, YTD, pending, active employees)
 * and two quick-action buttons.
 */
const PayrollOverviewPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const payrollData = usePayroll(employees, shifts);
  const { payrollSummary, recentPayPeriods, employeePayrolls } = payrollData;

  // Derive KPIs from existing payroll data
  const kpis = useMemo(() => {
    const lastRun = recentPayPeriods?.length > 0 ? recentPayPeriods[recentPayPeriods.length - 1] : null;
    const lastRunGross = lastRun?.grossPay ?? 0;
    const ytdGross = recentPayPeriods?.reduce((sum, p) => sum + (p.grossPay || 0), 0) ?? 0;

    return {
      lastRunDate: lastRun
        ? new Date(lastRun.end).toLocaleDateString()
        : t('payroll:overview.noRunYet'),
      lastRunGross,
      lastRunStatus: 'approved',
      nextRunDate: t('payroll:overview.basedOnFrequency'),
      ytdGross,
      pendingApprovals: 0, // Draft runs awaiting approval
      activeEmployees: payrollSummary?.totalEmployees ?? employees.length,
    };
  }, [recentPayPeriods, payrollSummary, employees, t]);

  const statusBadge = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      voided: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
        {t(`payroll:status.${status}`)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('payroll:overview.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('payroll:overview.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Last Pay Run */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('payroll:overview.lastPayRun')}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {kpis.lastRunDate}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            ${kpis.lastRunGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-1">{statusBadge(kpis.lastRunStatus)}</div>
        </div>

        {/* Next Pay Run */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('payroll:overview.nextPayRun')}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {kpis.nextRunDate}
          </p>
        </div>

        {/* YTD Payroll */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('payroll:overview.ytdPayroll')}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            ${kpis.ytdGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('payroll:overview.pendingApprovals')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpis.pendingApprovals}</p>
        </div>

        {/* Active Employees */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('payroll:overview.activeEmployees')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpis.activeEmployees}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/app/payroll/runs/new"
          className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          {t('payroll:overview.startNewPayRun')}
        </Link>
        <Link
          to="/app/payroll/slips"
          className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          {t('payroll:overview.viewLastPaySlips')}
        </Link>
      </div>

      {/* Recent Pay Periods */}
      {recentPayPeriods && recentPayPeriods.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('payroll:overview.recentPayPeriods')}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('payroll:table.period')}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('payroll:table.gross')}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('payroll:table.net')}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {t('payroll:table.employees')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentPayPeriods.map((period, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(period.start).toLocaleDateString()} — {new Date(period.end).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      ${(period.grossPay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      ${(period.netPay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      {period.employeeCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollOverviewPage;
