import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useEssAttendance } from '../../hooks/useEssAttendance';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import StaleDataIndicator from '../../components/ess/StaleDataIndicator';
import EssOfflineFallback from '../../components/ess/EssOfflineFallback';
import OfflineDisabled from '../../components/ess/OfflineDisabled';
import MobileAttendance from '../../components/ess/attendance/MobileAttendance';

// ─── Status badge colors ────────────────────────────────────

const STATUS_COLORS = {
  present:  'bg-green-100 text-green-800',
  absent:   'bg-red-100 text-red-800',
  late:     'bg-yellow-100 text-yellow-800',
  half_day: 'bg-orange-100 text-orange-800',
  on_leave: 'bg-blue-100 text-blue-800',
  holiday:  'bg-purple-100 text-purple-800',
};

const ALL_STATUSES = ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'];

// ─── Helpers ────────────────────────────────────────────────

function getMonthRange(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  const year = d.getFullYear();
  const month = d.getMonth();
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

function formatMonthLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
}

// ─── Main component ─────────────────────────────────────────

const EssAttendancePage = () => {
  const isMobile = useMobileLayout();
  const { t } = useTranslation('ess');
  const {
    records,
    summary,
    period,
    isLoading,
    error,
    fetchAll,
    exportCsv,
  } = useEssAttendance();
  const { isOnline } = useEssConnectivity();

  if (isMobile) return <MobileAttendance />;

  const isCached = records?.__swCacheHit === true || summary?.__swCacheHit === true;
  const fetchedAt = records?.__swFetchedAt ?? summary?.__swFetchedAt ?? null;

  const [monthOffset, setMonthOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Period navigation
  const navigateMonth = useCallback((offset) => {
    setMonthOffset(offset);
    const { from, to } = getMonthRange(offset);
    fetchAll(from, to, statusFilter);
  }, [fetchAll, statusFilter]);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    const { from, to } = getMonthRange(monthOffset);
    fetchAll(from, to, status);
  }, [fetchAll, monthOffset]);

  const handleExport = useCallback(() => {
    const { from, to } = getMonthRange(monthOffset);
    exportCsv(from, to);
  }, [exportCsv, monthOffset]);

  // Filtered records for display
  const displayRecords = useMemo(() => records || [], [records]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!isOnline && !records?.length && !isLoading) {
    return <EssOfflineFallback />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('attendance.title')}
        </h1>
        <StaleDataIndicator isCached={isCached} fetchedAt={fetchedAt} />
        <OfflineDisabled fallbackTooltip={t('pwa.offline.downloadDisabled', 'Download is unavailable offline')}>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
            {t('attendance.exportCsv')}
          </button>
        </OfflineDisabled>
      </div>

      {/* Period navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(monthOffset - 1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label={t('attendance.previousMonth')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-semibold text-gray-900">
          {formatMonthLabel(period.from)}
        </span>
        <button
          onClick={() => navigateMonth(monthOffset + 1)}
          disabled={monthOffset >= 0}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label={t('attendance.attendanceRate')}
            value={`${summary.attendanceRate}%`}
            accent="text-indigo-600"
          />
          <SummaryCard
            label={t('attendance.totalHours')}
            value={`${Number(summary.totalHours).toFixed(1)}h`}
            accent="text-emerald-600"
          />
          <SummaryCard
            label={t('attendance.overtimeHours')}
            value={`${Number(summary.overtimeHours).toFixed(1)}h`}
            accent="text-amber-600"
          />
          <SummaryCard
            label={t('attendance.daysAbsent')}
            value={summary.daysAbsent}
            accent="text-red-600"
          />
        </div>
      )}

      {/* Status Breakdown */}
      {summary?.breakdown && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {t('attendance.statusBreakdown')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {ALL_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s]}`}>
                  {t(`attendance.statusLabels.${s}`)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {summary.breakdown[s] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-600">
          {t('attendance.filterByStatus')}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-1.5 text-gray-900"
        >
          <option value="">{t('attendance.allStatuses')}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`attendance.statusLabels.${s}`)}</option>
          ))}
        </select>
      </div>

      {/* Daily log table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">
            {t('attendance.dailyLog')}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            {t('attendance.loading')}
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('attendance.noRecords')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">{t('attendance.date')}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{t('attendance.status')}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{t('attendance.scheduledTime')}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{t('attendance.actualTime')}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">{t('attendance.hours')}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">{t('attendance.overtime')}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{t('attendance.notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {formatDate(rec.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rec.status] || 'bg-gray-100 text-gray-800'}`}>
                        {t(`attendance.statusLabels.${rec.status}`, rec.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {rec.scheduledStart && rec.scheduledEnd
                        ? `${rec.scheduledStart} – ${rec.scheduledEnd}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {rec.actualStart && rec.actualEnd
                        ? `${rec.actualStart} – ${rec.actualEnd}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {rec.actualHours != null ? `${Number(rec.actualHours).toFixed(1)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">
                      {rec.overtimeHours > 0 ? `+${Number(rec.overtimeHours).toFixed(1)}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                      {rec.notes || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────

const SummaryCard = ({ label, value, accent }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
    <p className={`text-2xl font-bold ${accent}`}>{value}</p>
  </div>
);

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  return `${weekday}, ${month} ${day}`;
}

export default EssAttendancePage;
