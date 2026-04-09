import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Direct Deposit placeholder page — /app/payroll/direct-deposit
 * Shows bank information configuration for employee direct deposits.
 */
const DirectDepositPage = () => {
  const { t } = useTranslation(['payroll', 'common']);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('payroll:directDeposit.title')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        {t('payroll:directDeposit.subtitle')}
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('payroll:directDeposit.configTitle')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {t('payroll:directDeposit.configDescription')}
          </p>

          {/* Summary info */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl">
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">{t('payroll:directDeposit.enrolled')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">{t('payroll:directDeposit.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">{t('payroll:directDeposit.lastBatch')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectDepositPage;
