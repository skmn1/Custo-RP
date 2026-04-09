import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';

/**
 * Pay Runs list — /app/payroll/runs
 * Shows all pay runs with their status, period, totals.
 */
const PayRunListPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const { recentPayPeriods } = usePayroll(employees, shifts);

  const runs = useMemo(() => {
    return (recentPayPeriods || []).map((p, i) => ({
      id: `run-${i + 1}`,
      start: p.start,
      end: p.end,
      grossPay: p.grossPay || 0,
      netPay: p.netPay || 0,
      employeeCount: p.employeeCount || 0,
      status: i === (recentPayPeriods.length - 1) ? 'draft' : 'approved',
    }));
  }, [recentPayPeriods]);

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    voided: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('payroll:payRuns.title')}
        </h1>
        <Link
          to="/app/payroll/runs/new"
          className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium"
          data-testid="new-pay-run"
        >
          {t('payroll:payRuns.startNew')}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payroll:table.period')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.gross')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.net')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.employees')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('payroll:table.status')}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {runs.map((run) => (
              <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(run.start).toLocaleDateString()} — {new Date(run.end).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-right">${run.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm text-right">${run.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm text-right">{run.employeeCount}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[run.status]}`}>
                    {t(`payroll:status.${run.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/app/payroll/runs/${run.id}`}
                    className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                  >
                    {t('payroll:payRuns.view')}
                  </Link>
                </td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  {t('payroll:payRuns.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayRunListPage;
