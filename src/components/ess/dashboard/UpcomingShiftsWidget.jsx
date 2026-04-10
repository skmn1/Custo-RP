import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const shiftTypeBadge = {
  regular: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  overtime: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  split: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  on_call: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

const UpcomingShiftsWidget = ({ shifts, error }) => {
  const { t, i18n } = useTranslation('ess');

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (error) {
    return <WidgetError title={t('dashboard.upcomingShifts.title')} t={t} />;
  }

  const displayed = Array.isArray(shifts) ? shifts.slice(0, 5) : [];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <CalendarDaysIcon className="h-4 w-4" />
        {t('dashboard.upcomingShifts.title')}
      </h3>

      {displayed.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center flex-1 flex items-center justify-center">
          {t('dashboard.upcomingShifts.empty')}
        </p>
      ) : (
        <ul className="space-y-3 flex-1">
          {displayed.map((shift, idx) => (
            <li
              key={shift.id || idx}
              className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0"
            >
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(shift.date)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  {shift.startTime}–{shift.endTime}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {shift.shiftType && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${shiftTypeBadge[shift.shiftType] || shiftTypeBadge.regular}`}>
                      {shift.shiftType}
                    </span>
                  )}
                  {shift.department && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {shift.department}
                    </span>
                  )}
                </div>
              </div>
              {shift.duration != null && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {shift.duration}h
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/app/ess/schedule"
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-4 inline-block"
      >
        {t('dashboard.upcomingShifts.viewAll')} →
      </Link>
    </div>
  );
};

function WidgetError({ title, t }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h3>
      <p className="text-sm text-red-500 dark:text-red-400 text-center py-4">{t('dashboard.unableToLoad')}</p>
    </div>
  );
}

export default UpcomingShiftsWidget;
