import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/ui/Button';

const StockItemDetailPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { item, movements, isLoading, fetchItem, fetchItemMovements, deleteItem } = useStock();

  const language = useTranslation().i18n.language;

  useEffect(() => {
    fetchItem(id);
    fetchItemMovements(id);
  }, [id, fetchItem, fetchItemMovements]);

  if (isLoading || !item) {
    return <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>;
  }

  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    warn: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm.delete'))) {
      await deleteItem(id);
      navigate('/stock/items');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/stock/items')}>
            ← {t('common.btn.back')}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {language === 'fr' ? item.nameFr : item.nameEn}
          </h1>
          <p className="text-sm text-gray-500 font-mono">{item.sku}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/stock/items/${id}/edit`)}>
            {t('items.btn.edit')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('items.btn.deactivate')}
          </Button>
        </div>
      </div>

      {/* Item details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{t('items.col.status')}</h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.stockStatus]}`}>
              {t(`items.status.${item.stockStatus}`)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t('items.col.qty')}</span>
              <p className="font-bold text-lg">{item.currentQty} {item.uom}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('items.col.avgCost')}</span>
              <p className="font-bold text-lg">${Number(item.avgCost).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('item.form.reorderPoint')}</span>
              <p className="font-medium">{item.reorderPoint}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('item.form.minLevel')}</span>
              <p className="font-medium">{item.minLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">{t('items.col.category')}</h3>
          <p>{language === 'fr' ? item.categoryNameFr : item.categoryNameEn}</p>
          <h3 className="font-semibold text-gray-900">{t('items.col.supplier')}</h3>
          <p>{item.supplierName || '—'}</p>
          <h3 className="font-semibold text-gray-900">{t('items.col.location')}</h3>
          <p>{item.locationName || '—'}</p>
          {item.barcode && (
            <>
              <h3 className="font-semibold text-gray-900">{t('item.form.barcode')}</h3>
              <p className="font-mono">{item.barcode}</p>
            </>
          )}
        </div>

        {item.locationBreakdown && item.locationBreakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('items.col.location')}</h3>
            <div className="space-y-2">
              {item.locationBreakdown.map((loc) => (
                <div key={loc.locationId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{loc.locationName}</span>
                  <span className="font-medium">{loc.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Movement ledger */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{t('movements.title')}</h3>
          <Button size="sm" onClick={() => navigate(`/stock/movements?itemId=${id}`)}>
            {t('items.btn.viewLedger')}
          </Button>
        </div>
        {movements.length === 0 ? (
          <p className="p-6 text-center text-gray-500 text-sm">{t('movements.empty')}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.date')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.type')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('movements.col.qty')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('movements.col.note')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.slice(0, 10).map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {m.performedAt ? new Date(m.performedAt).toLocaleDateString() : ''}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {t(`movements.type.${m.movementType}`, { defaultValue: m.movementType })}
                  </td>
                  <td className={`px-4 py-2 text-sm text-right font-medium ${
                    Number(m.qtyChange) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Number(m.qtyChange) >= 0 ? '+' : ''}{m.qtyChange}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{m.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockItemDetailPage;
