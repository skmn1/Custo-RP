import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const SupplierFormPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { fetchSupplierById, createSupplier, updateSupplier } = useStock();

  const [form, setForm] = useState({
    name: '', contactPerson: '', email: '', phone: '', address: '',
    currency: 'CAD', paymentTerms: '', leadTimeDays: '', notes: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchSupplierById(id).then((s) => {
        if (s) setForm({
          name: s.name || '', contactPerson: s.contactPerson || '', email: s.email || '',
          phone: s.phone || '', address: s.address || '', currency: s.currency || 'CAD',
          paymentTerms: s.paymentTerms || '', leadTimeDays: s.leadTimeDays ?? '',
          notes: s.notes || '',
        });
      });
    }
  }, [id, isEdit, fetchSupplierById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, leadTimeDays: form.leadTimeDays !== '' ? Number(form.leadTimeDays) : null };
    if (isEdit) {
      await updateSupplier(id, data);
    } else {
      await createSupplier(data);
    }
    navigate('/app/stock/suppliers');
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('suppliers.form.editTitle') : t('suppliers.form.addTitle')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.name')}</label>
            <input required type="text" value={form.name} onChange={set('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.contact')}</label>
            <input type="text" value={form.contactPerson} onChange={set('contactPerson')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.email')}</label>
            <input type="email" value={form.email} onChange={set('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.phone')}</label>
            <input type="text" value={form.phone} onChange={set('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.currency')}</label>
            <select value={form.currency} onChange={set('currency')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.address')}</label>
            <textarea value={form.address} onChange={set('address')} rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.terms')}</label>
            <input type="text" value={form.paymentTerms} onChange={set('paymentTerms')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.leadTime')}</label>
            <input type="number" min="0" value={form.leadTimeDays} onChange={set('leadTimeDays')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.notes')}</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
            {isEdit ? t('common:save') : t('common:create')}
          </button>
          <button type="button" onClick={() => navigate('/app/stock/suppliers')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
            {t('common:cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierFormPage;
