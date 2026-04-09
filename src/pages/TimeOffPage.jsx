import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import PermissionGate from '../components/ui/PermissionGate';
import Button from '../components/ui/Button';

/**
 * Time-Off Requests page.
 * - Admins / planners see the approval queue.
 * - Employees see their own requests and can submit new ones.
 */
const TimeOffPage = () => {
  const { t } = useTranslation(['timeOff', 'common', 'planning']);
  const { user, isEmployee } = useAuth();
  const [showForm, setShowForm] = useState(false);

  // Placeholder data
  const requests = [
    { id: 1, type: 'vacation', startDate: '2026-04-13', endDate: '2026-04-17', status: 'pending' },
    { id: 2, type: 'sick', startDate: '2026-03-02', endDate: '2026-03-02', status: 'approved' },
  ];

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    denied: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('timeOff:title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEmployee
              ? t('planning:timeOff.subtitleEmployee')
              : t('planning:timeOff.subtitleManager')}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {t('timeOff:btn.request')}
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('timeOff:btn.request')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('timeOff:form.type')}
              </label>
              <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="vacation">{t('timeOff:type.vacation')}</option>
                <option value="sick">{t('timeOff:type.sick')}</option>
                <option value="personal">{t('timeOff:type.personal')}</option>
                <option value="other">{t('timeOff:type.other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('timeOff:form.startDate')}
              </label>
              <input type="date" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('timeOff:form.endDate')}
              </label>
              <input type="date" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('timeOff:form.reason')}
              </label>
              <input type="text" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowForm(false)}>
              {t('timeOff:btn.submit')}
            </Button>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{t('timeOff:form.type')}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{t('timeOff:form.startDate')}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{t('timeOff:form.endDate')}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{t('common:status.pending')}</th>
              <PermissionGate permission="schedule:edit">
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{t('common:actions.edit')}</th>
              </PermissionGate>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {t(`timeOff:type.${req.type}`, { defaultValue: req.type })}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{req.startDate}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{req.endDate}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor[req.status]}`}>
                    {t(`timeOff:status.${req.status}`)}
                  </span>
                </td>
                <PermissionGate permission="schedule:edit">
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm">
                      {t('common:actions.view')}
                    </button>
                  </td>
                </PermissionGate>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeOffPage;
