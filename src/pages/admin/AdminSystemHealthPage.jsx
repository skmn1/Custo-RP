import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSystemHealth } from '../../hooks/useAdmin';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

function StatusLight({ status }) {
  if (status === 'ok') return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
  if (status === 'degraded') return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
  if (status === 'down') return <XCircleIcon className="h-5 w-5 text-red-500" />;
  return <div className="h-5 w-5 rounded-full bg-gray-300" />;
}

function statusBg(status) {
  if (status === 'ok') return 'border-green-200 bg-green-50';
  if (status === 'degraded') return 'border-amber-200 bg-amber-50';
  if (status === 'down') return 'border-red-200 bg-red-50';
  return 'border-gray-200 bg-gray-50';
}

function HealthPanel({ title, status, children }) {
  return (
    <div className={`rounded-lg border p-5 ${statusBg(status)}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <StatusLight status={status} />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value ?? '—'}</span>
    </div>
  );
}

const AdminSystemHealthPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { health, loading, error, refresh } = useSystemHealth(30000);

  const h = health || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin:system.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('admin:system.subtitle')}</p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {t('common:actions.refresh')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {loading && !health ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Status */}
            <HealthPanel title={t('admin:system.panels.apiStatus')} status={h.api?.status || 'unknown'}>
              {(h.api?.endpoints || []).map((ep, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{ep.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{ep.responseTime ? `${ep.responseTime}ms` : ''}</span>
                    <StatusLight status={ep.status} />
                  </div>
                </div>
              ))}
              {!h.api?.endpoints?.length && (
                <MetricRow label={t('admin:system.api.ping')} value={h.api?.responseTime ? `${h.api.responseTime}ms` : t(`admin:system.status.${h.api?.status || 'unknown'}`)} />
              )}
            </HealthPanel>

            {/* Database */}
            <HealthPanel title={t('admin:system.panels.database')} status={h.database?.status || 'unknown'}>
              <MetricRow label={t('admin:system.db.connections')} value={h.database?.connections} />
              <MetricRow label={t('admin:system.db.slowQueries')} value={h.database?.slowQueries} />
              <MetricRow label={t('admin:system.db.size')} value={h.database?.size} />
            </HealthPanel>

            {/* i18n Check */}
            <HealthPanel title={t('admin:system.panels.i18nCheck')} status={h.i18n?.status || 'unknown'}>
              {(h.i18n?.namespaces || []).map((ns, i) => (
                <MetricRow key={i} label={ns.name} value={ns.missingKeys} />
              ))}
              {!h.i18n?.namespaces?.length && (
                <MetricRow label={t('admin:system.i18n.missingKeys')} value={h.i18n?.totalMissing ?? '—'} />
              )}
            </HealthPanel>

            {/* App Version */}
            <HealthPanel title={t('admin:system.panels.appVersion')} status="ok">
              <MetricRow label={t('admin:system.version.current')} value={h.version?.current || import.meta.env.VITE_APP_VERSION || '1.0.0'} />
              <MetricRow label={t('admin:system.version.lastDeploy')} value={h.version?.lastDeploy ? new Date(h.version.lastDeploy).toLocaleString() : '—'} />
            </HealthPanel>

            {/* Cache */}
            <HealthPanel title={t('admin:system.panels.cache')} status={h.cache?.status || 'unknown'}>
              <MetricRow label={t('admin:system.cache.hitRate')} value={h.cache?.hitRate ? `${h.cache.hitRate}%` : '—'} />
              <MetricRow label={t('admin:system.cache.keyCount')} value={h.cache?.keyCount} />
              <MetricRow label={t('admin:system.cache.memoryUsage')} value={h.cache?.memoryUsage} />
            </HealthPanel>

            {/* Last Backup */}
            <HealthPanel title={t('admin:system.panels.lastBackup')} status={h.backup?.status || 'unknown'}>
              <MetricRow
                label={t('admin:system.backup.lastBackup')}
                value={h.backup?.lastBackup ? new Date(h.backup.lastBackup).toLocaleString() : '—'}
              />
              <MetricRow label={t('admin:system.backup.status')} value={t(`admin:system.status.${h.backup?.status || 'unknown'}`)} />
            </HealthPanel>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSystemHealthPage;
