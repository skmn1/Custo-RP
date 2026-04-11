/**
 * MobilePayrollHubPage — Task 82 Part A (SCREEN_7)
 *
 * ESS Payroll Hub, Nexus Kinetic styled:
 * - Year-to-Date earnings hero card (Magenta gradient)
 * - Current period summary with status chip and View Payslip CTA
 * - Financial Tools quick-link bento grid
 * - Recent Activity list
 *
 * Data: useEssPayrollSummary() → GET /api/ess/payslips/summary
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssPayrollSummary } from '../../../hooks/useEssPayrollSummary';
import { useLocaleFormat } from '../../../utils/formatLocale';

// ── Skeleton ─────────────────────────────────────────────────────

const MobilePayrollSkeleton = () => (
  <div className="pb-6 max-w-4xl mx-auto animate-pulse" data-testid="payroll-skeleton">
    <div className="px-6 pt-6 pb-2">
      <div className="h-3 w-24 bg-surface-variant rounded mb-2" />
      <div className="h-9 w-40 bg-surface-variant rounded" />
    </div>
    <div className="px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-40 bg-surface-variant rounded-2xl" />
      <div className="h-40 bg-surface-variant rounded-2xl" />
    </div>
    <div className="px-6 mt-6">
      <div className="h-5 w-32 bg-surface-variant rounded mb-3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-surface-variant rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

// ── Error ─────────────────────────────────────────────────────────

const MobilePayrollError = ({ message, onRetry, t }) => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center" data-testid="payroll-error">
    <span className="material-symbols-outlined text-5xl text-error mb-4" aria-hidden="true">error_outline</span>
    <p className="text-on-surface-variant font-body text-sm mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-3 rounded-xl text-on-primary font-bold text-sm font-label"
      style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
    >
      {t('mobile.payroll.retry')}
    </button>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────

export const MobilePayrollHubPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('ess');
  const { formatCurrency } = useLocaleFormat();
  const { data, isLoading, error, refetch } = useEssPayrollSummary();

  if (isLoading) return <MobilePayrollSkeleton />;
  if (error) return <MobilePayrollError message={error} onRetry={refetch} t={t} />;
  if (!data) return <MobilePayrollSkeleton />;

  const ytdProgress = Math.min(((data.ytdPaidMonths ?? 0) / 12) * 100, 100);

  return (
    <>
      <Helmet><meta name="theme-color" content="#fff8f7" /></Helmet>
      <div className="pb-6 max-w-4xl mx-auto" data-testid="payroll-hub">

        {/* Editorial header */}
        <div className="px-6 pt-6 pb-2">
          <span className="text-primary font-bold text-[10px] tracking-[0.15em] uppercase block mb-1 font-label">
            {t('mobile.payroll.financialOverview')}
          </span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
            {t('mobile.payroll.title')}
          </h1>
        </div>

        {/* Hero grid */}
        <div className="px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* YTD hero card */}
          <div
            className="lg:col-span-2 relative overflow-hidden rounded-2xl p-8 text-on-primary shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
            data-testid="ytd-hero-card"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 right-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none" aria-hidden="true" />

            <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] font-label block mb-2">
              {t('mobile.payroll.ytdEarnings')}
            </span>
            <p className="font-headline text-5xl font-extrabold tracking-tight leading-none relative z-10">
              {formatCurrency(data.ytdGross ?? 0)}
            </p>
            <p className="text-white/80 text-sm mt-2 font-body relative z-10">
              {data.ytdPeriod ?? ''}
            </p>
            <div className="mt-4 h-1.5 bg-white/20 rounded-full relative z-10" role="progressbar" aria-valuenow={ytdProgress} aria-valuemin={0} aria-valuemax={100} aria-label={t('mobile.payroll.ytdProgress')}>
              <div className="h-full bg-white rounded-full transition-[width]" style={{ width: `${ytdProgress}%` }} />
            </div>
            <p className="text-white/70 text-xs mt-1.5 font-body relative z-10">
              {t('mobile.payroll.payslipsProcessed', { count: data.ytdPaidMonths ?? 0 })}
            </p>
          </div>

          {/* Current period card */}
          <div
            className="bg-surface-container-lowest rounded-2xl p-6 border-l-4 border-primary shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
            data-testid="current-period-card"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.15em] font-label block mb-1">
                  {t('mobile.payroll.currentPeriod')}
                </span>
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  {data.currentPayslip?.period ?? '—'}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-container/40 text-primary text-[10px] font-bold uppercase tracking-wide font-label">
                {data.currentPayslip?.status ?? ''}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-on-surface-variant text-sm font-body">{t('mobile.payroll.netPay')}</span>
                <span className="font-headline text-xl font-bold text-on-surface">
                  {formatCurrency(data.currentPayslip?.netPay ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-on-surface-variant text-sm font-body">{t('mobile.payroll.grossPay')}</span>
                <span className="text-on-surface-variant text-sm font-body">
                  {formatCurrency(data.currentPayslip?.grossPay ?? 0)}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/app/ess/payroll/${data.currentPayslip?.id}`)}
              className="mt-4 w-full py-3 rounded-xl text-on-primary font-bold text-sm font-label tracking-wide active:scale-[0.97] transition-all"
              style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
              data-testid="view-payslip-btn"
            >
              {t('mobile.payroll.viewPayslip')}
            </button>
          </div>
        </div>

        {/* Bento quick links */}
        <div className="px-6 mt-6" data-testid="financial-tools">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-3">
            {t('mobile.payroll.financialTools')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'receipt_long', label: t('mobile.payroll.taxDocs'), to: '/app/ess/payroll/tax', fill: false },
              { icon: 'account_balance', label: t('mobile.payroll.banking'), to: '/app/ess/payroll/banking', fill: true },
              { icon: 'history', label: t('mobile.payroll.history'), to: '/app/ess/payroll/history', fill: false },
              { icon: 'bar_chart', label: t('mobile.payroll.analytics'), to: '/app/ess/payroll/analytics', fill: true },
            ].map(link => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="bg-surface-container-lowest rounded-2xl p-5 text-left hover:shadow-md active:scale-[0.97] transition-all shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
                data-testid={`quick-link-${link.icon}`}
              >
                <span
                  className="material-symbols-outlined text-2xl text-primary mb-3 block"
                  aria-hidden="true"
                  style={link.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {link.icon}
                </span>
                <p className="font-headline text-sm font-bold text-on-surface">{link.label}</p>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1 font-label">
                  {t('mobile.payroll.open')}
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {(data.recentActivity ?? []).length > 0 && (
          <div className="px-6 mt-6" data-testid="recent-activity">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-3">
              {t('mobile.payroll.recentActivity')}
            </h2>
            <div className="space-y-2">
              {(data.recentActivity).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-primary text-xl"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon ?? 'payments'}
                    </span>
                    <div>
                      <p className="font-headline text-sm font-bold text-on-surface">{item.label}</p>
                      <p className="text-outline text-xs font-body">{item.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-on-surface font-body">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
