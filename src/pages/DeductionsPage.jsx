import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { usePayroll } from '../hooks/usePayroll';
import { payrollConfig } from '../data/payroll';

/**
 * Deductions management page — /app/payroll/deductions
 * Shows the tax rates and benefit deductions currently configured,
 * plus per-employee deduction summary for the current period.
 */
const DeductionsPage = () => {
  const { t } = useTranslation(['payroll', 'common']);
  const { employees } = useEmployees();
  const { shifts } = useShifts();
  const { employeePayrolls, payrollStats } = usePayroll(employees, shifts);

  const taxRates = payrollConfig?.taxRates || {};
  const benefits = payrollConfig?.benefits || {};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('payroll:deductions.title')}
      </h1>

      {/* Tax Rates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('payroll:deductions.taxRates')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(taxRates).map(([key, rate]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase">{t(`payroll:deductions.tax.${key}`, key)}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{(rate * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('payroll:deductions.benefits')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(benefits).map(([key, amount]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase">{t(`payroll:deductions.benefit.${key}`, key)}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof amount === 'number' && amount < 1 ? `${(amount * 100).toFixed(1)}%` : `$${amount}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Employee deduction summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('payroll:deductions.perEmployee')}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('payroll:table.employee')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:paySlip.federalTax')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:paySlip.stateTax')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:paySlip.socialSecurity')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:paySlip.medicare')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('payroll:paySlip.healthInsurance')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase font-bold">{t('payroll:deductions.totalLabel')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {employeePayrolls.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.name}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">${(emp.taxes?.federal ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">${(emp.taxes?.state ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">${(emp.taxes?.socialSecurity ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">${(emp.taxes?.medicare ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">${(emp.deductions?.healthInsurance ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-700">${(emp.deductions?.total ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeductionsPage;
