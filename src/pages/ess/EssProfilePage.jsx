import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../api/config';

const EssProfilePage = () => {
  const { t } = useTranslation('ess');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/ess/me')
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t('profile.title')}
      </h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 max-w-2xl">
        <Section label={t('profile.personalInfo')}>
          <Field label={t('profile.name')} value={profile ? `${profile.firstName} ${profile.lastName}` : '—'} />
          <Field label={t('profile.email')} value={profile?.email || '—'} />
          <Field label={t('profile.phone')} value={profile?.phone || '—'} />
        </Section>
        <Section label={t('profile.jobInfo')}>
          <Field label={t('profile.jobTitle')} value={profile?.jobTitle || '—'} />
          <Field label={t('profile.department')} value={profile?.department || '—'} />
          <Field label={t('profile.hireDate')} value={profile?.hireDate || '—'} />
        </Section>
      </div>
    </div>
  );
};

const Section = ({ label, children }) => (
  <div className="p-5">
    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{label}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

export default EssProfilePage;
