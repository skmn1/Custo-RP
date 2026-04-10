import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const LatestPayslipWidget = ({ payslip, restricted, error }) => {
  const { t, i18n } = useTranslation('ess');

  const formatCurrency = (amount, currency = 'EUR') => {
    if (amount == null) return '—';
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount);
  };

  const formatPaidDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          {t('dashboard.latestPayslip.title')}
        </h3>
        <p className="text-sm text-red-500 dark:text-red-400 text-center py-4">{t('dashboard.unableToLoad')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <DocumentTextIcon className="h-4 w-4" />
        {t('dashboard.latestPayslip.title')}
      </h3>

      {restricted ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center flex-1 flex items-center justify-center">
          {t('dashboard.latestPayslip.restricted')}
        </p>
      ) : !payslip ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center flex-1 flex items-center justify-center">
          {t('dashboard.latestPayslip.empty')}
        </p>
      ) : (
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {payslip.periodLabel}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(payslip.netPay, payslip.currency)}
          </p>
          {payslip.paidAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('payslips.paidOn', { date: formatPaidDate(payslip.paidAt) })}
            </p>
          )}
        </div>
      )}

      {!restricted && payslip?.id && (
        <Link
          to={`/app/ess/payslips/${payslip.id}`}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-4 inline-block"
        >
          {t('dashboard.latestPayslip.viewPayslip')} →
        </Link>
      )}
      {(restricted || !payslip) && (
        <Link
          to="/app/ess/payslips"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-4 inline-block"
        >
          {t('dashboard.latestPayslip.viewPayslip')} →
        </Link>
      )}
    </div>
  );
};

export default LatestPayslipWidget;
