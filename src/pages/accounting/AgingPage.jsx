import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';

const fmt = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount ?? 0);

const AGING_BUCKETS = [
  { label: 'Current', min: -Infinity, max: 0 },
  { label: '1–30 days', min: 1, max: 30 },
  { label: '31–60 days', min: 31, max: 60 },
  { label: '61–90 days', min: 61, max: 90 },
  { label: '90+ days', min: 91, max: Infinity },
];

function daysOverdue(dueDateStr) {
  const diff = (new Date() - new Date(dueDateStr)) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

export default function AgingPage() {
  const { t } = useTranslation(['accounting', 'invoices', 'common']);
  const { invoices, fetchInvoices, isLoading } = useInvoices();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openInvoices = useMemo(
    () => invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled'),
    [invoices],
  );

  const bucketData = useMemo(() => {
    return AGING_BUCKETS.map((bucket) => {
      const items = openInvoices.filter((inv) => {
        const days = daysOverdue(inv.dueDate);
        return days >= bucket.min && days <= bucket.max;
      });
      const total = items.reduce((s, i) => s + (i.amountOutstanding ?? 0), 0);
      return { ...bucket, items, total, count: items.length };
    });
  }, [openInvoices]);

  if (isLoading && invoices.length === 0) {
    return <div className="text-center py-12 text-gray-500">{t('common:status.loading')}</div>;
  }

  return (
    <div className="space-y-6" data-testid="aging-page">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounting:aging.title', 'AR Aging Report')}</h1>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {bucketData.map((b) => (
          <div key={b.label} className={`rounded-xl p-4 border ${b.min > 60 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800'} shadow-sm`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">{b.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{fmt(b.total)}</p>
            <p className="text-xs text-gray-400 mt-1">{b.count} {t('invoices:title', 'invoices')}</p>
          </div>
        ))}
      </div>

      {/* ── Detail table per bucket ── */}
      {bucketData.filter((b) => b.items.length > 0).map((b) => (
        <div key={b.label} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {b.label} — {fmt(b.total)}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">{t('invoices:field.number', '#')}</th>
                  <th className="py-2 pr-4">{t('invoices:field.supplier', 'Customer')}</th>
                  <th className="py-2 pr-4">{t('invoices:field.dueDate', 'Due Date')}</th>
                  <th className="py-2 pr-4">{t('accounting:aging.daysOverdue', 'Days')}</th>
                  <th className="py-2 text-right">{t('invoices:field.outstanding', 'Outstanding')}</th>
                </tr>
              </thead>
              <tbody>
                {b.items.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      <Link to={`/app/accounting/invoices/${inv.id}`} className="text-blue-600 hover:underline">{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{inv.counterpartyName}</td>
                    <td className="py-2 pr-4">{inv.dueDate}</td>
                    <td className="py-2 pr-4 text-red-600 font-medium">{Math.max(0, daysOverdue(inv.dueDate))}</td>
                    <td className="py-2 text-right font-medium">{fmt(inv.amountOutstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {openInvoices.length === 0 && (
        <p className="text-center py-8 text-gray-400">{t('common:status.noData')}</p>
      )}
    </div>
  );
}
