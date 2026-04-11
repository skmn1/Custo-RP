/**
 * MobilePayslipDetail — Task 67 (Part B)
 *
 * Full-screen payslip detail with prominent net pay, visual breakdown bar,
 * earnings/deductions line items, summary, and floating PDF download button.
 * Reuses useEssPayslips hook (fetchDetail) from task 50.
 */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEssPayslips } from '../../../hooks/useEssPayslips';
import { useEssConnectivity } from '../../../contexts/EssConnectivityContext';
import { useLocaleFormat, useLocaleDateFns } from '../../../utils/formatLocale';
import MobileHeader from '../../mobile/MobileHeader';
import EssOfflineFallback from '../EssOfflineFallback';

// ── PayBreakdownBar ──────────────────────────────────────────────

const PayBreakdownBar = ({ gross, deductions, net, t }) => {
  if (!gross || gross <= 0) return null;
  const netPct = (net / gross) * 100;
  const deductionPct = (deductions / gross) * 100;

  return (
    <div className="mx-4 mt-4" aria-hidden="true" data-testid="pay-breakdown-bar">
      <div className="h-3 rounded-full overflow-hidden flex gap-px bg-[var(--mobile-bg-grouped)]">
        {/* Net segment — sage green */}
        <div
          className="transition-[width] duration-700 ease-out"
          style={{
            width: `${netPct}%`,
            backgroundColor: 'var(--mobile-success)',
          }}
        />
        {/* Deductions segment — dusty rose */}
        <div
          className="transition-[width] duration-700 ease-out"
          style={{
            width: `${deductionPct}%`,
            backgroundColor: 'var(--mobile-destructive)',
          }}
        />
      </div>
      <div className="flex justify-between mt-2 text-mobile-caption text-[var(--mobile-label-secondary)]">
        <span style={{ color: 'var(--mobile-success)' }}>● {t('mobile.payslips.netPay')}</span>
        <span style={{ color: 'var(--mobile-destructive)' }}>● {t('mobile.payslips.deductions')}</span>
        <span className="text-[var(--mobile-label-tertiary)]">● {t('mobile.payslips.gross')}</span>
      </div>
    </div>
  );
};

// ── LineItem ─────────────────────────────────────────────────────

const LineItem = ({ label, amount, isNegative, formatCurrency }) => (
  <div className="flex justify-between px-4 py-2" data-testid="payslip-line-item">
    <span className="text-mobile-body text-[var(--mobile-label-primary)]">{label}</span>
    <span
      className={`text-mobile-body font-medium ${
        isNegative
          ? 'text-[var(--mobile-destructive)]'
          : 'text-[var(--mobile-label-primary)]'
      }`}
    >
      {isNegative ? '−' : ''}{formatCurrency(Math.abs(amount))}
    </span>
  </div>
);

// ── SectionHeader ────────────────────────────────────────────────

const SectionHeader = ({ label }) => (
  <div className="px-4 pt-5 pb-1">
    <span className="text-mobile-footnote font-semibold text-[var(--mobile-label-secondary)] uppercase tracking-wide">
      {label}
    </span>
  </div>
);

// ── Loading Skeleton ─────────────────────────────────────────────

const DetailSkeleton = () => (
  <div className="animate-pulse" data-testid="payslip-detail-skeleton">
    <div className="px-4 pt-4 space-y-3">
      <div className="h-5 w-20 bg-gray-200 rounded" />
      <div className="h-10 w-40 bg-gray-200 rounded mx-auto" />
      <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
    </div>
    <div className="mx-4 mt-4 h-3 bg-gray-200 rounded-full" />
    <div className="mt-6 space-y-3 px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────

const MobilePayslipDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation('ess');
  const { isOnline } = useEssConnectivity();
  const { detail, detailLoading, detailError, restricted, fetchDetail } = useEssPayslips();
  const { formatCurrency } = useLocaleFormat();
  const { formatDate } = useLocaleDateFns();

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id, fetchDetail]);

  // Loading
  if (detailLoading) {
    return (
      <div data-testid="mobile-payslip-detail">
        <MobileHeader title="" backTo="/app/ess/payslips" />
        <DetailSkeleton />
      </div>
    );
  }

  // Error
  if (detailError) {
    return (
      <div data-testid="mobile-payslip-detail">
        <MobileHeader title="" backTo="/app/ess/payslips" />
        <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="mobile-payslip-detail-error">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)] mb-4">
            {t('dashboard.unableToLoad')}
          </p>
          <button
            onClick={() => fetchDetail(id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mobile-tint)] text-white rounded-lg text-mobile-body font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Restricted
  if (restricted) {
    return (
      <div data-testid="mobile-payslip-detail">
        <MobileHeader title="" backTo="/app/ess/payslips" />
        <div className="px-4 py-12 text-center">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)]">
            {t('payslips.restricted')}
          </p>
        </div>
      </div>
    );
  }

  // Offline with no data
  if (!detail && !isOnline && !detailLoading) {
    return (
      <div data-testid="mobile-payslip-detail">
        <MobileHeader title="" backTo="/app/ess/payslips" />
        <EssOfflineFallback />
      </div>
    );
  }

  if (!detail) return null;

  const lines = detail.lines || { earnings: [], deductions: [] };
  const earnings = lines.earnings || [];
  const deductions = lines.deductions || [];

  return (
    <div className="pb-28" data-testid="mobile-payslip-detail">
      {/* Header with back button */}
      <MobileHeader
        title={detail.periodLabel}
        backTo="/app/ess/payslips"
      />

      {/* Net pay — prominent */}
      <div className="text-center px-4 py-4" data-testid="payslip-net-hero">
        <p
          className="text-mobile-largeTitle font-bold"
          style={{ color: 'var(--mobile-tint)' }}
        >
          {formatCurrency(detail.netPay)}
        </p>
        <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-1">
          {t('mobile.payslips.netPay')}
        </p>
      </div>

      {/* Visual breakdown bar */}
      <PayBreakdownBar
        gross={detail.grossPay}
        deductions={detail.totalDeductions}
        net={detail.netPay}
        t={t}
      />

      {/* Earnings section */}
      {earnings.length > 0 && (
        <>
          <SectionHeader label={t('mobile.payslips.earnings')} />
          {earnings.map((line, i) => (
            <LineItem
              key={i}
              label={line.label}
              amount={line.amount}
              isNegative={false}
              formatCurrency={formatCurrency}
            />
          ))}
        </>
      )}

      {/* Deductions section */}
      {deductions.length > 0 && (
        <>
          <SectionHeader label={t('mobile.payslips.deductions')} />
          {deductions.map((line, i) => (
            <LineItem
              key={i}
              label={line.label}
              amount={line.amount}
              isNegative={true}
              formatCurrency={formatCurrency}
            />
          ))}
        </>
      )}

      {/* Summary section */}
      <SectionHeader label={t('mobile.payslips.summary')} />
      <LineItem
        label={t('mobile.payslips.grossPay')}
        amount={detail.grossPay}
        isNegative={false}
        formatCurrency={formatCurrency}
      />
      <LineItem
        label={t('mobile.payslips.totalDeductions')}
        amount={detail.totalDeductions}
        isNegative={true}
        formatCurrency={formatCurrency}
      />
      <div className="flex justify-between px-4 py-2 font-bold">
        <span className="text-mobile-body text-[var(--mobile-label-primary)]">
          {t('mobile.payslips.netPay')}
        </span>
        <span className="text-mobile-body text-[var(--mobile-label-primary)]">
          {formatCurrency(detail.netPay)}
        </span>
      </div>

      {/* Paid date */}
      {detail.paidAt && (
        <div className="px-4 py-3 mt-2">
          <p className="text-mobile-footnote text-[var(--mobile-label-tertiary)]">
            {t('mobile.payslips.paid', { date: formatDate(detail.paidAt, 'dd MMMM yyyy') })}
          </p>
        </div>
      )}

      {/* Floating PDF download button */}
      {detail.pdfUrl && (
        <a
          href={detail.pdfUrl}
          download={`payslip-${detail.periodLabel || id}.pdf`}
          className="fixed bottom-24 left-4 right-4 bg-[var(--mobile-tint)] text-white rounded-2xl py-3.5 text-center text-mobile-body font-semibold flex items-center justify-center gap-2 active:opacity-80 z-40"
          data-testid="payslip-download-btn"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          {t('mobile.payslips.downloadPdf')}
        </a>
      )}
    </div>
  );
};

export default MobilePayslipDetail;
