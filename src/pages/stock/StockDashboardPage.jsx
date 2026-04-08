import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useStock } from '../../hooks/useStock';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const StockDashboardPage = () => {
  const { t } = useTranslation(['stock', 'common']);
  const navigate = useNavigate();
  const { kpi, isLoading, fetchKpi } = useStock();

  useEffect(() => { fetchKpi(); }, [fetchKpi]);

  if (isLoading && !kpi) return <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>;
  if (!kpi) return <div className="text-center py-12 text-gray-500">{t('common:noResults')}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('kpi.totalValue')}</p>
          <p className="text-2xl font-bold">${Number(kpi.totalInventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('kpi.totalSkus')}</p>
          <p className="text-2xl font-bold">{kpi.totalSkus || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('kpi.lowStock')}</p>
          <p className="text-2xl font-bold text-yellow-600">{kpi.lowStockItems || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('kpi.avgDaysToStockout')}</p>
          <p className="text-2xl font-bold">{kpi.avgDaysToStockout != null ? Math.round(kpi.avgDaysToStockout) : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly movement trend */}
        {kpi.movementTrend && kpi.movementTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">{t('kpi.movementTrend')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kpi.movementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qtyIn" fill="#10b981" name={t('kpi.qtyIn')} />
                <Bar dataKey="qtyOut" fill="#ef4444" name={t('kpi.qtyOut')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Value by category (pie) */}
        {kpi.valueByCategory && kpi.valueByCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">{t('kpi.valueByCategory')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={kpi.valueByCategory} dataKey="value" nameKey="categoryName" cx="50%" cy="50%"
                  outerRadius={90} label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}>
                  {kpi.valueByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top consumed */}
        {kpi.topConsumed && kpi.topConsumed.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">{t('kpi.topConsumed')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={kpi.topConsumed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="itemName" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalConsumed" fill="#6366f1" name={t('kpi.topConsumed')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Low stock alerts */}
        {kpi.lowStockAlerts && kpi.lowStockAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">{t('kpi.lowStockAlerts')}</h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {kpi.lowStockAlerts.map((alert) => (
                <div key={alert.itemId} className="flex items-center justify-between p-2 rounded-md bg-yellow-50">
                  <div>
                    <span className="font-mono text-xs text-gray-500">{alert.sku}</span>{' '}
                    <span className="text-sm font-medium">{alert.itemName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600">{alert.currentQty}</span>
                    <span className="text-xs text-gray-500"> / {alert.reorderPoint}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/app/stock/reorder-queue')}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-900">
              {t('reorder.title')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDashboardPage;
