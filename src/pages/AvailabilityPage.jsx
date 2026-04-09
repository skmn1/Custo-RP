import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import PermissionGate from '../components/ui/PermissionGate';

/**
 * Employee Availability management page.
 * - Admins / planners see all employees' availability.
 * - Employees see only their own availability.
 */
const AvailabilityPage = () => {
  const { t } = useTranslation(['planning', 'common']);
  const { user, isEmployee } = useAuth();

  const days = [
    t('common:time.day'),
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('planning:availability.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isEmployee
            ? t('planning:availability.subtitleEmployee')
            : t('planning:availability.subtitleManager')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-8 gap-2 text-sm">
          {/* Header row */}
          {days.map((d, i) => (
            <div key={i} className="font-medium text-gray-500 dark:text-gray-400 text-center py-2">
              {d}
            </div>
          ))}
          {/* Placeholder rows */}
          {['Morning', 'Afternoon', 'Evening'].map((slot) => (
            <React.Fragment key={slot}>
              <div className="text-gray-700 dark:text-gray-300 py-3 font-medium">
                {t(`planning:availability.${slot.toLowerCase()}`, { defaultValue: slot })}
              </div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="py-3 text-center rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                >
                  ✓
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <PermissionGate permission="schedule:edit">
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
              {t('common:actions.save')}
            </button>
          </div>
        </PermissionGate>
      </div>
    </div>
  );
};

export default AvailabilityPage;
