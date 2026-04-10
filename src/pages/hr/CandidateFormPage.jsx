import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { useCandidates } from '../../hooks/useCandidates';

const CONTRACT_TYPES = ['CDI', 'CDD', 'interim', 'apprenticeship', 'internship'];

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  positionTitle: '',
  department: '',
  contractType: 'CDI',
  plannedStartDate: '',
  grossSalary: '',
  probationEndDate: '',
  notes: '',
};

const CandidateFormPage = () => {
  const { t } = useTranslation('hr');
  const navigate = useNavigate();
  const { create } = useCandidates();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        grossSalary: form.grossSalary ? parseFloat(form.grossSalary) : null,
        plannedStartDate: form.plannedStartDate || null,
        probationEndDate: form.probationEndDate || null,
      };
      const result = await create(payload);
      navigate(`/app/hr/candidates/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <UserPlusIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('candidates.new')}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal info */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('candidates.form.personalInfo')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('candidates.fields.firstName')} name="firstName" value={form.firstName} onChange={handleChange} required />
            <Field label={t('candidates.fields.lastName')} name="lastName" value={form.lastName} onChange={handleChange} required />
            <Field label={t('candidates.fields.email')} name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label={t('candidates.fields.phone')} name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </div>
        </div>

        {/* Contract info */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('candidates.form.contractDetails')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('candidates.fields.positionTitle')} name="positionTitle" value={form.positionTitle} onChange={handleChange} required />
            <Field label={t('candidates.fields.department')} name="department" value={form.department} onChange={handleChange} />

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('candidates.fields.contractType')}
              </label>
              <select
                name="contractType"
                value={form.contractType}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {t(`candidates.contractTypes.${ct}`, ct)}
                  </option>
                ))}
              </select>
            </div>

            <Field label={t('candidates.fields.plannedStartDate')} name="plannedStartDate" type="date" value={form.plannedStartDate} onChange={handleChange} />
            <Field label={t('candidates.fields.grossSalary')} name="grossSalary" type="number" step="0.01" min="0" value={form.grossSalary} onChange={handleChange} />
            <Field label={t('candidates.fields.probationEndDate')} name="probationEndDate" type="date" value={form.probationEndDate} onChange={handleChange} />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t('candidates.fields.notes')}
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            placeholder={t('candidates.form.notesPlaceholder')}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/hr/candidates')}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('candidates.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? t('candidates.form.saving') : t('candidates.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

function Field({ label, name, value, onChange, type = 'text', required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        {...props}
      />
    </div>
  );
}

export default CandidateFormPage;
