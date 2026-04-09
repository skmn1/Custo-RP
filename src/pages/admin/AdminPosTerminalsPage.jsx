import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminTerminals, useAdminUsers } from '../../hooks/useAdmin';
import {
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// ── Terminal Form Modal ───────────────────────────────────────────

function TerminalFormModal({ terminal, onClose, onSave, t }) {
  const [form, setForm] = useState({
    name: terminal?.name || '',
    location: terminal?.location || '',
    description: terminal?.description || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch { /* handled upstream */ }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {terminal ? t('admin:terminals.actions.edit') : t('admin:terminals.newTerminal')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:terminals.form.name')}</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:terminals.form.location')}</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:terminals.form.description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              {t('common:actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {t('common:actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assignment Modal ──────────────────────────────────────────────

function AssignmentModal({ terminal, onClose, t }) {
  const { users } = useAdminUsers();
  const posManagers = users.filter((u) => u.role === 'pos_manager' && u.isActive !== false);
  const assigned = terminal.managers || [];
  const [selected, setSelected] = useState(new Set(assigned.map((m) => m.id || m)));

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('admin:terminals.actions.manageAssignments')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{terminal.name}</p>
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {posManagers.map((pm) => (
            <label key={pm.id} className="flex items-center py-2 cursor-pointer hover:bg-gray-50 px-2 rounded">
              <input
                type="checkbox"
                checked={selected.has(pm.id)}
                onChange={() => toggle(pm.id)}
                className="h-4 w-4 text-slate-600 rounded border-gray-300 focus:ring-slate-500"
              />
              <span className="ml-3 text-sm text-gray-900">{pm.firstName} {pm.lastName}</span>
              <span className="ml-auto text-xs text-gray-400">{pm.email}</span>
            </label>
          ))}
          {posManagers.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">{t('common:status.noData')}</p>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700">
            {t('common:actions.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

const AdminPosTerminalsPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { terminals, loading, error, create, update, deactivate } = useAdminTerminals();
  const [showForm, setShowForm] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState(null);
  const [assignmentTerminal, setAssignmentTerminal] = useState(null);

  const handleSave = async (data) => {
    if (editingTerminal) {
      await update(editingTerminal.id, data);
    } else {
      await create(data);
    }
  };

  const handleDeactivate = async (term) => {
    if (window.confirm(t('admin:terminals.actions.confirmDeactivate'))) {
      await deactivate(term.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin:terminals.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('admin:terminals.subtitle')}</p>
            </div>
            <button
              onClick={() => { setEditingTerminal(null); setShowForm(true); }}
              className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('admin:terminals.newTerminal')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:terminals.col.name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:terminals.col.location')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:terminals.col.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:terminals.col.managers')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:terminals.col.lastSession')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin:terminals.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {terminals.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{term.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{term.location || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        term.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {term.active !== false ? t('admin:terminals.status.active') : t('admin:terminals.status.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(term.managers || []).map((m, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
                            {m.name || m.firstName || m}
                          </span>
                        ))}
                        {(!term.managers || term.managers.length === 0) && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {term.lastSession ? new Date(term.lastSession).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingTerminal(term); setShowForm(true); }}
                          className="text-slate-600 hover:text-slate-800"
                          title={t('admin:terminals.actions.edit')}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAssignmentTerminal(term)}
                          className="text-teal-600 hover:text-teal-800"
                          title={t('admin:terminals.actions.manageAssignments')}
                        >
                          <UserGroupIcon className="h-4 w-4" />
                        </button>
                        {term.active !== false && (
                          <button
                            onClick={() => handleDeactivate(term)}
                            className="text-red-600 hover:text-red-800"
                            title={t('admin:terminals.actions.deactivate')}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {terminals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {t('common:status.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <TerminalFormModal
          terminal={editingTerminal}
          onClose={() => { setShowForm(false); setEditingTerminal(null); }}
          onSave={handleSave}
          t={t}
        />
      )}

      {assignmentTerminal && (
        <AssignmentModal
          terminal={assignmentTerminal}
          onClose={() => setAssignmentTerminal(null)}
          t={t}
        />
      )}
    </div>
  );
};

export default AdminPosTerminalsPage;
