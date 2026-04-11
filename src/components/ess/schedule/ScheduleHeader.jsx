import React from 'react';
import { useTranslation } from 'react-i18next';
import { parseDate, getWeekStart, getWeekEnd, getMonthStart, getMonthEnd } from '../../../hooks/useEssSchedule';

/** Formats a Date as "Apr 7" */
function fmtShort(d) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Formats a Date as "April 2026" */
function fmtMonth(d) {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/**
 * ScheduleHeader — view-toggle, date-range display, and navigation arrows.
 *
 * Props:
 *   viewMode       'week' | 'month'
 *   setViewMode    (mode) => void
 *   anchor         Date — start of visible week or month
 *   onPrev         () => void
 *   onNext         () => void
 *   onToday        () => void
 */
const ScheduleHeader = ({ viewMode, setViewMode, anchor, onPrev, onNext, onToday }) => {
  const { t } = useTranslation('ess');

  const rangeLabel = (() => {
    if (viewMode === 'week') {
      const ws = getWeekStart(anchor);
      const we = getWeekEnd(ws);
      const startLabel = fmtShort(ws);
      const endLabel   = fmtShort(we);
      const year = we.getFullYear();
      return `${startLabel} – ${endLabel}, ${year}`;
    }
    return fmtMonth(anchor);
  })();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">
        {t('schedule.title')}
      </h1>

      <div className="flex items-center gap-2 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('schedule.viewWeek')}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('schedule.viewMonth')}
          </button>
        </div>

        {/* Today button */}
        <button
          type="button"
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {t('schedule.today')}
        </button>

        {/* Prev / label / Next */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous period"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="min-w-[160px] text-center text-sm font-medium text-gray-700">
            {rangeLabel}
          </span>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next period"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeader;
