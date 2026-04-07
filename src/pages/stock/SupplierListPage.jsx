import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const SupplierListPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const navigate = useNavigate();
  const { suppliers, isLoading, fetchSuppliers, deleteSupplier } = useStock();

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('suppliers.confirmDelete'))) return;
    await deleteSupplier(id);
    fetchSuppliers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('suppliers.title')}</h1>
          <p className="text-sm text-gray-500">{t('suppliers.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/stock/suppliers/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {t('suppliers.btn.add')}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('suppliers.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.name')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.contact')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.email')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.phone')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.leadTime')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.terms')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('suppliers.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.contactPerson || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.leadTimeDays != null ? `${s.leadTimeDays}d` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.paymentTerms || '—'}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => navigate(`/stock/suppliers/${s.id}/edit`)} className="text-indigo-600 hover:text-indigo-900 text-sm">{t('common:edit')}</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900 text-sm">{t('common:delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
