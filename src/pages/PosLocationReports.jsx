import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const REPORTS = [
  { key: 'dailySales',      label: 'pos:reports.dailySales' },
  { key: 'periodSummary',   label: 'pos:reports.periodSummary' },
  { key: 'itemsSold',       label: 'pos:reports.itemsSold' },
  { key: 'sessionHistory',  label: 'pos:reports.sessionHistory' },
  { key: 'staffHours',      label: 'pos:reports.staffHours' },
  { key: 'stockSummary',    label: 'pos:reports.stockSummary' },
  { key: 'invoiceSummary',  label: 'pos:reports.invoiceSummary' },
];

const today = new Date().toISOString().split('T')[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

const PosLocationReports = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [activeReport, setActiveReport] = useState('dailySales');
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    setData(null);
    try {
      let result;
      if (activeReport === 'dailySales') {
        result = await posApi.dailySales(posLocationId, date);
      } else if (activeReport === 'periodSummary') {
        result = await posApi.periodSummary(posLocationId, from, to);
      } else if (activeReport === 'staffHours') {
        result = await posApi.getStaffHoursReport(posLocationId, from, to);
      } else if (activeReport === 'stockSummary') {
        result = await posApi.getStockSummaryReport(posLocationId, from, to);
      } else {
        result = await posApi.periodSummary(posLocationId, from, to);
      }
      setData(result?.data ?? result ?? null);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!data) return;
    const rows = Array.isArray(data) ? data : [data];
    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport}-${posLocationId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:reports.title')}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => { setActiveReport(r.key); setData(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeReport === r.key
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-600'
            }`}
          >
            {t(r.label)}
          </button>
        ))}
      </div>

      {/* Date controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {activeReport === 'dailySales' ? (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">{t('pos:reports.date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">{t('pos:reports.from')}</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">{t('pos:reports.to')}</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        )}
        <button
          onClick={fetchReport}
          className="px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          {t('pos:reports.refresh')}
        </button>
        {data && (
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg hover:border-teal-300 dark:hover:border-teal-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {t('pos:reports.exportCsv')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : data ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="text-center py-16">
          <ChartBarIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:reports.refreshHint', 'Select a report and click Refresh')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PosLocationReports;
