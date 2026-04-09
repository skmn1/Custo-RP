import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../api/config';

const EssSchedulePage = () => {
  const { t } = useTranslation('ess');
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/ess/schedule')
      .then((res) => setShifts(res.data || []))
      .catch(() => setShifts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t('schedule.title')}
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : shifts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-12 text-center">{t('schedule.noShifts')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">{t('schedule.shift')}</th>
                <th className="px-4 py-3 text-left">{t('schedule.start')}</th>
                <th className="px-4 py-3 text-left">{t('schedule.end')}</th>
                <th className="px-4 py-3 text-left">{t('schedule.duration')}</th>
                <th className="px-4 py-3 text-left">{t('schedule.department')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {shifts.map((s) => (
                <tr key={s.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{s.date}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.startTime}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.endTime}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.duration}h</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EssSchedulePage;
