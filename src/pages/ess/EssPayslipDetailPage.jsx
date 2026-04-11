import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEssPayslips } from '../../hooks/useEssPayslips';
import PayslipPdf from '../../components/ess/PayslipPdf';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import EssOfflineFallback from '../../components/ess/EssOfflineFallback';
import StaleDataIndicator from '../../components/ess/StaleDataIndicator';
import MobilePayslipDetail from '../../components/ess/payslips/MobilePayslipDetail';

/* ─── Helpers ─────────────────────────────────────────────── */

function fmtCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-600',
};

/* ─── Page ────────────────────────────────────────────────── */

const EssPayslipDetailPage = () => {
  const isMobile = useMobileLayout();
  const { id } = useParams();
  const { t } = useTranslation('ess');
  const { isOnline } = useEssConnectivity();
  const { detail, detailLoading, detailError, restricted, fetchDetail, detailCached, detailFetchedAt } = useEssPayslips();

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id, fetchDetail]);

  if (isMobile) return <MobilePayslipDetail />;

  if (detailLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link to="/app/ess/payslips" className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block">
          ← {t('payslips.backToList')}
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {detailError}
        </div>
      </div>
    );
  }

  if (restricted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link to="/app/ess/payslips" className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block">
          ← {t('payslips.backToList')}
        </Link>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-amber-700 font-medium">{t('payslips.restricted')}</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    if (!isOnline && !detailLoading) {
      return (
        <div className="max-w-2xl mx-auto">
          <Link to="/app/ess/payslips" className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block">
            ← {t('payslips.backToList')}
          </Link>
          <EssOfflineFallback />
        </div>
      );
    }
    return null;
  }

  const lines = detail.lines || { earnings: [], deductions: [] };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/app/ess/payslips" className="text-indigo-600 hover:text-indigo-700 text-sm">
          ← {t('payslips.backToList')}
        </Link>
        <PayslipPdf detail={detail} t={t} />
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{detail.periodLabel}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('payslips.periodRange', { start: detail.periodStart, end: detail.periodEnd })}
            </p>
            {detail.employeeName && (
              <p className="text-sm text-gray-500">{detail.employeeName}</p>
            )}
            <StaleDataIndicator isCached={detailCached} fetchedAt={detailFetchedAt} />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[detail.status] || statusColors.draft}`}>
            {t(`payslips.status.${detail.status}`)}
          </span>
        </div>

        {/* Summary boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryBox label={t('payslips.workedHours')} value={detail.workedHours != null ? `${detail.workedHours}h` : '—'} />
          <SummaryBox label={t('payslips.grossPay')} value={fmtCurrency(detail.grossPay, detail.currency)} />
          <SummaryBox label={t('payslips.totalDeductions')} value={`−${fmtCurrency(detail.totalDeductions, detail.currency)}`} negative />
          <SummaryBox label={t('payslips.netPay')} value={fmtCurrency(detail.netPay, detail.currency)} highlight />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Earnings */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {t('payslips.earnings')}
          </h2>
          <div className="space-y-2">
            {(lines.earnings || []).map((line, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{line.label}</span>
                <span className="font-medium text-gray-900">{fmtCurrency(line.amount, detail.currency)}</span>
              </div>
            ))}
            {(!lines.earnings || lines.earnings.length === 0) && (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between text-sm font-semibold">
            <span className="text-gray-700">{t('payslips.totalEarnings')}</span>
            <span className="text-gray-900">{fmtCurrency(detail.grossPay, detail.currency)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {t('payslips.deductions')}
          </h2>
          <div className="space-y-2">
            {(lines.deductions || []).map((line, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{line.label}</span>
                <span className="font-medium text-red-600">−{fmtCurrency(Math.abs(line.amount), detail.currency)}</span>
              </div>
            ))}
            {(!lines.deductions || lines.deductions.length === 0) && (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between text-sm font-semibold">
            <span className="text-gray-700">{t('payslips.totalDeductions')}</span>
            <span className="text-red-600">−{fmtCurrency(detail.totalDeductions, detail.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {detail.paidAt && (
            <div>
              <p className="text-gray-500 text-xs mb-1">{t('payslips.paidOn', { date: '' }).replace(' ', '')}</p>
              <p className="font-medium text-gray-900">{new Date(detail.paidAt).toLocaleDateString()}</p>
            </div>
          )}
          {detail.paymentMethod && (
            <div>
              <p className="text-gray-500 text-xs mb-1">Payment Method</p>
              <p className="font-medium text-gray-900">{t(`payslips.paymentMethod.${detail.paymentMethod}`)}</p>
            </div>
          )}
          {detail.employerContributions != null && (
            <div>
              <p className="text-gray-500 text-xs mb-1">{t('payslips.employerContributions')}</p>
              <p className="font-medium text-gray-900">{fmtCurrency(detail.employerContributions, detail.currency)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Summary box ─────────────────────────────────────────── */

function SummaryBox({ label, value, negative, highlight }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-indigo-50' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${negative ? 'text-red-600' : highlight ? 'text-indigo-700' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

export default EssPayslipDetailPage;
