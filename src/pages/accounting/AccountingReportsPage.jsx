import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoices } from '../../hooks/useInvoices';

const fmt = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount ?? 0);

const REPORT_TYPES = ['revenue', 'expenses', 'tax', 'outstanding'];

export default function AccountingReportsPage() {
  const { t } = useTranslation(['accounting', 'invoices', 'common']);
  const { invoices, fetchInvoices, isLoading } = useInvoices();
  const [activeReport, setActiveReport] = useState('revenue');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const arInvoices = useMemo(() => invoices.filter((i) => i.type === 'AR'), [invoices]);
  const apInvoices = useMemo(() => invoices.filter((i) => i.type === 'AP'), [invoices]);

  /* ── Revenue Report: AR totals by month ── */
  const revenueData = useMemo(() => {
    const map = {};
    arInvoices.filter((i) => i.status === 'paid').forEach((i) => {
      const m = (i.issueDate || '').slice(0, 7);
      if (!m) return;
      map[m] = (map[m] || 0) + (i.totalAmount ?? 0);
    });
    return Object.entries(map).sort().map(([month, total]) => ({ month, total }));
  }, [arInvoices]);

  /* ── Expense Report: AP totals by month ── */
  const expenseData = useMemo(() => {
    const map = {};
    apInvoices.filter((i) => i.status === 'paid').forEach((i) => {
      const m = (i.issueDate || '').slice(0, 7);
      if (!m) return;
      map[m] = (map[m] || 0) + (i.totalAmount ?? 0);
    });
    return Object.entries(map).sort().map(([month, total]) => ({ month, total }));
  }, [apInvoices]);

  /* ── Tax summary: tax collected (AR) vs tax paid (AP) ── */
  const taxData = useMemo(() => {
    const collectedMap = {};
    const paidMap = {};
    arInvoices.forEach((i) => {
      const m = (i.issueDate || '').slice(0, 7);
      if (!m) return;
      collectedMap[m] = (collectedMap[m] || 0) + (i.taxAmount ?? 0);
    });
    apInvoices.forEach((i) => {
      const m = (i.issueDate || '').slice(0, 7);
      if (!m) return;
      paidMap[m] = (paidMap[m] || 0) + (i.taxAmount ?? 0);
    });
    const months = [...new Set([...Object.keys(collectedMap), ...Object.keys(paidMap)])].sort();
    return months.map((m) => ({ month: m, collected: collectedMap[m] || 0, paid: paidMap[m] || 0, net: (collectedMap[m] || 0) - (paidMap[m] || 0) }));
  }, [arInvoices, apInvoices]);

  /* ── Outstanding balances ── */
  const outstandingData = useMemo(() => {
    return invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && (i.amountOutstanding ?? 0) > 0)
      .sort((a, b) => (b.amountOutstanding ?? 0) - (a.amountOutstanding ?? 0));
  }, [invoices]);

  /* ── CSV export helper ── */
  const exportCsv = (headers, rows, filename) => {
    const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = () => {
    if (activeReport === 'revenue') {
      exportCsv(['Month', 'Revenue'], revenueData.map((r) => [r.month, r.total]), 'revenue-report.csv');
    } else if (activeReport === 'expenses') {
      exportCsv(['Month', 'Expenses'], expenseData.map((r) => [r.month, r.total]), 'expense-report.csv');
    } else if (activeReport === 'tax') {
      exportCsv(['Month', 'Tax Collected', 'Tax Paid', 'Net'], taxData.map((r) => [r.month, r.collected, r.paid, r.net]), 'tax-summary.csv');
    } else if (activeReport === 'outstanding') {
      exportCsv(
        ['Invoice #', 'Customer', 'Due Date', 'Outstanding', 'Days'],
        outstandingData.map((i) => [i.invoiceNumber, i.counterpartyName, i.dueDate, i.amountOutstanding, Math.max(0, Math.floor((new Date() - new Date(i.dueDate)) / 86400000))]),
        'outstanding-balances.csv',
      );
    }
  };

  if (isLoading && invoices.length === 0) {
    return <div className="text-center py-12 text-gray-500">{t('common:status.loading')}</div>;
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounting:reports.title', 'Accounting Reports')}</h1>
        <button onClick={handleExport} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          {t('common:actions.export', 'Export CSV')}
        </button>
      </div>

      {/* ── Report tabs ── */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {REPORT_TYPES.map((rt) => (
          <button key={rt} onClick={() => setActiveReport(rt)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeReport === rt ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t(`accounting:reports.${rt}`, rt)}
          </button>
        ))}
      </div>

      {/* ── Revenue ── */}
      {activeReport === 'revenue' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">{t('accounting:reports.month', 'Month')}</th>
                <th className="py-3 px-4 text-right">{t('accounting:reports.revenueTotal', 'Revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((r) => (
                <tr key={r.month} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-4">{r.month}</td>
                  <td className="py-2 px-4 text-right font-medium">{fmt(r.total)}</td>
                </tr>
              ))}
              {revenueData.length === 0 && (
                <tr><td colSpan={2} className="py-8 text-center text-gray-400">{t('common:status.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Expenses ── */}
      {activeReport === 'expenses' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">{t('accounting:reports.month', 'Month')}</th>
                <th className="py-3 px-4 text-right">{t('accounting:reports.expenseTotal', 'Expenses')}</th>
              </tr>
            </thead>
            <tbody>
              {expenseData.map((r) => (
                <tr key={r.month} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-4">{r.month}</td>
                  <td className="py-2 px-4 text-right font-medium">{fmt(r.total)}</td>
                </tr>
              ))}
              {expenseData.length === 0 && (
                <tr><td colSpan={2} className="py-8 text-center text-gray-400">{t('common:status.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tax Summary ── */}
      {activeReport === 'tax' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-x-auto" data-testid="tax-summary">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">{t('accounting:reports.month', 'Month')}</th>
                <th className="py-3 px-4 text-right">{t('accounting:reports.taxCollected', 'Tax Collected (AR)')}</th>
                <th className="py-3 px-4 text-right">{t('accounting:reports.taxPaid', 'Tax Paid (AP)')}</th>
                <th className="py-3 px-4 text-right">{t('accounting:reports.taxNet', 'Net VAT')}</th>
              </tr>
            </thead>
            <tbody>
              {taxData.map((r) => (
                <tr key={r.month} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-4">{r.month}</td>
                  <td className="py-2 px-4 text-right font-medium text-green-600">{fmt(r.collected)}</td>
                  <td className="py-2 px-4 text-right font-medium text-red-600">{fmt(r.paid)}</td>
                  <td className="py-2 px-4 text-right font-bold">{fmt(r.net)}</td>
                </tr>
              ))}
              {taxData.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('common:status.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Outstanding Balances ── */}
      {activeReport === 'outstanding' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">{t('invoices:field.number', '#')}</th>
                <th className="py-3 px-4">{t('invoices:field.supplier', 'Customer')}</th>
                <th className="py-3 px-4">{t('invoices:field.dueDate', 'Due Date')}</th>
                <th className="py-3 px-4">{t('accounting:aging.daysOverdue', 'Days')}</th>
                <th className="py-3 px-4 text-right">{t('invoices:field.outstanding', 'Outstanding')}</th>
              </tr>
            </thead>
            <tbody>
              {outstandingData.map((i) => (
                <tr key={i.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-4 text-blue-600">{i.invoiceNumber}</td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{i.counterpartyName}</td>
                  <td className="py-2 px-4">{i.dueDate}</td>
                  <td className="py-2 px-4 text-red-600">{Math.max(0, Math.floor((new Date() - new Date(i.dueDate)) / 86400000))}</td>
                  <td className="py-2 px-4 text-right font-medium">{fmt(i.amountOutstanding)}</td>
                </tr>
              ))}
              {outstandingData.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common:status.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
