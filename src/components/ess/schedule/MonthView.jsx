import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ShiftCard from './ShiftCard';
import { getMonthStart, getMonthEnd, getWeekStart } from '../../../hooks/useEssSchedule';

const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * MonthView — compact calendar grid with shift dots and leave overlays.
 *
 * Clicking a day expands an inline detail panel showing full shift cards.
 * No edit, create, drag, or context-menu actions — strictly read-only.
 */
const MonthView = ({ anchor, shifts, leave, isLoading }) => {
  const { t } = useTranslation('ess');
  const [expandedDate, setExpandedDate] = useState(null);

  const monthStart = getMonthStart(anchor);
  const monthEnd   = getMonthEnd(anchor);

  // Grid starts on Monday of the week containing the 1st
  const gridStart = getWeekStart(monthStart);

  // Build flat array of calendar cells (up to 6 weeks)
  const cells = [];
  const cur = new Date(gridStart);
  while (cur <= monthEnd || cells.length % 7 !== 0) {
    cells.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
    if (cells.length > 42) break; // safety limit (6 weeks)
  }

  // Index data by date string
  const shiftsByDate = {};
  shifts.forEach(s => {
    if (!shiftsByDate[s.date]) shiftsByDate[s.date] = [];
    shiftsByDate[s.date].push(s);
  });

  const today = new Date();
  const todayStr = fmt(today);

  const handleDayClick = (dateStr) => {
    setExpandedDate(prev => prev === dateStr ? null : dateStr);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" data-testid="month-view">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {DAY_NAMES_SHORT.map(name => (
          <div key={name} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {name}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-16 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="m-1 h-10 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7">
            {cells.map((cell) => {
              const dateStr = fmt(cell);
              const isCurrentMonth = cell.getMonth() === anchor.getMonth();
              const isToday = dateStr === todayStr;
              const dayShifts = shiftsByDate[dateStr] || [];
              const dayLeave = leave.filter(l => l.startDate <= dateStr && l.endDate >= dateStr);
              const hasShifts = dayShifts.length > 0;
              const isExpanded = expandedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => (hasShifts || dayLeave.length > 0) ? handleDayClick(dateStr) : undefined}
                  className={`min-h-[64px] border border-gray-100 dark:border-gray-800 p-1 
                    ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-900/50'}
                    ${(hasShifts || dayLeave.length > 0) ? 'cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10' : 'cursor-default'}
                    ${isExpanded ? 'ring-2 ring-inset ring-indigo-400' : ''}
                  `}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-semibold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                        : isCurrentMonth
                          ? 'text-gray-700 dark:text-gray-200'
                          : 'text-gray-300 dark:text-gray-600'
                    }`}>
                      {cell.getDate()}
                    </span>
                  </div>

                  {/* Leave bars */}
                  {dayLeave.map(l => (
                    <div
                      key={l.id}
                      className="rounded text-[9px] font-semibold text-white px-1 truncate mb-0.5"
                      style={{ backgroundColor: l.color || '#3B82F6' }}
                      data-testid="leave-bar"
                    >
                      {t('schedule.onLeave')}
                    </div>
                  ))}

                  {/* Shift dot(s) */}
                  {dayShifts.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {dayShifts.map(s => (
                        <span
                          key={s.id}
                          className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 block"
                          title={`${s.startTime}–${s.endTime}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expanded day detail panel */}
          {expandedDate && shiftsByDate[expandedDate] && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {new Date(...expandedDate.split('-').map((v, i) => i === 1 ? v - 1 : v))
                    .toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <button
                  type="button"
                  onClick={() => setExpandedDate(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-2 max-w-sm">
                {(shiftsByDate[expandedDate] || []).map(s => (
                  <ShiftCard key={s.id} shift={s} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthView;
