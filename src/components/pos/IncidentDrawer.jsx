import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { posApi } from '../../api/posApi';

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const IncidentDrawer = ({ incident, posId, onClose, onUpdated }) => {
  const { t } = useTranslation(['pos', 'common']);
  const [updating, setUpdating] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleResolve = async () => {
    setUpdating(true);
    try {
      await posApi.updateIncident(posId, incident.id, {
        status: 'resolved',
        resolutionNote: resolutionNote || null,
        resolvedBy: 1,
        resolvedByName: 'Current User',
      });
      onUpdated();
    } catch {
      // handled silently
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = async () => {
    setUpdating(true);
    try {
      await posApi.updateIncident(posId, incident.id, { status: 'closed' });
      onUpdated();
    } catch {
      // handled silently
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await posApi.updateIncident(posId, incident.id, { status });
      onUpdated();
    } catch {
      // handled silently
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/20" />
      <div
        className="w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{t('pos:incident.detail')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5">
          {/* Title + badges */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{incident.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[incident.status] || ''}`}>
                {t(`pos:incident.status.${incident.status}`)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[incident.severity] || ''}`}>
                {t(`pos:incident.severity.${incident.severity}`)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {t(`pos:incident.category.${incident.category}`)}
              </span>
            </div>
          </div>

          {/* Description */}
          {incident.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('pos:incident.field.description')}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{incident.description}</p>
            </div>
          )}

          {/* Metadata */}
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500">{t('pos:incident.field.declaredBy')}</dt>
              <dd className="text-sm text-gray-900">{incident.declaredByName || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">{t('pos:incident.field.declaredAt')}</dt>
              <dd className="text-sm text-gray-900">
                {incident.declaredAt ? new Date(incident.declaredAt).toLocaleString() : '—'}
              </dd>
            </div>
            {incident.assignedToName && (
              <div>
                <dt className="text-xs font-medium text-gray-500">{t('pos:incident.field.assignedTo')}</dt>
                <dd className="text-sm text-gray-900">{incident.assignedToName}</dd>
              </div>
            )}
            {incident.resolvedByName && (
              <div>
                <dt className="text-xs font-medium text-gray-500">{t('pos:incident.field.resolvedBy')}</dt>
                <dd className="text-sm text-gray-900">{incident.resolvedByName}</dd>
              </div>
            )}
            {incident.resolvedAt && (
              <div>
                <dt className="text-xs font-medium text-gray-500">{t('pos:incident.field.resolvedAt')}</dt>
                <dd className="text-sm text-gray-900">{new Date(incident.resolvedAt).toLocaleString()}</dd>
              </div>
            )}
            {incident.resolutionNote && (
              <div>
                <dt className="text-xs font-medium text-gray-500">{t('pos:incident.field.resolutionNote')}</dt>
                <dd className="text-sm text-gray-700 whitespace-pre-wrap">{incident.resolutionNote}</dd>
              </div>
            )}
          </dl>

          {/* Actions */}
          {(incident.status === 'open' || incident.status === 'in_progress') && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700">{t('pos:incident.actions')}</h4>

              {incident.status === 'open' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updating}
                >
                  {t('pos:incident.action.startProgress')}
                </Button>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t('pos:incident.field.resolutionNote')}
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder={t('pos:incident.resolutionNotePlaceholder')}
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleResolve}
                disabled={updating}
              >
                {t('pos:incident.action.resolve')}
              </Button>
            </div>
          )}

          {incident.status === 'resolved' && (
            <div className="pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleClose}
                disabled={updating}
              >
                {t('pos:incident.action.close')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDrawer;
