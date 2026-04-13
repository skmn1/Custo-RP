import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosLocationAccounting = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .getAccountingSummary(posLocationId)
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

  const balance = summary
    ? (summary.revenue ?? 0) - (summary.expenses ?? 0)
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:accounting.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : !summary ? (
        <div className="text-center py-16">
          <CalculatorIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('common:noData', 'No data available')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              {t('pos:accounting.revenue')}
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${summary.revenue ?? '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              {t('pos:accounting.expenses')}
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${summary.expenses ?? '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              {t('pos:accounting.balance')}
            </p>
            <p className={`text-2xl font-bold ${balance != null && balance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
              {balance != null ? `$${balance}` : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosLocationAccounting;
