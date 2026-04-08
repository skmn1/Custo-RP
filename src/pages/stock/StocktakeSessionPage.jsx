import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const StocktakeSessionPage = () => {
  const { t, i18n } = useTranslation(['stock', 'common']);
  const lang = i18n.language;
  const { id } = useParams();
  const navigate = useNavigate();
  const { stocktake, isLoading, fetchStocktake, submitStocktakeCount, finaliseStocktake } = useStock();

  const [countInputs, setCountInputs] = useState({});

  useEffect(() => { fetchStocktake(id); }, [id, fetchStocktake]);

  useEffect(() => {
    if (stocktake?.counts) {
      const initial = {};
      stocktake.counts.forEach((c) => {
        initial[c.itemId] = c.countedQty ?? '';
      });
      setCountInputs(initial);
    }
  }, [stocktake]);

  if (isLoading && !stocktake) return <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>;
  if (!stocktake) return <div className="text-center py-12 text-gray-500">{t('stocktakes.notFound')}</div>;

  const isOpen = stocktake.status === 'open';

  const handleCount = async (itemId) => {
    const val = countInputs[itemId];
    if (val === '' || val == null) return;
    await submitStocktakeCount(id, itemId, Number(val));
  };

  const handleFinalise = async () => {
    if (!window.confirm(t('stocktakes.confirmFinalise'))) return;
    await finaliseStocktake(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/app/stock/stocktakes')} className="text-sm text-indigo-600 hover:text-indigo-900 mb-1">
            ← {t('stocktakes.backToList')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('stocktakes.session.title')}</h1>
          <p className="text-sm text-gray-500">
            {stocktake.locationName || t('stocktakes.form.allLocations')} — {stocktake.stocktakeDate}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
              isOpen ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {t(`stocktakes.status.${stocktake.status}`)}
            </span>
          </p>
        </div>
        {isOpen && (
          <button onClick={handleFinalise}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
            {t('stocktakes.btn.finalise')}
          </button>
        )}
      </div>

      {/* Summary cards */}
      {stocktake.counts && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold">{stocktake.counts.length}</p>
            <p className="text-sm text-gray-500">{t('stocktakes.session.totalItems')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold">
              {stocktake.counts.filter((c) => c.countedQty != null).length}
            </p>
            <p className="text-sm text-gray-500">{t('stocktakes.session.counted')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold">
              {stocktake.counts.filter((c) => c.adjustmentQty && c.adjustmentQty !== 0).length}
            </p>
            <p className="text-sm text-gray-500">{t('stocktakes.session.variances')}</p>
          </div>
        </div>
      )}

      {/* Count table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stocktakes.session.col.item')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('stocktakes.session.col.systemQty')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('stocktakes.session.col.countedQty')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('stocktakes.session.col.variance')}</th>
              {isOpen && <th className="px-4 py-3 w-20"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(stocktake.counts || []).map((c) => {
              const variance = c.adjustmentQty || (c.countedQty != null ? c.countedQty - (c.systemQty || 0) : null);
              return (
                <tr key={c.itemId} className={variance && variance !== 0 ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-gray-500">{c.itemSku}</span>{' '}
                    {c.itemName}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{c.systemQty ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {isOpen ? (
                      <input type="number" step="0.01"
                        value={countInputs[c.itemId] ?? ''}
                        onChange={(e) => setCountInputs({ ...countInputs, [c.itemId]: e.target.value })}
                        className="w-24 text-right rounded-md border-gray-300 shadow-sm text-sm border px-2 py-1" />
                    ) : (
                      c.countedQty ?? '—'
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    variance == null ? '' : variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {variance != null ? (variance >= 0 ? '+' : '') + variance : '—'}
                  </td>
                  {isOpen && (
                    <td className="px-4 py-3 text-sm text-center">
                      <button onClick={() => handleCount(c.itemId)} className="text-indigo-600 hover:text-indigo-900 text-xs">
                        {t('stocktakes.session.btn.save')}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StocktakeSessionPage;
