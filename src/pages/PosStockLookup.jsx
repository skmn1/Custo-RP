import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosStockLookup = () => {
  const { t } = useTranslation(['pos', 'common']);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!search.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await posApi.searchStock(search.trim());
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
      setSearched(true);
    }
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:stockLookup.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:stockLookup.subtitle')}
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('pos:stockLookup.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !search.trim()}
          className="px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t('common:loading') : t('pos:stockLookup.search')}
        </button>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      )}

      {!isLoading && searched && items.length === 0 && (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:stockLookup.noResults')}
          </p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('pos:stockLookup.colName')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('pos:stockLookup.colSku')}
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('pos:stockLookup.colQuantity')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('pos:stockLookup.colStatus')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {item.name || item.nameEn || item.nameFr}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right font-medium">
                    {item.currentQuantity ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StockStatusBadge status={item.stockStatus} />
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

const StockStatusBadge = ({ status }) => {
  const statusStyles = {
    ok: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warn: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    critical: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[status] || statusStyles.ok}`}>
      {status || 'ok'}
    </span>
  );
};

export default PosStockLookup;
