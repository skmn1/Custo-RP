import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEssProfile } from '../../hooks/useEssProfile';
import BankDetailsTab from '../../components/ess/BankDetailsTab';
import ExperienceTab from '../../components/ess/ExperienceTab';
import QualificationsTab from '../../components/ess/QualificationsTab';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import EssOfflineFallback from '../../components/ess/EssOfflineFallback';
import StaleDataIndicator from '../../components/ess/StaleDataIndicator';
import MobileProfile from '../../components/ess/profile/MobileProfile';

// ─── Tab definitions ────────────────────────────────────────

const TABS = ['overview', 'personal', 'contract', 'bank', 'experience', 'qualifications', 'changeRequests'];

// ─── Main component ─────────────────────────────────────────

const EssProfilePage = () => {
  const isMobile = useMobileLayout();
  const { t } = useTranslation('ess');
  const [activeTab, setActiveTab] = useState('overview');
  const { isOnline } = useEssConnectivity();

  const {
    profile,
    changeRequests,
    queuedRequests,
    isLoading,
    error,
    submitChangeRequest,
    cancelChangeRequest,
    addExperience,
    updateExperience,
    deleteExperience,
    addQualification,
    updateQualification,
    deleteQualification,
  } = useEssProfile();

  if (isMobile) return <MobileProfile />;

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!profile) {
    if (!isOnline) return <EssOfflineFallback />;
    return null;
  }

  const { personal, contract, bankDetails, experience, qualifications, pendingRequests, completeness } = profile;

  const tabLabel = (key) => {
    if (key === 'changeRequests') return t('profile.changeRequests.title');
    return t(`profile.tabs.${key}`);
  };

  return (
    <div>
      {/* Header with completeness */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('profile.title')}
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('profile.completenessPercent', { percent: completeness })}
          </div>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
          {pendingRequests > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {pendingRequests} pending
            </span>
          )}
        </div>
      </div>
      <StaleDataIndicator isCached={profile.__swCacheHit === true} fetchedAt={profile.__swFetchedAt} />
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <nav className="flex gap-1 -mb-px" data-cy="profile-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-cy={`tab-${tab}`}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl">
        {activeTab === 'overview' && (
          <OverviewTab personal={personal} contract={contract} bankDetails={bankDetails}
                       experience={experience} qualifications={qualifications} completeness={completeness} t={t} />
        )}
        {activeTab === 'personal' && <PersonalInfoTab personal={personal} t={t} />}
        {activeTab === 'contract' && <ContractTab contract={contract} t={t} />}
        {activeTab === 'bank' && (
          <BankDetailsTab
            bankDetails={bankDetails}
            pendingRequests={pendingRequests}
            onSubmitChange={submitChangeRequest}
            t={t}
          />
        )}
        {activeTab === 'experience' && (
          <ExperienceTab
            entries={experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
            t={t}
          />
        )}
        {activeTab === 'qualifications' && (
          <QualificationsTab
            entries={qualifications}
            onAdd={addQualification}
            onUpdate={updateQualification}
            onDelete={deleteQualification}
            t={t}
          />
        )}
        {activeTab === 'changeRequests' && (
          <ChangeRequestsTab
            requests={changeRequests}
            queuedRequests={queuedRequests}
            onCancel={cancelChangeRequest}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

// ─── Overview Tab ───────────────────────────────────────────

const OverviewTab = ({ personal, contract, bankDetails, experience, qualifications, completeness, t }) => (
  <div className="space-y-6">
    {/* Quick info card */}
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4 mb-6">
        {personal.avatar ? (
          <img src={personal.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">
            {(personal.firstName?.[0] || '') + (personal.lastName?.[0] || '')}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{personal.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{contract.jobTitle} · {contract.department}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStat label={t('profile.email')} value={personal.email || '—'} />
        <MiniStat label={t('profile.phone')} value={personal.phone || '—'} />
        <MiniStat label={t('profile.hireDate')} value={contract.hireDate || '—'} />
        <MiniStat label={t('profile.completeness')} value={`${completeness}%`} />
      </div>
    </div>

    {/* Section summaries */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard title={t('profile.bank.title')} count={bankDetails ? 1 : 0} empty={t('profile.bank.noDetails')} />
      <SummaryCard title={t('profile.experience.title')} count={experience.length} empty={t('profile.experience.noEntries')} />
      <SummaryCard title={t('profile.qualifications.title')} count={qualifications.length} empty={t('profile.qualifications.noEntries')} />
    </div>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div>
    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{value}</dd>
  </div>
);

const SummaryCard = ({ title, count, empty }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
    {count > 0 ? (
      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{count}</span>
    ) : (
      <p className="text-xs text-gray-400 dark:text-gray-500">{empty}</p>
    )}
  </div>
);

// ─── Personal Info Tab ──────────────────────────────────────

const PersonalInfoTab = ({ personal, t }) => (
  <Card>
    <SectionHeading>{t('profile.personalInfo')}</SectionHeading>
    <FieldGrid>
      <Field label={t('profile.firstName')} value={personal.firstName} />
      <Field label={t('profile.lastName')} value={personal.lastName} />
      <Field label={t('profile.email')} value={personal.email} />
      <Field label={t('profile.phone')} value={personal.phone} />
    </FieldGrid>
  </Card>
);

// ─── Contract Tab ───────────────────────────────────────────

const ContractTab = ({ contract, t }) => (
  <Card>
    <SectionHeading>{t('profile.jobInfo')}</SectionHeading>
    <FieldGrid>
      <Field label={t('profile.jobTitle')} value={contract.jobTitle} />
      <Field label={t('profile.department')} value={contract.department} />
      <Field label={t('profile.role')} value={contract.role} />
      <Field label={t('profile.hireDate')} value={contract.hireDate} />
      <Field label={t('profile.maxHours')} value={contract.maxHours != null ? `${contract.maxHours}h` : null} />
      <Field label={t('profile.status')} value={contract.status} />
    </FieldGrid>
  </Card>
);

// ─── Change Requests Tab ────────────────────────────────────

const ChangeRequestsTab = ({ requests, queuedRequests = [], onCancel, t }) => {
  // Merge server-side requests with locally queued (optimistic) entries
  const allRequests = [
    ...requests,
    ...queuedRequests.filter((q) => !requests.some((r) => r.fieldName === q.fieldName && r.status === 'pending')),
  ];

  if (allRequests.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.changeRequests.noRequests')}</p>
      </Card>
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case 'pending':   return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <SectionHeading>{t('profile.changeRequests.title')}</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-cy="change-requests-table">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 pr-4">{t('profile.changeRequests.fieldName')}</th>
              <th className="pb-2 pr-4">{t('profile.changeRequests.oldValue')}</th>
              <th className="pb-2 pr-4">{t('profile.changeRequests.newValue')}</th>
              <th className="pb-2 pr-4">{t('profile.changeRequests.status')}</th>
              <th className="pb-2 pr-4">{t('profile.changeRequests.submittedAt')}</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {allRequests.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{r.fieldLabel || r.fieldName}</td>
                <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{r.oldValue || '\u2014'}</td>
                <td className="py-2 pr-4 text-gray-900 dark:text-gray-100">{r.newValue}</td>
                <td className="py-2 pr-4">
                  {r.isQueued ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      {t('pwa.sync.queued')}
                    </span>
                  ) : r.status === 'conflict' ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {t('pwa.sync.conflictBadge')}
                    </span>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                      {t(`profile.changeRequests.statusLabels.${r.status}`)}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-500 dark:text-gray-400 text-xs">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="py-2">
                  {r.status === 'pending' && (
                    <button
                      onClick={() => onCancel(r.id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      data-cy="cancel-change-request"
                    >
                      {t('profile.changeRequests.cancel')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ─── Shared UI helpers ──────────────────────────────────────

const Card = ({ children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    {children}
  </div>
);

const SectionHeading = ({ children }) => (
  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{children}</h2>
);

const FieldGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">{children}</div>
);

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || '—'}</span>
  </div>
);

export default EssProfilePage;
