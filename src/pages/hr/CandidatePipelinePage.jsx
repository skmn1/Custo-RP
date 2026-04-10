import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCandidates } from '../../hooks/useCandidates';
import CandidateStatusBadge from '../../components/hr/CandidateStatusBadge';
import OnboardingProgress from '../../components/hr/OnboardingProgress';

const STATUS_TABS = [
  { key: null,                 labelKey: 'candidates.status.all' },
  { key: 'new',               labelKey: 'candidates.status.new' },
  { key: 'invited',           labelKey: 'candidates.status.invited' },
  { key: 'documents_pending', labelKey: 'candidates.status.documents_pending' },
  { key: 'under_review',      labelKey: 'candidates.status.under_review' },
  { key: 'approved',          labelKey: 'candidates.status.approved' },
  { key: 'activated',         labelKey: 'candidates.status.activated' },
  { key: 'rejected',          labelKey: 'candidates.status.rejected' },
];

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const CandidatePipelinePage = () => {
  const { t } = useTranslation('hr');
  const { candidates, loading, error, statusFilter, setStatusFilter } = useCandidates();
  const [search, setSearch] = React.useState('');

  const filtered = candidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.positionTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <UserPlusIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('candidates.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          to="/app/hr/candidates/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <UserPlusIcon className="w-4 h-4" />
          {t('candidates.new')}
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key ?? 'all'}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('candidates.search')}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {t('candidates.empty')}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('candidates.table.name')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    {t('candidates.table.position')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    {t('candidates.table.contract')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    {t('candidates.table.startDate')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('candidates.table.status')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    {t('candidates.table.progress')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    {t('candidates.table.updated')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/hr/candidates/${c.id}`}
                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400"
                      >
                        {c.fullName}
                      </Link>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {c.positionTitle}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {t(`candidates.contractTypes.${c.contractType}`, c.contractType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      {formatDate(c.plannedStartDate)}
                    </td>
                    <td className="px-4 py-3">
                      <CandidateStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              c.completionPercent === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${c.completionPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {c.completionPercent || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden xl:table-cell">
                      {formatDate(c.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatePipelinePage;
