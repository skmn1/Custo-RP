import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const emptyLine = { itemId: '', description: '', qtyOrdered: '', unitCost: '' };

const PurchaseOrderFormPage = () => {
  const { t, i18n } = useTranslation(['stock', 'common']);
  const lang = i18n.language;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const {
    suppliers, items, isLoading,
    fetchSuppliers, fetchItems,
    fetchPurchaseOrder, createPurchaseOrder, updatePurchaseOrder,
  } = useStock();

  const [form, setForm] = useState({
    supplierId: '', expectedDelivery: '', currency: 'CAD', notes: '',
    lines: [{ ...emptyLine }],
  });

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
    if (isEdit) {
      fetchPurchaseOrder(id).then((po) => {
        if (po) {
          setForm({
            supplierId: po.supplierId || '',
            expectedDelivery: po.expectedDelivery || '',
            currency: po.currency || 'CAD',
            notes: po.notes || '',
            lines: (po.lines || []).map((l) => ({
              id: l.id,
              itemId: l.itemId || '',
              description: l.description || '',
              qtyOrdered: l.qtyOrdered ?? '',
              unitCost: l.unitCost ?? '',
            })),
          });
        }
      });
    }
  }, [id, isEdit, fetchSuppliers, fetchItems, fetchPurchaseOrder]);

  const addLine = () => setForm({ ...form, lines: [...form.lines, { ...emptyLine }] });

  const removeLine = (idx) => {
    if (form.lines.length <= 1) return;
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  };

  const updateLine = (idx, field, value) => {
    const updated = form.lines.map((l, i) => (i === idx ? { ...l, [field]: value } : l));
    setForm({ ...form, lines: updated });
  };

  const calcTotal = () =>
    form.lines.reduce((sum, l) => sum + (Number(l.qtyOrdered) || 0) * (Number(l.unitCost) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      supplierId: form.supplierId || null,
      expectedDelivery: form.expectedDelivery || null,
      currency: form.currency,
      notes: form.notes || null,
      totalAmount: calcTotal(),
      lines: form.lines
        .filter((l) => l.itemId)
        .map((l) => ({
          ...(l.id ? { id: l.id } : {}),
          itemId: l.itemId,
          description: l.description || null,
          qtyOrdered: Number(l.qtyOrdered),
          unitCost: Number(l.unitCost),
          lineTotal: (Number(l.qtyOrdered) || 0) * (Number(l.unitCost) || 0),
        })),
    };
    if (isEdit) {
      await updatePurchaseOrder(id, data);
    } else {
      await createPurchaseOrder(data);
    }
    navigate('/stock/purchase-orders');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? t('purchaseOrders.form.editTitle') : t('purchaseOrders.form.addTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.form.supplier')}</label>
            <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
              <option value="">—</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.form.delivery')}</label>
            <input type="date" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.form.currency')}</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.form.notes')}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t('purchaseOrders.lines.title')}</h3>
            <button type="button" onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-900">
              + {t('purchaseOrders.lines.addLine')}
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-2">{t('purchaseOrders.lines.item')}</th>
                <th className="pb-2 w-24">{t('purchaseOrders.lines.qtyOrdered')}</th>
                <th className="pb-2 w-28">{t('purchaseOrders.lines.unitCost')}</th>
                <th className="pb-2 w-28 text-right">{t('purchaseOrders.lines.lineTotal')}</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.lines.map((line, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-2">
                    <select value={line.itemId} onChange={(e) => updateLine(idx, 'itemId', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm text-sm border px-2 py-1.5">
                      <option value="">—</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>{i.sku} — {lang === 'fr' ? i.nameFr : i.nameEn}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" min="0" step="0.01" value={line.qtyOrdered}
                      onChange={(e) => updateLine(idx, 'qtyOrdered', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm text-sm border px-2 py-1.5" />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" min="0" step="0.01" value={line.unitCost}
                      onChange={(e) => updateLine(idx, 'unitCost', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm text-sm border px-2 py-1.5" />
                  </td>
                  <td className="py-2 text-right text-gray-700">
                    ${((Number(line.qtyOrdered) || 0) * (Number(line.unitCost) || 0)).toFixed(2)}
                  </td>
                  <td className="py-2 text-center">
                    {form.lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right text-sm font-semibold">
            {t('purchaseOrders.form.totalLabel')}: ${calcTotal().toFixed(2)}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
            {isEdit ? t('common:save') : t('common:create')}
          </button>
          <button type="button" onClick={() => navigate('/stock/purchase-orders')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
            {t('common:cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderFormPage;
