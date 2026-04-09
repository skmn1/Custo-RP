import React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../components/ui/PermissionGate';
import Button from '../components/ui/Button';

/**
 * Recurring Shift Templates page.
 * Roles: super_admin, hr_manager, planner.
 */
const TemplatesPage = () => {
  const { t } = useTranslation(['planning', 'common', 'scheduler']);

  // Placeholder templates
  const templates = [
    { id: 1, name: 'Morning Rotation', days: 'Mon–Fri', time: '06:00–14:00', department: 'Sales', employees: 4 },
    { id: 2, name: 'Evening Cover', days: 'Mon–Sat', time: '14:00–22:00', department: 'Service', employees: 3 },
    { id: 3, name: 'Weekend Night', days: 'Sat–Sun', time: '22:00–06:00', department: 'Warehouse', employees: 2 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('planning:templates.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('planning:templates.subtitle')}
          </p>
        </div>
        <PermissionGate permission="schedule:create">
          <Button variant="primary" size="sm">
            {t('planning:templates.create')}
          </Button>
        </PermissionGate>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t('planning:templates.name')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t('planning:templates.days')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t('scheduler:startTime')} – {t('scheduler:endTime')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t('scheduler:department')}
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t('planning:templates.employees')}
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tmpl) => (
              <tr key={tmpl.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tmpl.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{tmpl.days}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{tmpl.time}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {t(`scheduler:departments.${tmpl.department}`, { defaultValue: tmpl.department })}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{tmpl.employees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TemplatesPage;
