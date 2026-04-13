import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TruckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { posApi } from '../api/posApi';

const PosLocationPurchases = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .getPurchases(posLocationId)
      .then((result) => {
        if (!cancelled) setOrders(result?.data ?? result ?? []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [posLocationId]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:purchases.title')}
        </h1>
        {(isSuperAdmin || user?.role === 'pos_manager') && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            onClick={() => {/* TODO: open new purchase order form */}}
          >
            <PlusIcon className="w-4 h-4" />
            {t('pos:purchases.newOrder')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <TruckIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('pos:purchases.noOrders')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common:supplier', 'Supplier')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common:status', 'Status')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common:total', 'Total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{order.reference ?? order.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{order.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{order.status}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">${order.total ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PosLocationPurchases;
