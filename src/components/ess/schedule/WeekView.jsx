import React from 'react';
import { useTranslation } from 'react-i18next';
import ShiftCard from './ShiftCard';
import { getWeekStart, parseDate } from '../../../hooks/useEssSchedule';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Skeleton card shown while loading */
const ShiftSkeleton = () => (
  <div className="h-16 rounded-md bg-gray-100 animate-pulse" />
);

/**
 * Returns true if `date` falls within `leave.startDate` – `leave.endDate` (inclusive).
 */
function isOnLeave(dateStr, leave) {
  return leave.some(l => l.startDate <= dateStr && l.endDate >= dateStr);
}

function getLeavesForDate(dateStr, leave) {
  return leave.filter(l => l.startDate <= dateStr && l.endDate >= dateStr);
}

/**
 * WeekView — 7-column grid showing each day's shifts and leave overlays.
 *
 * Uses the same colour scheme as the Planning App scheduler grid for shift type bars.
 * No drag handles, no edit controls, no click-to-edit.
 */
const WeekView = ({ anchor, shifts, leave, isLoading }) => {
  const { t } = useTranslation('ess');

  const today = new Date();
  const todayStr = (() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  // Build the 7-day array starting from anchor (Monday)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${mo}-${dd}`;
    return { date: d, dateStr, dayName: DAY_NAMES[i], dayNum: d.getDate() };
  });

  // Index shifts by date
  const shiftsByDate = {};
  shifts.forEach(s => {
    if (!shiftsByDate[s.date]) shiftsByDate[s.date] = [];
    shiftsByDate[s.date].push(s);
  });

  const hasAnyShifts = shifts.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden" data-testid="week-view">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map(({ date, dayName, dayNum, dateStr }) => {
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} className="px-1 py-2 text-center border-r last:border-r-0 border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase">{dayName}</p>
              <p className={`text-sm font-semibold mt-0.5 ${
                isToday
                  ? 'w-6 h-6 rounded-xl flex items-center justify-center mx-auto text-white'
                  : 'text-gray-800'
              }`}
              style={isToday ? { backgroundColor: 'var(--mobile-tint)' } : undefined}
              >
                {dayNum}
              </p>
            </div>
          );
        })}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 min-h-[180px]">
        {weekDays.map(({ dateStr }) => {
          const dayShifts = shiftsByDate[dateStr] || [];
          const dayLeave  = getLeavesForDate(dateStr, leave);
          const onLeave   = dayLeave.length > 0;

          return (
            <div
              key={dateStr}
              className="border-r last:border-r-0 border-gray-200 p-1.5 min-h-[120px] bg-white"
            >
              {isLoading ? (
                <ShiftSkeleton />
              ) : (
                <>
                  {/* Leave overlay bar */}
                  {dayLeave.map(l => (
                    <div
                      key={l.id}
                      className="rounded mb-1 px-1.5 py-0.5 text-[10px] font-semibold text-white truncate"
                      style={{ backgroundColor: l.color || '#3B82F6' }}
                      title={l.leaveType}
                      data-testid="leave-bar"
                    >
                      {t('schedule.onLeave')}
                    </div>
                  ))}

                  {/* Shift cards */}
                  {dayShifts.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {dayShifts.map(s => (
                        <ShiftCard key={s.id} shift={s} />
                      ))}
                    </div>
                  ) : !onLeave ? (
                    <p className="text-[11px] text-gray-300 text-center pt-4">—</p>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* No shifts at all empty state */}
      {!isLoading && !hasAnyShifts && leave.length === 0 && (
        <div className="col-span-7 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
          {t('schedule.noShiftsWeek')}
        </div>
      )}
    </div>
  );
};

export default WeekView;
