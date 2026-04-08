import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { posApi } from '../../api/posApi';

const CATEGORIES = ['hardware', 'software', 'connectivity', 'payment', 'power', 'safety', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const DeclareIncidentModal = ({ isOpen, onClose, posId, onCreated }) => {
  const { t } = useTranslation(['pos', 'common']);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) return;

    setSaving(true);
    setError(null);
    try {
      await posApi.createIncident(posId, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        severity: form.severity,
        declaredBy: 1,
        declaredByName: 'Current User',
      });
      setForm({ title: '', description: '', category: '', severity: 'medium' });
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create incident');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('pos:incident.declareTitle')}</h2>
          </div>

          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos:incident.field.title')} *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={200}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder={t('pos:incident.field.titlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos:incident.field.category')} *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">{t('pos:incident.selectCategory')}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`pos:incident.category.${c}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos:incident.field.severity')}</label>
              <select
                value={form.severity}
                onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{t(`pos:incident.severity.${s}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos:incident.field.description')}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                placeholder={t('pos:incident.field.descriptionPlaceholder')}
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving || !form.title.trim() || !form.category}>
              {saving ? t('pos:incident.submitting') : t('pos:incident.declare')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeclareIncidentModal;
