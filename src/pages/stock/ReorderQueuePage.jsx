import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';
import StockSubNav from '../../components/stock/StockSubNav';

const ReorderQueuePage = () => {
  const { t, i18n } = useTranslation(['stock', 'common']);
  const lang = i18n.language;
  const navigate = useNavigate();
  const { reorderQueue, isLoading, fetchReorderQueue } = useStock();

  useEffect(() => { fetchReorderQueue(); }, [fetchReorderQueue]);

  return (
    <div className="space-y-6">
      <StockSubNav />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('reorder.title')}</h1>
        <p className="text-sm text-gray-500">{t('reorder.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>
      ) : reorderQueue.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('reorder.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('reorder.emptyHint')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('reorder.col.sku')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('reorder.col.name')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reorder.col.currentQty')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reorder.col.reorderPoint')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('reorder.col.supplier')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('reorder.col.status')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reorder.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reorderQueue.map((item) => {
                const deficit = (item.reorderPoint || 0) - (item.currentQty || 0);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{item.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {lang === 'fr' ? item.nameFr : item.nameEn}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{item.currentQty ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.reorderPoint}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.supplierName || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.stockStatus === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`items.status.${item.stockStatus}`, { defaultValue: item.stockStatus })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => navigate(`/stock/purchase-orders/new?itemId=${item.id}&supplierId=${item.preferredSupplierId || ''}`)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        {t('reorder.btn.createPo')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReorderQueuePage;
