import React from 'react';
import { useTranslation } from 'react-i18next';
import { StarIcon } from '@heroicons/react/24/outline';

const HrPerformancePage = () => {
  const { t } = useTranslation('common');

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <StarIcon className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {t('nav.performance')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Performance evaluations are coming soon. This feature will enable goal setting, reviews, and performance tracking.
      </p>
    </div>
  );
};

export default HrPerformancePage;
