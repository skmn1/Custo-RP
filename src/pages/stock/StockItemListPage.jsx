import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/ui/Button';

const StockItemListPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const navigate = useNavigate();
  const {
    items, categoriesFlat, locations, isLoading,
    fetchItems, fetchCategoriesFlat, fetchLocations,
  } = useStock();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchItems();
    fetchCategoriesFlat();
    fetchLocations();
  }, [fetchItems, fetchCategoriesFlat, fetchLocations]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchItems({ search: e.target.value, categoryId: categoryFilter || undefined, locationId: locationFilter || undefined });
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    fetchItems({ search, categoryId: e.target.value || undefined, locationId: locationFilter || undefined });
  };

  const handleLocationFilter = (e) => {
    setLocationFilter(e.target.value);
    fetchItems({ search, categoryId: categoryFilter || undefined, locationId: e.target.value || undefined });
  };

  const statusBadge = (status) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      warn: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.normal}`}>
        {t(`items.status.${status}`)}
      </span>
    );
  };

  const language = useTranslation().i18n.language;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('items.title')}</h1>
          <p className="text-sm text-gray-500">{t('items.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/stock/items/new')}>{t('items.btn.add')}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t('items.search')}
          value={search}
          onChange={handleSearch}
          className="flex-1 min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 border"
        />
        <select
          value={categoryFilter}
          onChange={handleCategoryFilter}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 border"
        >
          <option value="">{t('items.filterCategory')}</option>
          {categoriesFlat.map((c) => (
            <option key={c.id} value={c.id}>
              {language === 'fr' ? c.nameFr : c.nameEn}
            </option>
          ))}
        </select>
        <select
          value={locationFilter}
          onChange={handleLocationFilter}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 border"
        >
          <option value="">{t('items.filterLocation')}</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('items.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('items.col.sku')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('items.col.name')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('items.col.category')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('items.col.qty')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('items.col.uom')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('items.col.avgCost')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('items.col.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/stock/items/${item.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.sku}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {language === 'fr' ? item.nameFr : item.nameEn}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {language === 'fr' ? item.categoryNameFr : item.categoryNameEn}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{item.currentQty}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.uom}</td>
                  <td className="px-4 py-3 text-sm text-right">${Number(item.avgCost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(item.stockStatus)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); navigate(`/stock/items/${item.id}/edit`); }}
                    >
                      {t('items.btn.edit')}
                    </Button>
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

export default StockItemListPage;
