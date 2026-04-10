import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfileWidget = ({ completeness, pendingRequests, error }) => {
  const { t } = useTranslation('ess');

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          {t('dashboard.profile.title')}
        </h3>
        <p className="text-sm text-red-500 dark:text-red-400 text-center py-4">{t('dashboard.unableToLoad')}</p>
      </div>
    );
  }

  const pct = completeness ?? 0;
  const pending = pendingRequests ?? 0;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <UserCircleIcon className="h-4 w-4" />
        {t('dashboard.profile.title')}
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center py-2">
        {/* Circular progress indicator */}
        <div className="relative w-20 h-20 mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
              className="text-indigo-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-gray-100">
            {pct}%
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('profile.completenessPercent', { percent: pct })}
        </p>

        {pending > 0 && (
          <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            {t('dashboard.profile.pendingRequests', { n: pending })}
          </span>
        )}
      </div>

      <Link
        to="/app/ess/profile"
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-4 inline-block"
      >
        {t('dashboard.profile.viewProfile')} →
      </Link>
    </div>
  );
};

export default ProfileWidget;
