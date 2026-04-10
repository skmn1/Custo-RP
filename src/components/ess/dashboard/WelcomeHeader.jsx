import React from 'react';
import { useTranslation } from 'react-i18next';

const WelcomeHeader = ({ firstName, photoUrl }) => {
  const { t, i18n } = useTranslation('ess');

  const formattedDate = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={firstName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-800"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-200 dark:ring-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('dashboard.welcome', { firstName })} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
