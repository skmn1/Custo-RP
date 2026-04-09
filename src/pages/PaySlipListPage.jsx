import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';

/**
 * Pay Slips list — /app/payroll/slips
 * Filterable table of all pay slips: employee, period, gross, net, status.
 */
const PaySlipListPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const { employeePayrolls, recentPayPeriods } = usePayroll(employees, shifts);

  const [search, setSearch] = useState('');

  const slips = useMemo(() => {
    const list = employeePayrolls.map((emp) => ({
      id: `slip-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      period: recentPayPeriods?.[recentPayPeriods.length - 1]
        ? `${new Date(recentPayPeriods[recentPayPeriods.length - 1].start).toLocaleDateString()} — ${new Date(recentPayPeriods[recentPayPeriods.length - 1].end).toLocaleDateString()}`
        : t('payroll:paySlips.currentPeriod'),
      grossPay: emp.grossPay || 0,
      netPay: emp.netPay || 0,
      status: 'approved',
    }));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((s) => s.employeeName.toLowerCase().includes(q));
  }, [employeePayrolls, recentPayPeriods, search, t]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('payroll:paySlips.title')}
      </h1>

      {/* Search */}
      <div className="max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('payroll:paySlips.searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payroll:table.employee')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payroll:table.period')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.gross')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:table.net')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('payroll:table.status')}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {slips.map((slip) => (
              <tr key={slip.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{slip.employeeName}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{slip.period}</td>
                <td className="px-4 py-3 text-sm text-right">${slip.grossPay.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">${slip.netPay.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {t(`payroll:status.${slip.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/app/payroll/slips/${slip.id}`}
                    className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                  >
                    {t('payroll:paySlips.view')}
                  </Link>
                </td>
              </tr>
            ))}
            {slips.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  {t('payroll:paySlips.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaySlipListPage;
