import React from 'react';
import { useTranslation } from 'react-i18next';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const HrSkillsPage = () => {
  const { t } = useTranslation('common');

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <AcademicCapIcon className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {t('nav.skills')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Skills tracking is coming soon. This feature will allow you to manage employee competencies and certifications.
      </p>
    </div>
  );
};

export default HrSkillsPage;
