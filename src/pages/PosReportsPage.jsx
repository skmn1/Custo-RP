import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosReportsPage = () => {
  const { terminalId } = useParams();
  const { t } = useTranslation(['pos', 'common']);
  const [activeTab, setActiveTab] = useState('daily');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDailySales = async () => {
    setIsLoading(true);
    try {
      const { data } = await posApi.dailySales(terminalId, date);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeriodSummary = async () => {
    setIsLoading(true);
    try {
      const { data } = await posApi.periodSummary(terminalId, fromDate, toDate);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailySales();
    } else {
      fetchPeriodSummary();
    }
  }, [terminalId, activeTab]);

  const handleRefresh = () => {
    if (activeTab === 'daily') fetchDailySales();
    else fetchPeriodSummary();
  };

  const tabs = [
    { id: 'daily', label: t('pos:reports.dailySales'), icon: CalendarDaysIcon },
    { id: 'period', label: t('pos:reports.periodSummary'), icon: ChartBarIcon },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:reports.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:reports.subtitle')}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4 mb-6">
        {activeTab === 'daily' ? (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('pos:reports.date')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('pos:reports.from')}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('pos:reports.to')}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        )}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {t('pos:reports.refresh')}
        </button>
      </div>

      {/* Report content */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      )}

      {!isLoading && report && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'daily' ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('pos:reports.dailySalesFor', { date: report.date })}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('pos:reports.totalSales')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${report.totalSales}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('pos:reports.transactionCount')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.transactionCount}</p>
                </div>
              </div>
              {report.hourlySales && report.hourlySales.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pos:reports.hourlySales')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('pos:reports.noHourlyData')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('pos:reports.periodSummaryFor', { from: report.from, to: report.to })}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('pos:reports.totalSales')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${report.totalSales}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('pos:reports.totalTransactions')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.totalTransactions}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t('pos:reports.avgDailySales')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${report.avgDailySales}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PosReportsPage;
