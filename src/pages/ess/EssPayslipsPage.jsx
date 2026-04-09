import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEssPayslips } from '../../hooks/useEssPayslips';

/* ─── Helpers ─────────────────────────────────────────────── */

function fmtCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const statusColors = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

/* ─── PayslipCard ─────────────────────────────────────────── */

function PayslipCard({ slip, t }) {
  return (
    <Link
      to={`/app/ess/payslips/${slip.id}`}
      className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{slip.periodLabel}</h3>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[slip.status] || statusColors.draft}`}>
          {t(`payslips.status.${slip.status}`)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{t('payslips.grossPay')}</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{fmtCurrency(slip.grossPay, slip.currency)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{t('payslips.deductions')}</p>
          <p className="font-medium text-red-600 dark:text-red-400">−{fmtCurrency(slip.totalDeductions, slip.currency)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{t('payslips.netPay')}</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{fmtCurrency(slip.netPay, slip.currency)}</p>
        </div>
      </div>
      {slip.paidAt && (
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          {t('payslips.paidOn', { date: new Date(slip.paidAt).toLocaleDateString() })}
        </p>
      )}
    </Link>
  );
}

/* ─── Year filter ─────────────────────────────────────────── */

function YearFilter({ year, setYear, t }) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 4; y--) years.push(y);

  return (
    <select
      value={year || ''}
      onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
      aria-label={t('payslips.yearFilter')}
    >
      <option value="">{t('payslips.allYears')}</option>
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

const EssPayslipsPage = () => {
  const { t } = useTranslation('ess');
  const {
    payslips,
    pagination,
    isLoading,
    error,
    restricted,
    year,
    setYear,
    fetchPayslips,
  } = useEssPayslips();

  const handleLoadMore = () => {
    if (pagination.hasNextPage) {
      fetchPayslips(pagination.page + 1, pagination.pageSize, year);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('payslips.title')}
        </h1>
        <YearFilter year={year} setYear={setYear} t={t} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Restricted */}
      {restricted && !isLoading && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-amber-400 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-amber-700 dark:text-amber-300 font-medium">{t('payslips.restricted')}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !restricted && payslips.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 py-12 text-center">
          {t('payslips.empty')}
        </p>
      )}

      {/* Payslip cards */}
      {!isLoading && !restricted && payslips.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payslips.map((slip) => (
              <PayslipCard key={slip.id} slip={slip} t={t} />
            ))}
          </div>

          {/* Load more */}
          {pagination.hasNextPage && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('payslips.loadMore')}
              </button>
            </div>
          )}

          {/* Total count */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            {payslips.length} / {pagination.total}
          </p>
        </>
      )}
    </div>
  );
};

export default EssPayslipsPage;
