import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStock } from '../../hooks/useStock';
import StockSubNav from '../../components/stock/StockSubNav';

const StockLocationPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const { locations, isLoading, fetchLocations, createLocation, updateLocation, deleteLocation } = useStock();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const resetForm = () => { setEditing(null); setForm({ name: '', description: '', sortOrder: 0 }); };

  const startEdit = (loc) => {
    setEditing(loc.id);
    setForm({ name: loc.name, description: loc.description || '', sortOrder: loc.sortOrder || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, sortOrder: Number(form.sortOrder) };
    if (editing) {
      await updateLocation(editing, data);
    } else {
      await createLocation(data);
    }
    resetForm();
    fetchLocations();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('locations.confirmDelete'))) return;
    await deleteLocation(id);
    fetchLocations();
  };

  return (
    <div className="space-y-6">
      <StockSubNav />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('locations.title')}</h1>
        <p className="text-sm text-gray-500">{t('locations.subtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold">{editing ? t('locations.form.editTitle') : t('locations.form.addTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('locations.form.name')}</label>
            <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('locations.form.description')}</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('locations.form.sortOrder')}</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
            {editing ? t('common:save') : t('common:create')}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              {t('common:cancel')}
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('locations.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('locations.col.name')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('locations.col.description')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('locations.col.sortOrder')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('locations.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{loc.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{loc.description || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{loc.sortOrder}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => startEdit(loc)} className="text-indigo-600 hover:text-indigo-900 text-sm">{t('common:edit')}</button>
                    <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-900 text-sm">{t('common:delete')}</button>
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

export default StockLocationPage;
