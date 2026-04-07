import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const MOVEMENT_TYPES = ['received', 'consumed', 'wasted', 'adjustment', 'transfer_in', 'transfer_out', 'returned'];

const StockMovementPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const [searchParams] = useSearchParams();
  const { movements, items, isLoading, fetchMovements, fetchItems, createMovement } = useStock();

  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    itemId: searchParams.get('itemId') || '',
    movementType: 'consumed',
    qtyChange: '',
    unitCost: '',
    note: '',
  });

  useEffect(() => {
    const params = {};
    if (searchParams.get('itemId')) params.itemId = searchParams.get('itemId');
    fetchMovements(params);
    fetchItems();
  }, [fetchMovements, fetchItems, searchParams]);

  const handleFilter = (e) => {
    setTypeFilter(e.target.value);
    const params = {};
    if (searchParams.get('itemId')) params.itemId = searchParams.get('itemId');
    if (e.target.value) params.movementType = e.target.value;
    fetchMovements(params);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      qtyChange: form.movementType === 'consumed' || form.movementType === 'wasted'
        ? -Math.abs(Number(form.qtyChange)) : Number(form.qtyChange),
      unitCost: form.unitCost ? Number(form.unitCost) : null,
    };
    await createMovement(data);
    setShowForm(false);
    setForm({ itemId: '', movementType: 'consumed', qtyChange: '', unitCost: '', note: '' });
    fetchMovements(searchParams.get('itemId') ? { itemId: searchParams.get('itemId') } : {});
  };

  const language = useTranslation().i18n.language;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('movements.title')}</h1>
          <p className="text-sm text-gray-500">{t('movements.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {t('movements.btn.add')}
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="font-semibold">{t('movements.form.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('movements.form.item')}</label>
              <select required value={form.itemId} onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
                <option value="">—</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.sku} — {language === 'fr' ? i.nameFr : i.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('movements.form.type')}</label>
              <select value={form.movementType} onChange={(e) => setForm({ ...form, movementType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
                {MOVEMENT_TYPES.map((mt) => (
                  <option key={mt} value={mt}>{t(`movements.type.${mt}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('movements.form.qty')}</label>
              <input type="number" required step="0.01" value={form.qtyChange}
                onChange={(e) => setForm({ ...form, qtyChange: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('movements.form.cost')}</label>
              <input type="number" step="0.01" value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('movements.form.note')}</label>
            <input type="text" value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
              {t('movements.form.btn.save')}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              {t('movements.form.btn.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <select value={typeFilter} onChange={handleFilter}
        className="rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
        <option value="">{t('movements.filterType')}</option>
        {MOVEMENT_TYPES.map((mt) => (
          <option key={mt} value={mt}>{t(`movements.type.${mt}`)}</option>
        ))}
      </select>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('movements.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.item')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.type')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('movements.col.qty')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('movements.col.cost')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.note')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {m.performedAt ? new Date(m.performedAt).toLocaleString() : ''}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-gray-500">{m.itemSku}</span>{' '}
                    {m.itemName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {t(`movements.type.${m.movementType}`, { defaultValue: m.movementType })}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    Number(m.qtyChange) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Number(m.qtyChange) >= 0 ? '+' : ''}{m.qtyChange}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {m.unitCost != null ? `$${Number(m.unitCost).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockMovementPage;
