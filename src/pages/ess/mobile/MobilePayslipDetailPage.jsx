/**
 * MobilePayslipDetailPage — Task 82 Part B (SCREEN_89)
 *
 * Full-screen payslip detail, Nexus Kinetic styled:
 * - Back navigation
 * - Net pay hero card (Magenta gradient)
 * - Earnings breakdown section (base salary, overtime, bonuses)
 * - Deductions breakdown section
 * - Employer contributions tinted card
 * - Direct PDF download link
 *
 * Data: useEssPayslipDetail(id) → GET /api/ess/payslips/:id
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssPayslipDetail } from '../../../hooks/useEssPayslipDetail';
import { useLocaleFormat } from '../../../utils/formatLocale';
import { API_BASE_URL } from '../../../api/config';

// ── Skeleton ─────────────────────────────────────────────────────

const MobilePayslipSkeleton = () => (
  <div className="pb-6 max-w-4xl mx-auto animate-pulse" data-testid="payslip-skeleton">
    <div className="px-6 pt-6">
      <div className="h-4 w-24 bg-surface-variant rounded" />
    </div>
    <div className="px-6 mt-4">
      <div className="h-3 w-14 bg-surface-variant rounded mb-2" />
      <div className="h-7 w-48 bg-surface-variant rounded" />
      <div className="h-3 w-32 bg-surface-variant rounded mt-2" />
    </div>
    <div className="mx-6 mt-6 h-36 bg-surface-variant rounded-2xl" />
    <div className="px-6 mt-6 space-y-4">
      <div className="h-5 w-24 bg-surface-variant rounded" />
      <div className="h-32 bg-surface-variant rounded-2xl" />
      <div className="h-5 w-24 bg-surface-variant rounded" />
      <div className="h-24 bg-surface-variant rounded-2xl" />
    </div>
  </div>
);

// ── PayslipSection ────────────────────────────────────────────────

const PayslipSection = ({ title, items, total, negative = false, formatCurrency, t }) => (
  <div className="mt-6">
    <h2 className="font-headline text-base font-bold text-on-surface mb-3">{title}</h2>
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(25,28,30,0.06)]" data-testid={`payslip-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-outline-variant/30' : ''}`}
        >
          <span className="text-on-surface-variant text-sm font-body">{item.label}</span>
          <span className={`font-bold text-sm font-body ${negative ? 'text-error' : 'text-on-surface'}`}>
            {negative ? '−' : ''}{formatCurrency(item.amount ?? 0)}
          </span>
        </div>
      ))}
      {total && (
        <div className="flex justify-between px-5 py-4 border-t-2 border-outline-variant bg-surface-container">
          <span className="font-headline text-sm font-bold text-on-surface">{total.label}</span>
          <span className="font-headline text-sm font-bold text-on-surface">{formatCurrency(total.amount ?? 0)}</span>
        </div>
      )}
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────

export const MobilePayslipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('ess');
  const { formatCurrency } = useLocaleFormat();
  const { data: payslip, isLoading, error, refetch } = useEssPayslipDetail(id);

  const pdfUrl = `${API_BASE_URL}/ess/payslips/${encodeURIComponent(id ?? '')}/pdf`;

  if (isLoading) return <MobilePayslipSkeleton />;

  if (error || !payslip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center" data-testid="payslip-error">
        <span className="material-symbols-outlined text-5xl text-error mb-4" aria-hidden="true">error_outline</span>
        <p className="text-on-surface-variant font-body text-sm mb-4">
          {error === 'restricted'
            ? t('mobile.payroll.restricted')
            : (error ?? t('mobile.payroll.notFound'))}
        </p>
        <button
          onClick={() => error ? refetch() : navigate(-1)}
          className="px-6 py-3 rounded-xl text-on-primary font-bold text-sm font-label"
          style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
        >
          {error ? t('mobile.payroll.retry') : t('mobile.payroll.back')}
        </button>
      </div>
    );
  }

  const earningsItems = [
    { label: t('mobile.payroll.baseSalary'), amount: payslip.baseSalary },
    ...(payslip.overtime != null
      ? [{ label: `${t('mobile.payroll.overtime')}${payslip.overtimeHours ? ` (${payslip.overtimeHours}h)` : ''}`, amount: payslip.overtime }]
      : []),
    ...(payslip.bonuses?.map(b => ({ label: b.name, amount: b.amount })) ?? []),
  ];

  const deductionItems = (payslip.deductions ?? []).map(d => ({ label: d.name, amount: d.amount }));

  return (
    <>
      <Helmet><meta name="theme-color" content="#fff8f7" /></Helmet>
      <div className="pb-6 max-w-4xl mx-auto" data-testid="payslip-detail">

        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 pt-6 text-primary font-semibold text-sm font-body hover:opacity-80 transition-opacity"
          data-testid="back-btn"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
          {t('mobile.payroll.back')}
        </button>

        {/* Title */}
        <div className="px-6 mt-4">
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.15em] font-label block mb-1">
            {t('mobile.payroll.payslip')}
          </span>
          <h1 className="font-headline text-2xl font-bold text-on-surface">{payslip.period ?? payslip.payPeriod ?? '—'}</h1>
          <p className="text-on-surface-variant text-sm mt-0.5 font-body">
            {t('mobile.payroll.paid')}: {payslip.payDate ?? '—'}
          </p>
        </div>

        {/* Net pay hero */}
        <div
          className="mx-6 mt-6 relative overflow-hidden rounded-2xl p-8 text-on-primary"
          style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
          data-testid="net-pay-hero"
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full pointer-events-none" aria-hidden="true" />
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] font-label block mb-2">
            {t('mobile.payroll.netPay')}
          </span>
          <p className="font-headline text-5xl font-extrabold tracking-tight">
            {formatCurrency(payslip.netPay ?? 0)}
          </p>
          <p className="text-white/80 text-sm mt-2 font-body">
            {t('mobile.payroll.grossPay')}: {formatCurrency(payslip.grossPay ?? 0)}
            {' · '}
            {t('mobile.payroll.deductions')}: {formatCurrency(payslip.totalDeductions ?? 0)}
          </p>
        </div>

        {/* Bento grid: earnings + deductions on md+ */}
        <div className="px-6 md:grid md:grid-cols-12 md:gap-6">
          <div className="md:col-span-8">
            <PayslipSection
              title={t('mobile.payroll.earnings')}
              items={earningsItems}
              total={{ label: t('mobile.payroll.grossPay'), amount: payslip.grossPay }}
              negative={false}
              formatCurrency={formatCurrency}
              t={t}
            />
          </div>
          <div className="md:col-span-4 md:mt-0">
            <PayslipSection
              title={t('mobile.payroll.deductions')}
              items={deductionItems}
              total={{ label: t('mobile.payroll.totalDeductions'), amount: payslip.totalDeductions }}
              negative={true}
              formatCurrency={formatCurrency}
              t={t}
            />
          </div>
        </div>

        {/* Employer contributions */}
        {(payslip.employerContributions ?? []).length > 0 && (
          <div className="px-6 mt-6" data-testid="employer-contributions">
            <div className="bg-primary-container/30 rounded-2xl p-6">
              <h2 className="font-headline text-base font-bold text-on-surface mb-4">
                {t('mobile.payroll.employerContributions')}
              </h2>
              {payslip.employerContributions.map((c, i) => (
                <div
                  key={i}
                  className={`flex justify-between py-2.5 ${i > 0 ? 'border-t border-outline-variant/40' : ''}`}
                >
                  <span className="text-on-surface-variant text-sm font-body">{c.name}</span>
                  <span className="font-bold text-on-surface text-sm font-body">{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF download — direct anchor link */}
        <div className="px-6 mt-6">
          <a
            href={pdfUrl}
            download={`payslip-${id}.pdf`}
            aria-label={t('mobile.payroll.downloadPdfLabel', { period: payslip.period ?? payslip.payPeriod ?? id })}
            className="w-full py-4 rounded-xl text-on-primary font-bold text-base font-headline flex items-center justify-center gap-2 active:scale-[0.97] transition-all no-underline"
            style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
            data-testid="download-pdf-btn"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">download</span>
            {t('mobile.payroll.downloadPdf')}
          </a>
        </div>
      </div>
    </>
  );
};
