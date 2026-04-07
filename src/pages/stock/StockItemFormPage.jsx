import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/ui/Button';
import StockSubNav from '../../components/stock/StockSubNav';

const StockItemFormPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const {
    item, categoriesFlat, locations, suppliers, isLoading,
    fetchItem, fetchCategoriesFlat, fetchLocations, fetchSuppliers,
    createItem, updateItem,
  } = useStock();

  const [form, setForm] = useState({
    sku: '', nameEn: '', nameFr: '', categoryId: '', uom: 'each',
    barcode: '', reorderPoint: 0, minLevel: 0, avgCost: 0,
    salePrice: 0, preferredSupplierId: '', locationId: '',
    isBatchTracked: false,
  });

  useEffect(() => {
    fetchCategoriesFlat();
    fetchLocations();
    fetchSuppliers();
    if (isEdit) fetchItem(id);
  }, [id, isEdit, fetchItem, fetchCategoriesFlat, fetchLocations, fetchSuppliers]);

  useEffect(() => {
    if (isEdit && item) {
      setForm({
        sku: item.sku || '',
        nameEn: item.nameEn || '',
        nameFr: item.nameFr || '',
        categoryId: item.categoryId || '',
        uom: item.uom || 'each',
        barcode: item.barcode || '',
        reorderPoint: item.reorderPoint || 0,
        minLevel: item.minLevel || 0,
        avgCost: item.avgCost || 0,
        salePrice: item.salePrice || 0,
        preferredSupplierId: item.preferredSupplierId || '',
        locationId: item.locationId || '',
        isBatchTracked: item.isBatchTracked || false,
      });
    }
  }, [isEdit, item]);

  const language = useTranslation().i18n.language;

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      reorderPoint: Number(form.reorderPoint),
      minLevel: Number(form.minLevel),
      avgCost: Number(form.avgCost),
      salePrice: Number(form.salePrice),
      categoryId: form.categoryId || null,
      preferredSupplierId: form.preferredSupplierId || null,
      locationId: form.locationId || null,
    };
    if (isEdit) {
      await updateItem(id, data);
    } else {
      await createItem(data);
    }
    navigate('/stock/items');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StockSubNav />
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← {t('common.btn.back')}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? t('item.form.title.edit') : t('item.form.title.create')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.sku')}</label>
            <input type="text" value={form.sku} onChange={handleChange('sku')}
              placeholder={t('item.form.skuHint')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.barcode')}</label>
            <input type="text" value={form.barcode} onChange={handleChange('barcode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.nameEn')}</label>
            <input type="text" required value={form.nameEn} onChange={handleChange('nameEn')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.nameFr')}</label>
            <input type="text" required value={form.nameFr} onChange={handleChange('nameFr')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.category')}</label>
            <select value={form.categoryId} onChange={handleChange('categoryId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2">
              <option value="">—</option>
              {categoriesFlat.map((c) => (
                <option key={c.id} value={c.id}>{language === 'fr' ? c.nameFr : c.nameEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.uom')}</label>
            <input type="text" value={form.uom} onChange={handleChange('uom')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.location')}</label>
            <select value={form.locationId} onChange={handleChange('locationId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2">
              <option value="">—</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.reorderPoint')}</label>
            <input type="number" step="0.01" value={form.reorderPoint} onChange={handleChange('reorderPoint')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.minLevel')}</label>
            <input type="number" step="0.01" value={form.minLevel} onChange={handleChange('minLevel')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.avgCost')}</label>
            <input type="number" step="0.01" value={form.avgCost} onChange={handleChange('avgCost')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.salePrice')}</label>
            <input type="number" step="0.01" value={form.salePrice} onChange={handleChange('salePrice')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('item.form.supplier')}</label>
            <select value={form.preferredSupplierId} onChange={handleChange('preferredSupplierId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border px-3 py-2">
              <option value="">—</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isBatchTracked} onChange={handleChange('isBatchTracked')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-gray-700">{t('item.form.batchTracked')}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={() => navigate(-1)}>{t('item.form.btn.cancel')}</Button>
          <Button type="submit" disabled={isLoading}>{t('item.form.btn.save')}</Button>
        </div>
      </form>
    </div>
  );
};

export default StockItemFormPage;
