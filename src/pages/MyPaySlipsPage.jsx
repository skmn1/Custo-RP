import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';

/**
 * My Pay Slips — /app/payroll/slips/mine
 * Employee-only view: shows only the authenticated user's own pay slips.
 */
const MyPaySlipsPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const { employeePayrolls, recentPayPeriods } = usePayroll(employees, shifts);

  // Filter to only the current user's slips
  const mySlips = useMemo(() => {
    // Match by user email prefix or employee name – the exact user→employee mapping
    // depends on backend; here we match by name for the demo seed data.
    const ownName = user?.name?.toLowerCase() || '';
    const ownEmail = user?.email?.toLowerCase() || '';
    return employeePayrolls.filter((emp) => {
      const empName = emp.name?.toLowerCase() || '';
      return empName === ownName || empName.includes(ownEmail.split('@')[0]);
    });
  }, [employeePayrolls, user]);

  const currentPeriod = recentPayPeriods?.[recentPayPeriods.length - 1];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('payroll:myPaySlips.title')}
      </h1>

      {mySlips.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
          {t('payroll:myPaySlips.empty')}
        </div>
      ) : (
        <div className="space-y-4">
          {mySlips.map((slip) => (
            <div
              key={slip.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{slip.name}</h2>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {t('payroll:status.approved')}
                </span>
              </div>

              {currentPeriod && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t('payroll:table.period')}: {new Date(currentPeriod.start).toLocaleDateString()} — {new Date(currentPeriod.end).toLocaleDateString()}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t('payroll:paySlip.regularHours')}</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{slip.regularHours?.toFixed(1) ?? '0.0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t('payroll:paySlip.overtimeHours')}</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{slip.overtimeHours?.toFixed(1) ?? '0.0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t('payroll:table.gross')}</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">${slip.grossPay?.toFixed(2) ?? '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t('payroll:table.net')}</p>
                  <p className="text-lg font-bold text-green-600">${slip.netPay?.toFixed(2) ?? '0.00'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('payroll:paySlip.deductionsBreakdown')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">{t('payroll:paySlip.federalTax')}:</span>{' '}
                    <span className="text-red-600">${(slip.taxes?.federal ?? 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('payroll:paySlip.stateTax')}:</span>{' '}
                    <span className="text-red-600">${(slip.taxes?.state ?? 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('payroll:paySlip.socialSecurity')}:</span>{' '}
                    <span className="text-red-600">${(slip.taxes?.socialSecurity ?? 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('payroll:paySlip.medicare')}:</span>{' '}
                    <span className="text-red-600">${(slip.taxes?.medicare ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {t('payroll:paySlip.print')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPaySlipsPage;
