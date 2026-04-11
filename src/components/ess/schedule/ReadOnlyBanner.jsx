import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ReadOnlyBanner — always-visible, non-dismissible banner at the bottom
 * of the schedule calendar that makes the read-only nature unmistakably clear.
 */
const ReadOnlyBanner = () => {
  const { t } = useTranslation('ess');

  return (
    <div
      className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mt-5 text-sm text-blue-700"
      role="note"
      data-testid="read-only-banner"
    >
      <svg
        className="w-4 h-4 mt-0.5 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span>{t('schedule.readOnly')}</span>
    </div>
  );
};

export default ReadOnlyBanner;
