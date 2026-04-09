import React from 'react';
import { useTranslation } from 'react-i18next';

/** Formats an ISO date string as "Mon 13 Apr" */
function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Skeleton row */
const SkeletonRow = () => (
  <li className="flex items-center gap-3 py-2">
    <div className="w-20 h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
    <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
  </li>
);

/**
 * UpcomingShiftsList — compact list of the next 5 shifts from today.
 * Read-only: no action buttons, no click-to-edit.
 */
const UpcomingShiftsList = ({ upcoming, isLoading }) => {
  const { t } = useTranslation('ess');

  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 mt-5"
      data-testid="upcoming-shifts"
    >
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {t('schedule.upcoming')}
      </h2>

      {isLoading ? (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </ul>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
          {t('schedule.noUpcoming')}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800" data-testid="upcoming-list">
          {upcoming.map(shift => (
            <li key={shift.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100 w-28 shrink-0">
                {fmtDate(shift.date)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {shift.startTime}–{shift.endTime}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {t('schedule.duration', { hours: shift.duration })}
              </span>
              {shift.shiftType && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {shift.shiftType}
                </span>
              )}
              {shift.department && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {shift.department}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingShiftsList;
