import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';

const fmt = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount ?? 0);

const METHODS = ['all', 'cash', 'bank_transfer', 'card', 'cheque', 'other'];

export default function PaymentsPage() {
  const { t } = useTranslation(['accounting', 'invoices', 'common']);
  const { invoices, fetchInvoices, isLoading } = useInvoices();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ── Flatten payments from all invoices ── */
  const allPayments = useMemo(() => {
    const payments = [];
    invoices.forEach((inv) => {
      (inv.payments || []).forEach((p) => {
        payments.push({
          ...p,
          invoiceNumber: inv.invoiceNumber,
          invoiceId: inv.id,
          invoiceType: inv.type || 'AP',
          counterpartyName: inv.counterpartyName,
        });
      });
    });
    return payments.sort((a, b) => new Date(b.paymentDate || b.date) - new Date(a.paymentDate || a.date));
  }, [invoices]);

  /* ── Apply filters ── */
  const filtered = useMemo(() => {
    let list = allPayments;
    if (dateFrom) list = list.filter((p) => (p.paymentDate || p.date) >= dateFrom);
    if (dateTo) list = list.filter((p) => (p.paymentDate || p.date) <= dateTo);
    if (typeFilter !== 'all') list = list.filter((p) => p.invoiceType === typeFilter);
    if (methodFilter !== 'all') list = list.filter((p) => p.method === methodFilter);
    return list;
  }, [allPayments, dateFrom, dateTo, typeFilter, methodFilter]);

  /* ── CSV export ── */
  const exportCsv = () => {
    const header = 'Date,Invoice #,Type,Customer/Supplier,Amount,Method,Recorded By\n';
    const rows = filtered.map((p) =>
      [p.paymentDate || p.date, p.invoiceNumber, p.invoiceType, p.counterpartyName, p.amount, p.method, p.recordedBy || ''].join(','),
    );
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payments-export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6" data-testid="payments-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounting:payments.title', 'Payments Log')}</h1>
        <button onClick={exportCsv} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          {t('common:actions.export', 'Export CSV')}
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-end" data-testid="payment-filters">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('accounting:payments.dateFrom', 'From')}</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('accounting:payments.dateTo', 'To')}</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('accounting:payments.type', 'Type')}</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <option value="all">{t('common:actions.filter', 'All')}</option>
            <option value="AR">AR</option>
            <option value="AP">AP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('accounting:payments.method', 'Method')}</label>
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            {METHODS.map((m) => (
              <option key={m} value={m}>{m === 'all' ? t('common:actions.filter', 'All') : t(`invoices:payment.methods.${m}`, m)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {isLoading && allPayments.length === 0 ? (
        <p className="text-center py-12 text-gray-500">{t('common:status.loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-gray-400">{t('common:status.noData')}</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">{t('invoices:payment.date', 'Date')}</th>
                <th className="py-3 px-4">{t('invoices:field.number', 'Invoice #')}</th>
                <th className="py-3 px-4">{t('accounting:payments.type', 'Type')}</th>
                <th className="py-3 px-4">{t('invoices:field.supplier', 'Customer/Supplier')}</th>
                <th className="py-3 px-4 text-right">{t('invoices:payment.amount', 'Amount')}</th>
                <th className="py-3 px-4">{t('invoices:payment.method', 'Method')}</th>
                <th className="py-3 px-4">{t('accounting:payments.recordedBy', 'Recorded By')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 px-4">{p.paymentDate || p.date}</td>
                  <td className="py-2 px-4">
                    <Link to={`/app/accounting/invoices/${p.invoiceId}`} className="text-blue-600 hover:underline">{p.invoiceNumber}</Link>
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.invoiceType === 'AR' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.invoiceType}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{p.counterpartyName}</td>
                  <td className="py-2 px-4 text-right font-medium">{fmt(p.amount)}</td>
                  <td className="py-2 px-4 text-gray-500">{t(`invoices:payment.methods.${p.method}`, p.method)}</td>
                  <td className="py-2 px-4 text-gray-500">{p.recordedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">{t('accounting:payments.showing', 'Showing {{count}} payments', { count: filtered.length })}</p>
    </div>
  );
}
