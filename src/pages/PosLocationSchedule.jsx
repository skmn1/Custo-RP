import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosLocationSchedule = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default to current week
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d) => d.toISOString().split('T')[0];

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .getSchedule(posLocationId, fmt(weekStart), fmt(weekEnd))
      .then((result) => {
        if (!cancelled) setShifts(result?.data ?? result ?? []);
      })
      .catch(() => {
        if (!cancelled) setShifts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [posLocationId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:schedule.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {fmt(weekStart)} — {fmt(weekEnd)}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-16">
          <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:schedule.noShifts')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common:employee', 'Employee')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common:date', 'Date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common:time', 'Time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{shift.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{shift.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {shift.startTime} — {shift.endTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PosLocationSchedule;
