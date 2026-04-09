import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';

const FIELDS = [
  { key: 'accounting.defaultCurrency', type: 'text', label: 'settings.defaultCurrency' },
  { key: 'accounting.currencySymbol', type: 'text', label: 'settings.currencySymbol' },
  { key: 'accounting.defaultTaxRate', type: 'number', label: 'settings.defaultTaxRate' },
  { key: 'accounting.arInvoicePrefix', type: 'text', label: 'settings.arPrefix' },
  { key: 'accounting.apInvoicePrefix', type: 'text', label: 'settings.apPrefix' },
  { key: 'accounting.invoiceSequence', type: 'number', label: 'settings.invoiceSequence', readOnly: true },
  { key: 'accounting.paymentTermsDays', type: 'number', label: 'settings.paymentTerms' },
  { key: 'accounting.companyBankDetails', type: 'textarea', label: 'settings.bankDetails' },
  { key: 'accounting.fiscalYearStart', type: 'number', label: 'settings.fiscalYearStart', min: 1, max: 12 },
];

const DEFAULTS = {
  'accounting.defaultCurrency': 'EUR',
  'accounting.currencySymbol': '€',
  'accounting.defaultTaxRate': '20',
  'accounting.arInvoicePrefix': 'INV-',
  'accounting.apInvoicePrefix': 'BILL-',
  'accounting.invoiceSequence': '1001',
  'accounting.paymentTermsDays': '30',
  'accounting.companyBankDetails': '',
  'accounting.fiscalYearStart': '1',
};

export default function AccountingSettingsPage() {
  const { t } = useTranslation(['accounting', 'common']);
  const { settings, updateSetting } = useSettings();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const initial = {};
    FIELDS.forEach((f) => {
      initial[f.key] = settings?.[f.key] ?? DEFAULTS[f.key] ?? '';
    });
    setForm(initial);
  }, [settings]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(form)) {
      if (key === 'accounting.invoiceSequence') continue; // read-only
      await updateSetting(key, value);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl" data-testid="accounting-settings">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounting:settings.title', 'Accounting Settings')}</h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t(`accounting:${f.label}`, f.label)}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            ) : (
              <input
                type={f.type}
                value={form[f.key] || ''}
                readOnly={f.readOnly}
                min={f.min}
                max={f.max}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${f.readOnly ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : ''}`}
              />
            )}
            {f.readOnly && (
              <p className="mt-1 text-xs text-gray-400">{t('accounting:settings.readOnly', 'Read-only — auto-incremented')}</p>
            )}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
            {t('common:actions.save', 'Save')}
          </button>
          {saved && (
            <span className="text-sm text-green-600">{t('common:status.success', 'Saved!')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
