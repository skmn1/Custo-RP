import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosLocationPayroll = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .getPayrollSummary(posLocationId)
      .then((result) => {
        if (!cancelled) setSummary(result?.data ?? result ?? null);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [posLocationId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:payroll.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : !summary ? (
        <div className="text-center py-16">
          <BanknotesIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:payroll.noPeriod')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              {t('pos:payroll.currentPeriod')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {summary.periodLabel ?? '—'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{summary.status ?? ''}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              {t('common:employees', 'Employees')}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {summary.employeeCount ?? '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              {t('common:totalCost', 'Total Cost')}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {summary.totalCost != null ? `$${summary.totalCost}` : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosLocationPayroll;
