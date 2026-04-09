import React from 'react';
import { useTranslation } from 'react-i18next';

const EssNotificationsPage = () => {
  const { t } = useTranslation('ess');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('notifications.title')}
        </h1>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
          {t('notifications.markAllRead')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-400 dark:text-gray-500">{t('notifications.empty')}</p>
      </div>
    </div>
  );
};

export default EssNotificationsPage;
