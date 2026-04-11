/**
 * MobilePayslipHistoryPage — Task 82 Part C (SCREEN_45)
 *
 * Payslip history list, Nexus Kinetic styled:
 * - Editorial header
 * - Search input (filters by period label, case-insensitive)
 * - Year filter dropdown (derived from fetched data)
 * - Payslips grouped by year, newest first
 * - Tap row to open detail; inline download button per row
 *
 * Data: useEssPayslips() → GET /api/ess/payslips
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssPayslips } from '../../../hooks/useEssPayslips';
import { useLocaleFormat } from '../../../utils/formatLocale';
import { API_BASE_URL } from '../../../api/config';

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Extract a calendar year from a payslip.
 * Prefers payDate, falls back to period string beginning.
 */
function getPayYear(payslip) {
  const raw = payslip.payDate ?? payslip.paidAt ?? payslip.period ?? '';
  const d = new Date(raw);
  return Number.isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
}

// ── Skeleton ─────────────────────────────────────────────────────

const MobileHistorySkeleton = () => (
  <div className="pb-6 max-w-2xl mx-auto animate-pulse" data-testid="history-skeleton">
    <div className="px-6 pt-6">
      <div className="h-4 w-24 bg-surface-variant rounded" />
    </div>
    <div className="px-6 mt-4">
      <div className="h-3 w-16 bg-surface-variant rounded mb-2" />
      <div className="h-9 w-56 bg-surface-variant rounded" />
    </div>
    <div className="px-6 mt-5">
      <div className="h-12 bg-surface-variant rounded-xl" />
    </div>
    <div className="px-6 mt-6 space-y-2">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-surface-variant rounded-2xl" />
      ))}
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────

export const MobilePayslipHistoryPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('ess');
  const { formatCurrency } = useLocaleFormat();
  const { payslips, isLoading } = useEssPayslips();

  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState(null); // null = all years

  if (isLoading) return <MobileHistorySkeleton />;

  // Filter by search text
  const filtered = (payslips ?? []).filter(p => {
    const label = p.period ?? p.periodLabel ?? '';
    return label.toLowerCase().includes(search.toLowerCase());
  });

  // Derive available years from full (unfiltered) list
  const allYears = [...new Set((payslips ?? []).map(getPayYear))].sort((a, b) => b - a);

  // Group filtered payslips by year
  const grouped = filtered.reduce((acc, p) => {
    const year = getPayYear(p);
    (acc[year] ??= []).push(p);
    return acc;
  }, {});

  // Sort years descending; apply optional year filter
  const yearsToShow = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)
    .filter(y => selectedYear == null || y === selectedYear);

  return (
    <>
      <Helmet><meta name="theme-color" content="#fff8f7" /></Helmet>
      <div className="pb-6 max-w-2xl mx-auto" data-testid="payslip-history">

        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 pt-6 text-primary font-semibold text-sm font-body hover:opacity-80 transition-opacity"
          data-testid="back-btn"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
          {t('mobile.payroll.back')}
        </button>

        {/* Editorial header */}
        <div className="px-6 mt-4">
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.15em] font-label block mb-1">
            {t('mobile.payroll.records')}
          </span>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {t('mobile.payroll.historyTitle')}
          </h1>
        </div>

        {/* Search + year filter */}
        <div className="px-6 mt-5 flex gap-3">
          <div className="relative group flex-1">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors"
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="search"
              placeholder={t('mobile.payroll.searchPayslips')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface placeholder:text-outline-variant font-body text-sm"
              aria-label={t('mobile.payroll.searchPayslips')}
              data-testid="search-input"
            />
          </div>
          {allYears.length > 1 && (
            <select
              value={selectedYear ?? ''}
              onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-3 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-sm"
              aria-label={t('mobile.payroll.filterByYear')}
              data-testid="year-filter"
            >
              <option value="">{t('mobile.payroll.allYears')}</option>
              {allYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        {/* Grouped list */}
        {yearsToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8" data-testid="history-empty">
            <span className="material-symbols-outlined text-5xl text-outline mb-4" aria-hidden="true">
              receipt_long
            </span>
            <p className="text-on-surface-variant font-body text-sm">
              {t('mobile.payroll.noResults')}
            </p>
          </div>
        ) : (
          yearsToShow.map(year => (
            <div key={year} className="px-6 mt-6" data-testid={`history-year-${year}`}>
              <h2 className="font-headline text-base font-bold text-on-surface mb-3">{year}</h2>
              <div className="space-y-2">
                {grouped[year].map(payslip => {
                  const period = payslip.period ?? payslip.periodLabel ?? '—';
                  const pdfUrl = `${API_BASE_URL}/ess/payslips/${encodeURIComponent(payslip.id)}/pdf`;
                  return (
                    <div
                      key={payslip.id}
                      className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl border-l-4 border-primary/30 hover:border-primary transition-all shadow-[0_2px_8px_rgba(25,28,30,0.04)] group"
                      data-testid="history-row"
                    >
                      <button
                        onClick={() => navigate(`/app/ess/payroll/${payslip.id}`)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-headline text-sm font-bold text-on-surface">{period}</p>
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/40 text-primary text-[10px] font-bold font-label">
                            {payslip.status ?? ''}
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm mt-0.5 font-body">
                          {formatCurrency(payslip.netPay ?? 0)}
                        </p>
                      </button>
                      <a
                        href={pdfUrl}
                        download={`payslip-${payslip.id}.pdf`}
                        onClick={e => e.stopPropagation()}
                        aria-label={t('mobile.payroll.downloadPdfLabel', { period })}
                        className="p-2.5 rounded-xl bg-surface-container hover:bg-primary-container/40 text-primary transition-all group-hover:scale-110 ml-2 flex-shrink-0"
                        data-testid="history-download-btn"
                      >
                        <span className="material-symbols-outlined text-xl" aria-hidden="true">download</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
