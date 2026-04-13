import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArchiveBoxIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosLocationStock = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await posApi.getStock(posLocationId, search || undefined);
      const list = result?.data ?? result ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [posLocationId, search]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:stock.title')}
        </h1>
      </div>

      <div className="mb-4 relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('pos:stock.searchPlaceholder')}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <ArchiveBoxIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:stockLookup.noResults')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('pos:stockLookup.colName')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('pos:stockLookup.colSku')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('pos:stockLookup.colQuantity')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('pos:stockLookup.colStatus')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{item.quantity}</td>
                  <td className="px-4 py-3 text-center">
                    {item.isLowStock ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {t('pos:stock.lowStock')}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        OK
                      </span>
                    )}
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

export default PosLocationStock;
