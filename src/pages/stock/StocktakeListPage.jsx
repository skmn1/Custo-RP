import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  finalised: 'bg-green-100 text-green-800',
};

const StocktakeListPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const navigate = useNavigate();
  const { stocktakes, locations, isLoading, fetchStocktakes, fetchLocations, startStocktake } = useStock();

  const [showStart, setShowStart] = useState(false);
  const [startForm, setStartForm] = useState({ locationId: '' });

  useEffect(() => { fetchStocktakes(); fetchLocations(); }, [fetchStocktakes, fetchLocations]);

  const handleStart = async (e) => {
    e.preventDefault();
    const session = await startStocktake({ locationId: startForm.locationId || null });
    if (session) navigate(`/stock/stocktakes/${session.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('stocktakes.title')}</h1>
          <p className="text-sm text-gray-500">{t('stocktakes.subtitle')}</p>
        </div>
        <button onClick={() => setShowStart(!showStart)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
          {t('stocktakes.btn.start')}
        </button>
      </div>

      {showStart && (
        <form onSubmit={handleStart} className="bg-white rounded-lg shadow p-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">{t('stocktakes.form.location')}</label>
            <select value={startForm.locationId} onChange={(e) => setStartForm({ locationId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
              <option value="">{t('stocktakes.form.allLocations')}</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
            {t('stocktakes.btn.startSession')}
          </button>
          <button type="button" onClick={() => setShowStart(false)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
            {t('common:cancel')}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>
      ) : stocktakes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('stocktakes.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stocktakes.col.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stocktakes.col.location')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stocktakes.col.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stocktakes.col.createdBy')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stocktakes.col.finalised')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stocktakes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/stock/stocktakes/${s.id}`)}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.stocktakeDate ? new Date(s.stocktakeDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.locationName || t('stocktakes.form.allLocations')}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {t(`stocktakes.status.${s.status}`, { defaultValue: s.status })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.createdBy || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {s.finalisedAt ? new Date(s.finalisedAt).toLocaleString() : '—'}
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

export default StocktakeListPage;
