import React, { useState } from 'react';

/**
 * ExperienceTab — self-managed CRUD for work experience entries.
 */
const ExperienceTab = ({ entries, onAdd, onUpdate, onDelete, t }) => {
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  function emptyForm() {
    return { companyName: '', positionTitle: '', startDate: '', endDate: '', description: '', isCurrent: false, sortOrder: 0 };
  }

  const startAdd = () => {
    setForm(emptyForm());
    setEditing('new');
  };

  const startEdit = (entry) => {
    setForm({
      companyName: entry.companyName || '',
      positionTitle: entry.positionTitle || '',
      startDate: entry.startDate || '',
      endDate: entry.endDate || '',
      description: entry.description || '',
      isCurrent: entry.isCurrent || false,
      sortOrder: entry.sortOrder || 0,
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
    if (!window.confirm(t('profile.experience.confirmDelete'))) return;
    await onDelete(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('profile.experience.title')}
        </h2>
        {editing === null && (
          <button
            onClick={startAdd}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            data-cy="add-experience"
          >
            {t('profile.experience.add')}
          </button>
        )}
      </div>

      {editing !== null && (
        <ExperienceForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancel} t={t} />
      )}

      {entries.length === 0 && editing === null && (
        <p className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {t('profile.experience.noEntries')}
        </p>
      )}

      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
          data-cy="experience-entry"
        >
          {editing === entry.id ? null : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.positionTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entry.companyName}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(entry)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline" data-cy="edit-experience">
                    {t('profile.experience.edit')}
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline" data-cy="delete-experience">
                    {t('profile.experience.delete')}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {entry.startDate} — {entry.isCurrent ? t('profile.experience.present') : entry.endDate || '—'}
              </p>
              {entry.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{entry.description}</p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const ExperienceForm = ({ form, setForm, saving, onSave, onCancel, t }) => (
  <form onSubmit={onSave} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4" data-cy="experience-form">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput label={t('profile.experience.companyName')} value={form.companyName} onChange={(v) => setForm(f => ({ ...f, companyName: v }))} required />
      <FormInput label={t('profile.experience.positionTitle')} value={form.positionTitle} onChange={(v) => setForm(f => ({ ...f, positionTitle: v }))} required />
      <FormInput label={t('profile.experience.startDate')} type="date" value={form.startDate} onChange={(v) => setForm(f => ({ ...f, startDate: v }))} required />
      <FormInput label={t('profile.experience.endDate')} type="date" value={form.endDate} onChange={(v) => setForm(f => ({ ...f, endDate: v }))} disabled={form.isCurrent} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('profile.experience.description')}</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={form.isCurrent}
        onChange={(e) => setForm(f => ({ ...f, isCurrent: e.target.checked, endDate: e.target.checked ? '' : f.endDate }))}
        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
      />
      {t('profile.experience.isCurrent')}
    </label>
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

const FormInput = ({ label, value, onChange, type = 'text', required = false, disabled = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
    />
  </div>
);

export default ExperienceTab;
