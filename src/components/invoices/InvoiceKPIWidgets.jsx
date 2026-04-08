import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoices } from '../../hooks/useInvoices';
import StatCard from '../ui/StatCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS_CHART = {
  received: '#3b82f6',
  approved: '#f59e0b',
  paid: '#10b981',
  cancelled: '#6b7280',
};

const formatAmountFR = (amount) => {
  if (amount == null) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default function InvoiceKPIWidgets() {
  const { t } = useTranslation(['invoices']);
  const { kpi, fetchKpi, isLoading } = useInvoices();

  useEffect(() => {
    fetchKpi();
  }, []);

  if (isLoading && !kpi) {
    return <div className="text-center py-8 text-gray-500">{t('common:status.loading', 'Chargement...')}</div>;
  }

  if (!kpi) return null;

  const statusData = (kpi.statusDistribution || []).map((item) => ({
    name: t(`invoices:status.${item.status}`, item.status),
    value: item.count,
    fill: STATUS_COLORS_CHART[item.status] || '#6b7280',
  }));

  const monthlyData = (kpi.monthlySpend || []).map((item) => ({
    month: item.month,
    amount: Number(item.amount),
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          data-testid="kpi-unpaid"
          title={t('invoices:kpi.apUnpaid')}
          value={formatAmountFR(kpi.apUnpaidTotal)}
          icon="💰"
          color="orange"
        />
        <StatCard
          data-testid="kpi-paid-mtd"
          title={t('invoices:kpi.apPaidMtd')}
          value={formatAmountFR(kpi.apPaidMtd)}
          icon="✅"
          color="green"
        />
        <StatCard
          data-testid="kpi-pending"
          title={t('invoices:kpi.apPendingApproval')}
          value={kpi.apPendingApproval || 0}
          icon="⏳"
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly AP Spend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-4">{t('invoices:kpi.monthlySpend')}</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatAmountFR(value)} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              {t('common:status.noData', 'Aucune donnée')}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-4">{t('invoices:kpi.statusDist')}</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              {t('common:status.noData', 'Aucune donnée')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
