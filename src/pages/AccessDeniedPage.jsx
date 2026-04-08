import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon, HomeIcon } from '@heroicons/react/24/outline';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['apps', 'common']);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <LockClosedIcon className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('apps:accessDenied.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('apps:accessDenied.message')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          {t('apps:accessDenied.back')}
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
