import React, { useState } from 'react';

/**
 * QualificationsTab — self-managed CRUD for qualifications & certifications
 * with expiry tracking (expired = red, expiring soon = amber).
 */
const QualificationsTab = ({ entries, onAdd, onUpdate, onDelete, t }) => {
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  function emptyForm() {
    return { name: '', issuingBody: '', dateObtained: '', expiryDate: '', credentialNumber: '', documentKey: '' };
  }

  const startAdd = () => { setForm(emptyForm()); setEditing('new'); };

  const startEdit = (entry) => {
    setForm({
      name: entry.name || '',
      issuingBody: entry.issuingBody || '',
      dateObtained: entry.dateObtained || '',
      expiryDate: entry.expiryDate || '',
      credentialNumber: entry.credentialNumber || '',
      documentKey: entry.documentKey || '',
    });
    setEditing(entry.id);
  };

  const cancel = () => { setEditing(null); setForm(emptyForm()); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await onAdd(form);
      } else {
        await onUpdate(editing, form);
      }
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('profile.qualifications.confirmDelete'))) return;
    await onDelete(id);
  };

  const expiryBadge = (entry) => {
    if (entry.isExpired) {
      return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{t('profile.qualifications.expired')}</span>;
    }
    if (entry.isExpiringSoon) {
      return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{t('profile.qualifications.expiringSoon')}</span>;
    }
    if (entry.expiryDate) {
      return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{t('profile.qualifications.valid')}</span>;
    }
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t('profile.qualifications.noExpiry')}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('profile.qualifications.title')}
        </h2>
        {editing === null && (
          <button
            onClick={startAdd}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            data-cy="add-qualification"
          >
            {t('profile.qualifications.add')}
          </button>
        )}
      </div>

      {editing !== null && (
        <QualificationForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancel} t={t} />
      )}

      {entries.length === 0 && editing === null && (
        <p className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {t('profile.qualifications.noEntries')}
        </p>
      )}

      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
          data-cy="qualification-entry"
        >
          {editing === entry.id ? null : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.name}</h3>
                    {expiryBadge(entry)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entry.issuingBody}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(entry)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline" data-cy="edit-qualification">
                    {t('profile.qualifications.edit')}
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline" data-cy="delete-qualification">
                    {t('profile.qualifications.delete')}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex gap-6 text-xs text-gray-500 dark:text-gray-400">
                <span>{t('profile.qualifications.dateObtained')}: {entry.dateObtained || '—'}</span>
                {entry.expiryDate && <span>{t('profile.qualifications.expiryDate')}: {entry.expiryDate}</span>}
                {entry.credentialNumber && <span>#{entry.credentialNumber}</span>}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const QualificationForm = ({ form, setForm, saving, onSave, onCancel, t }) => (
  <form onSubmit={onSave} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4" data-cy="qualification-form">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput label={t('profile.qualifications.name')} value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} required />
      <FormInput label={t('profile.qualifications.issuingBody')} value={form.issuingBody} onChange={(v) => setForm(f => ({ ...f, issuingBody: v }))} required />
      <FormInput label={t('profile.qualifications.dateObtained')} type="date" value={form.dateObtained} onChange={(v) => setForm(f => ({ ...f, dateObtained: v }))} required />
      <FormInput label={t('profile.qualifications.expiryDate')} type="date" value={form.expiryDate} onChange={(v) => setForm(f => ({ ...f, expiryDate: v }))} />
      <FormInput label={t('profile.qualifications.credentialNumber')} value={form.credentialNumber} onChange={(v) => setForm(f => ({ ...f, credentialNumber: v }))} />
    </div>
    <div className="flex gap-2">
      <button type="submit" disabled={saving}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors">
        {t('profile.actions.save')}
      </button>
      <button type="button" onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
        {t('profile.actions.cancel')}
      </button>
    </div>
  </form>
);

const FormInput = ({ label, value, onChange, type = 'text', required = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>
);

export default QualificationsTab;
