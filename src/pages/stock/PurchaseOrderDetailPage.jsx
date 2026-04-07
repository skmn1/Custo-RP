import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';
import StockSubNav from '../../components/stock/StockSubNav';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  partial: 'bg-yellow-100 text-yellow-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PurchaseOrderDetailPage = () => {
  const { t, i18n } = useTranslation(['stock', 'common']);
  const lang = i18n.language;
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrder, isLoading, fetchPurchaseOrder, submitPurchaseOrder, cancelPurchaseOrder, receivePOLine } = useStock();

  const [receiveForm, setReceiveForm] = useState({ lineId: null, qtyReceived: '', batchNumber: '', lotNumber: '' });

  useEffect(() => { fetchPurchaseOrder(id); }, [id, fetchPurchaseOrder]);

  if (isLoading && !purchaseOrder) return <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>;
  if (!purchaseOrder) return <div className="text-center py-12 text-gray-500">{t('purchaseOrders.notFound')}</div>;

  const po = purchaseOrder;
  const isDraft = po.status === 'draft';
  const canReceive = po.status === 'submitted' || po.status === 'partial';

  const handleSubmit = async () => {
    await submitPurchaseOrder(id);
  };

  const handleCancel = async () => {
    if (!window.confirm(t('purchaseOrders.confirmCancel'))) return;
    await cancelPurchaseOrder(id);
    navigate('/stock/purchase-orders');
  };

  const openReceive = (line) => {
    const remaining = (line.qtyOrdered || 0) - (line.qtyReceived || 0);
    setReceiveForm({ lineId: line.id, qtyReceived: remaining, batchNumber: '', lotNumber: '' });
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    await receivePOLine(id, receiveForm.lineId, {
      qtyReceived: Number(receiveForm.qtyReceived),
      batchNumber: receiveForm.batchNumber || undefined,
      lotNumber: receiveForm.lotNumber || undefined,
    });
    setReceiveForm({ lineId: null, qtyReceived: '', batchNumber: '', lotNumber: '' });
  };

  return (
    <div className="space-y-6">
      <StockSubNav />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/stock/purchase-orders')} className="text-sm text-indigo-600 hover:text-indigo-900 mb-1">
            ← {t('purchaseOrders.backToList')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{po.poNumber}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[po.status] || ''}`}>
            {t(`purchaseOrders.status.${po.status}`)}
          </span>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <>
              <button onClick={() => navigate(`/stock/purchase-orders/${id}/edit`)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                {t('common:edit')}
              </button>
              <button onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                {t('purchaseOrders.btn.submit')}
              </button>
            </>
          )}
          {(isDraft || po.status === 'submitted') && (
            <button onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
              {t('purchaseOrders.btn.cancel')}
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('purchaseOrders.col.supplier')}</p>
          <p className="text-lg font-semibold">{po.supplierName || '—'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('purchaseOrders.col.total')}</p>
          <p className="text-lg font-semibold">{po.totalAmount != null ? `$${Number(po.totalAmount).toFixed(2)}` : '—'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('purchaseOrders.col.delivery')}</p>
          <p className="text-lg font-semibold">{po.expectedDelivery || '—'}</p>
        </div>
      </div>

      {po.notes && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">{t('purchaseOrders.form.notes')}</p>
          <p className="text-sm mt-1">{po.notes}</p>
        </div>
      )}

      {/* Lines */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">{t('purchaseOrders.lines.title')}</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.lines.item')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.lines.qtyOrdered')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.lines.unitCost')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.lines.lineTotal')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.lines.qtyReceived')}</th>
              {canReceive && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchaseOrders.lines.actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(po.lines || []).map((line) => {
              const remaining = (line.qtyOrdered || 0) - (line.qtyReceived || 0);
              return (
                <tr key={line.id}>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-gray-500">{line.itemSku}</span>{' '}
                    {line.itemName || line.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{line.qtyOrdered}</td>
                  <td className="px-4 py-3 text-sm text-right">${Number(line.unitCost || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right">${Number(line.lineTotal || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {line.qtyReceived || 0}
                    {remaining > 0 && <span className="text-yellow-600 ml-1">({remaining} left)</span>}
                  </td>
                  {canReceive && (
                    <td className="px-4 py-3 text-sm text-right">
                      {remaining > 0 && (
                        <button onClick={() => openReceive(line)} className="text-indigo-600 hover:text-indigo-900 text-sm">
                          {t('purchaseOrders.btn.receive')}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Receive line form (inline) */}
      {receiveForm.lineId && (
        <form onSubmit={handleReceive} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm">{t('purchaseOrders.receive.title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.receive.qty')}</label>
              <input type="number" required min="0.01" step="0.01" value={receiveForm.qtyReceived}
                onChange={(e) => setReceiveForm({ ...receiveForm, qtyReceived: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.receive.batchNumber')}</label>
              <input type="text" value={receiveForm.batchNumber}
                onChange={(e) => setReceiveForm({ ...receiveForm, batchNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.receive.lotNumber')}</label>
              <input type="text" value={receiveForm.lotNumber}
                onChange={(e) => setReceiveForm({ ...receiveForm, lotNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
              {t('purchaseOrders.receive.confirm')}
            </button>
            <button type="button" onClick={() => setReceiveForm({ lineId: null, qtyReceived: '', batchNumber: '', lotNumber: '' })}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              {t('common:cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
