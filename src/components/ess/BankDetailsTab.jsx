import React, { useState } from 'react';

/**
 * BankDetailsTab — displays masked bank details and allows
 * submitting a change request for bank information updates.
 */
const BankDetailsTab = ({ bankDetails, pendingRequests, onSubmitChange, t }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bankName: '', iban: '', bic: '', accountHolder: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // Submit each bank field as a separate change request
      const fields = [
        { fieldName: 'bank_name', fieldLabel: t('profile.bank.bankName'), oldValue: bankDetails?.bankName || '', newValue: form.bankName },
        { fieldName: 'bank_iban', fieldLabel: t('profile.bank.iban'), oldValue: bankDetails?.iban || '', newValue: form.iban },
        { fieldName: 'bank_bic', fieldLabel: t('profile.bank.bic'), oldValue: bankDetails?.bic || '', newValue: form.bic },
        { fieldName: 'bank_account_holder', fieldLabel: t('profile.bank.accountHolder'), oldValue: bankDetails?.accountHolder || '', newValue: form.accountHolder },
      ].filter(f => f.newValue.trim());

      for (const field of fields) {
        await onSubmitChange(field);
      }

      setMessage(t('profile.bank.changeSubmitted'));
      setShowForm(false);
      setForm({ bankName: '', iban: '', bic: '', accountHolder: '' });
    } catch {
      setMessage('Failed to submit change request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        {t('profile.bank.title')}
      </h2>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
          {message}
        </div>
      )}

      {pendingRequests > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
          {t('profile.bank.pendingChange')}
        </div>
      )}

      {bankDetails ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-4">
          <FieldDisplay label={t('profile.bank.bankName')} value={bankDetails.bankName} />
          <FieldDisplay label={t('profile.bank.iban')} value={bankDetails.iban} />
          <FieldDisplay label={t('profile.bank.bic')} value={bankDetails.bic} />
          <FieldDisplay label={t('profile.bank.accountHolder')} value={bankDetails.accountHolder} />
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('profile.bank.noDetails')}</p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{t('profile.bank.maskedNotice')}</p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          data-cy="request-bank-change"
        >
          {t('profile.bank.requestChange')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4" data-cy="bank-change-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label={t('profile.bank.bankName')} value={form.bankName} onChange={(v) => setForm(f => ({ ...f, bankName: v }))} />
            <FormInput label={t('profile.bank.iban')} value={form.iban} onChange={(v) => setForm(f => ({ ...f, iban: v }))} />
            <FormInput label={t('profile.bank.bic')} value={form.bic} onChange={(v) => setForm(f => ({ ...f, bic: v }))} />
            <FormInput label={t('profile.bank.accountHolder')} value={form.accountHolder} onChange={(v) => setForm(f => ({ ...f, accountHolder: v }))} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {t('profile.actions.submit')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('profile.actions.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const FieldDisplay = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || '—'}</span>
  </div>
);

const FormInput = ({ label, value, onChange, required = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>
);

export default BankDetailsTab;
