import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  partial: 'bg-yellow-100 text-yellow-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PurchaseOrderListPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const navigate = useNavigate();
  const { purchaseOrders, isLoading, fetchPurchaseOrders } = useStock();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchPurchaseOrders(); }, [fetchPurchaseOrders]);

  const filtered = statusFilter
    ? purchaseOrders.filter((po) => po.status === statusFilter)
    : purchaseOrders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('purchaseOrders.title')}</h1>
          <p className="text-sm text-gray-500">{t('purchaseOrders.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/stock/purchase-orders/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {t('purchaseOrders.btn.add')}
        </button>
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
        <option value="">{t('purchaseOrders.filterStatus')}</option>
        {['draft', 'submitted', 'partial', 'received', 'cancelled'].map((s) => (
          <option key={s} value={s}>{t(`purchaseOrders.status.${s}`)}</option>
        ))}
      </select>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('purchaseOrders.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.col.poNumber')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.col.supplier')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.col.status')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.col.total')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.col.delivery')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.col.created')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/stock/purchase-orders/${po.id}`)}>
                  <td className="px-4 py-3 text-sm font-mono font-medium text-indigo-600">{po.poNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{po.supplierName || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[po.status] || 'bg-gray-100 text-gray-800'}`}>
                      {t(`purchaseOrders.status.${po.status}`, { defaultValue: po.status })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{po.totalAmount != null ? `$${Number(po.totalAmount).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{po.expectedDelivery || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '—'}
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

export default PurchaseOrderListPage;
