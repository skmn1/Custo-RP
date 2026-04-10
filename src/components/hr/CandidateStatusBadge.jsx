import React from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_STYLES = {
  new:                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  invited:            'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  documents_pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  under_review:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  approved:           'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  activated:          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected:           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  archived:           'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400',
};

export default function CandidateStatusBadge({ status }) {
  const { t } = useTranslation('hr');
  const style = STATUS_STYLES[status] || STATUS_STYLES.new;
  const label = t(`candidates.status.${status}`, status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
