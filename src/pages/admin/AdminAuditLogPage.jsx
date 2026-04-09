import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditLog } from '../../hooks/useAdmin';
import { exportAuditLog } from '../../api/adminApi';
import { APPS } from '../../apps/registry';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

const ACTION_TYPES = ['create', 'update', 'delete', 'login', 'logout'];

const AdminAuditLogPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { logs, loading, error, refresh } = useAuditLog();
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    actor: '',
    app: '',
    actionType: '',
    resourceType: '',
  });
  const [expandedRow, setExpandedRow] = useState(null);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const applyFilters = useCallback(() => {
    refresh(filters);
  }, [refresh, filters]);

  const handleExport = async (format) => {
    try {
      const data = await exportAuditLog(filters, format);
      // If backend returns a blob/file URL, trigger download
      if (data?.url) {
        window.open(data.url, '_blank');
      } else if (data?.content) {
        const blob = new Blob([data.content], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* error handled upstream */ }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin:auditLog.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('admin:auditLog.subtitle')}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {t('admin:auditLog.export.csv')}
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {t('admin:auditLog.export.excel')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700">{t('common:actions.filter')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin:auditLog.filters.from')}</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin:auditLog.filters.to')}</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin:auditLog.filters.actor')}</label>
              <input
                type="text"
                placeholder={t('common:actions.search')}
                value={filters.actor}
                onChange={(e) => handleFilterChange('actor', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin:auditLog.filters.app')}</label>
              <select
                value={filters.app}
                onChange={(e) => handleFilterChange('app', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              >
                <option value="">{t('admin:auditLog.filters.allApps')}</option>
                {APPS.map((a) => (
                  <option key={a.id} value={a.id}>{t(`apps:${a.id}.name`, a.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin:auditLog.filters.actionType')}</label>
              <select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              >
                <option value="">{t('admin:auditLog.filters.allActions')}</option>
                {ACTION_TYPES.map((at) => (
                  <option key={at} value={at}>{t(`admin:auditLog.actionTypes.${at}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin:auditLog.filters.resourceType')}</label>
              <input
                type="text"
                placeholder={t('admin:auditLog.filters.allResources')}
                value={filters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700"
            >
              {t('common:actions.apply')}
            </button>
          </div>
        </div>

        {/* Log Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.timestamp')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.actor')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.app')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.action')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.resourceType')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.resourceId')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:auditLog.col.ip')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(Array.isArray(logs) ? logs : []).map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(log.id)}>
                        <td className="px-4 py-3">
                          {log.changes ? (
                            expandedRow === log.id
                              ? <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                              : <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          ) : null}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{log.actor || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.app || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            log.action === 'delete' ? 'bg-red-100 text-red-700'
                            : log.action === 'create' ? 'bg-green-100 text-green-700'
                            : log.action === 'update' ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {t(`admin:auditLog.actionTypes.${log.action}`, log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.resourceType || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">{log.resourceId || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{log.ipAddress || '—'}</td>
                      </tr>
                      {expandedRow === log.id && log.changes && (
                        <tr>
                          <td colSpan="8" className="px-8 py-4 bg-gray-50">
                            <p className="text-xs font-medium text-gray-500 mb-2">{t('admin:auditLog.expandDiff')}</p>
                            <pre className="text-xs bg-white border border-gray-200 rounded p-3 overflow-x-auto max-h-48 whitespace-pre-wrap">
                              {typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        {t('common:status.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogPage;
