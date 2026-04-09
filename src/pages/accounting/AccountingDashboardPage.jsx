import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import StatCard from '../../components/ui/StatCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const STATUS_COLORS = {
  received: '#3b82f6',
  approved: '#f59e0b',
  paid: '#10b981',
  cancelled: '#6b7280',
};

const fmt = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount ?? 0);

export default function AccountingDashboardPage() {
  const { t } = useTranslation(['accounting', 'invoices', 'common']);
  const { invoices, fetchInvoices, kpi, fetchKpi, isLoading } = useInvoices();

  useEffect(() => {
    fetchInvoices();
    fetchKpi();
  }, []);

  /* ── derived KPIs ── */
  const arInvoices = useMemo(() => invoices.filter((i) => i.type === 'AR'), [invoices]);
  const apInvoices = useMemo(() => invoices.filter((i) => i.type === 'AP'), [invoices]);

  const arOpen = useMemo(
    () => arInvoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + (i.amountOutstanding ?? 0), 0),
    [arInvoices],
  );
  const apOpen = useMemo(
    () => apInvoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + (i.amountOutstanding ?? 0), 0),
    [apInvoices],
  );

  const now = new Date();
  const overdueAr = useMemo(
    () => arInvoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && new Date(i.dueDate) < now),
    [arInvoices],
  );

  const revenueMtd = useMemo(() => {
    const month = now.getMonth();
    const year = now.getFullYear();
    return arInvoices
      .filter((i) => i.status === 'paid' && new Date(i.issueDate).getMonth() === month && new Date(i.issueDate).getFullYear() === year)
      .reduce((s, i) => s + (i.totalAmount ?? 0), 0);
  }, [arInvoices]);

  /* ── AR vs AP monthly (last 12 months) ── */
  const monthlyTrend = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      const arTotal = arInvoices.filter((inv) => (inv.issueDate || '').startsWith(key)).reduce((s, inv) => s + (inv.totalAmount ?? 0), 0);
      const apTotal = apInvoices.filter((inv) => (inv.issueDate || '').startsWith(key)).reduce((s, inv) => s + (inv.totalAmount ?? 0), 0);
      months.push({ month: label, ar: arTotal, ap: apTotal });
    }
    return months;
  }, [arInvoices, apInvoices]);

  /* ── Status distribution (AR) ── */
  const statusDist = useMemo(() => {
    const counts = {};
    arInvoices.forEach((i) => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: t(`invoices:status.${status}`, status),
      value: count,
      fill: STATUS_COLORS[status] || '#6b7280',
    }));
  }, [arInvoices, t]);

  /* ── Cash flow projection (next 60 days, weekly buckets) ── */
  const cashFlow = useMemo(() => {
    const buckets = [];
    const today = new Date();
    for (let w = 0; w < 9; w++) {
      const start = new Date(today);
      start.setDate(today.getDate() + w * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = start.toLocaleDateString('en', { month: 'short', day: 'numeric' });

      const inflow = arInvoices
        .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
        .filter((i) => { const d = new Date(i.dueDate); return d >= start && d <= end; })
        .reduce((s, i) => s + (i.amountOutstanding ?? 0), 0);

      const outflow = apInvoices
        .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
        .filter((i) => { const d = new Date(i.dueDate); return d >= start && d <= end; })
        .reduce((s, i) => s + (i.amountOutstanding ?? 0), 0);

      buckets.push({ week: label, in: inflow, out: outflow });
    }
    // Cumulative net line
    let running = 0;
    buckets.forEach((b) => {
      running += b.in - b.out;
      b.net = running;
    });
    return buckets;
  }, [arInvoices, apInvoices]);

  /* ── Top 10 overdue AR by amount ── */
  const topOverdue = useMemo(
    () => [...overdueAr].sort((a, b) => (b.amountOutstanding ?? 0) - (a.amountOutstanding ?? 0)).slice(0, 10),
    [overdueAr],
  );

  if (isLoading && invoices.length === 0) {
    return <div className="text-center py-12 text-gray-500">{t('common:status.loading')}</div>;
  }

  return (
    <div className="space-y-6" data-testid="accounting-dashboard">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounting:dashboard.title', 'Accounting Dashboard')}</h1>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('accounting:dashboard.arOpen', 'Total AR Open')} value={fmt(arOpen)} icon="📈" color="blue" data-testid="kpi-ar-open" />
        <StatCard title={t('accounting:dashboard.apOpen', 'Total AP Open')} value={fmt(apOpen)} icon="📉" color="amber" data-testid="kpi-ap-open" />
        <StatCard title={t('accounting:dashboard.overdueAr', 'Overdue AR')} value={overdueAr.length} icon="⚠️" color="red" data-testid="kpi-overdue-ar" />
        <StatCard title={t('accounting:dashboard.revenueMtd', 'Revenue MTD')} value={fmt(revenueMtd)} icon="💰" color="green" data-testid="kpi-revenue-mtd" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AR vs AP trend */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{t('accounting:dashboard.arVsAp', 'AR vs AP (12 Months)')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="ar" name="AR" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="ap" name="AP" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice status distribution donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{t('accounting:dashboard.statusDist', 'Invoice Status Distribution')}</h3>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {statusDist.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-16">{t('common:status.noData')}</p>
          )}
        </div>
      </div>

      {/* ── Cash Flow Projection ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{t('accounting:dashboard.cashFlow', 'Cash Flow Projection (60 Days)')}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cashFlow}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Area type="monotone" dataKey="in" name={t('accounting:dashboard.expectedIn', 'Expected In')} fill="#3b82f680" stroke="#3b82f6" />
            <Area type="monotone" dataKey="out" name={t('accounting:dashboard.expectedOut', 'Expected Out')} fill="#f59e0b80" stroke="#f59e0b" />
            <Line type="monotone" dataKey="net" name={t('accounting:dashboard.netPosition', 'Net Position')} stroke="#10b981" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Overdue Invoice Table ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800" data-testid="overdue-table">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{t('accounting:dashboard.overdueTable', 'Top 10 Overdue AR Invoices')}</h3>
        {topOverdue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">{t('invoices:field.number', 'Invoice #')}</th>
                  <th className="py-2 pr-4">{t('invoices:field.supplier', 'Customer')}</th>
                  <th className="py-2 pr-4">{t('invoices:field.dueDate', 'Due Date')}</th>
                  <th className="py-2 pr-4 text-right">{t('invoices:field.outstanding', 'Outstanding')}</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {topOverdue.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      <Link to={`/app/accounting/invoices/${inv.id}`} className="text-blue-600 hover:underline">{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{inv.counterpartyName}</td>
                    <td className="py-2 pr-4 text-red-600">{inv.dueDate}</td>
                    <td className="py-2 pr-4 text-right font-medium">{fmt(inv.amountOutstanding)}</td>
                    <td className="py-2">
                      <Link to={`/app/accounting/invoices/${inv.id}`} className="text-xs text-amber-600 hover:underline">
                        {t('invoices:payment.record', 'Record Payment')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">{t('accounting:dashboard.noOverdue', 'No overdue AR invoices')}</p>
        )}
      </div>
    </div>
  );
}
