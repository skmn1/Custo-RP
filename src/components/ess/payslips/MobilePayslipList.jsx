/**
 * MobilePayslipList — Task 67 (Part A)
 *
 * Mobile-native payslip list with year-grouped rows, tappable navigation
 * to detail view, and empty/loading/error states.
 * Reuses useEssPayslips hook from task 50.
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEssPayslips } from '../../../hooks/useEssPayslips';
import { useEssConnectivity } from '../../../contexts/EssConnectivityContext';
import { useLocaleFormat, useLocaleDateFns } from '../../../utils/formatLocale';
import MobileHeader from '../../mobile/MobileHeader';
import EssOfflineFallback from '../EssOfflineFallback';

// ── Helpers ───────────────────────────────────────────────────────

function groupByYear(payslips) {
  const groups = {};
  for (const slip of payslips) {
    const year = slip.periodYear ?? new Date(slip.paidAt || slip.periodStart || '').getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(slip);
  }
  // Sort years descending
  return Object.keys(groups)
    .sort((a, b) => Number(b) - Number(a))
    .map((y) => ({ year: Number(y), items: groups[y] }));
}

// ── PayslipRow ───────────────────────────────────────────────────

const PayslipRow = ({ payslip, onTap, formatCurrency, formatDate, t }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 min-h-[44px] active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
    onClick={() => onTap(payslip.id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onTap(payslip.id);
      }
    }}
    role="button"
    tabIndex={0}
    data-testid="payslip-row"
  >
    <div className="flex-1 min-w-0">
      <span className="text-mobile-body font-medium text-[var(--mobile-label-primary)]">
        {payslip.periodLabel}
      </span>
      <p className="text-mobile-subheadline text-[var(--mobile-label-primary)] mt-0.5">
        {formatCurrency(payslip.netPay)} {t('mobile.payslips.net')}
      </p>
      <p className="text-mobile-footnote text-[var(--mobile-label-secondary)] mt-0.5">
        {t('mobile.payslips.paidOn', { date: formatDate(payslip.paidAt, 'dd MMM') })}
      </p>
    </div>
    <ChevronRightIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
  </div>
);

// ── Year Section Header ──────────────────────────────────────────

const YearHeader = ({ year }) => (
  <div
    className="sticky top-0 z-10 bg-[var(--mobile-bg)] px-4 py-2 border-b border-[var(--mobile-separator)]"
    data-testid="payslip-year-header"
  >
    <span className="text-mobile-footnote font-semibold text-[var(--mobile-label-secondary)] uppercase tracking-wide">
      {year}
    </span>
  </div>
);

// ── Loading Skeleton ─────────────────────────────────────────────

const PayslipListSkeleton = () => (
  <div className="space-y-1 animate-pulse" data-testid="payslip-list-skeleton">
    {[1, 2, 3].map((i) => (
      <div key={i} className="px-4 py-3">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
      </div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────

const MobilePayslipList = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { isOnline } = useEssConnectivity();
  const { payslips, isLoading, error, restricted, fetchPayslips } = useEssPayslips();
  const { formatCurrency } = useLocaleFormat();
  const { formatDate } = useLocaleDateFns();

  const handleTap = (id) => navigate(`/app/ess/payslips/${id}`);

  // Offline with no data
  if (!isOnline && payslips.length === 0 && !isLoading && !restricted) {
    return <EssOfflineFallback />;
  }

  // Restricted
  if (restricted) {
    return (
      <div data-testid="mobile-payslip-restricted">
        <MobileHeader title={t('mobile.payslips.title')} />
        <div className="px-4 py-12 text-center">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)]">
            {t('payslips.restricted')}
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading && payslips.length === 0) {
    return (
      <div data-testid="mobile-payslip-list">
        <MobileHeader title={t('mobile.payslips.title')} />
        <PayslipListSkeleton />
      </div>
    );
  }

  // Error
  if (error && payslips.length === 0) {
    return (
      <div data-testid="mobile-payslip-list">
        <MobileHeader title={t('mobile.payslips.title')} />
        <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="mobile-payslip-error">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)] mb-4">
            {t('dashboard.unableToLoad')}
          </p>
          <button
            onClick={() => fetchPayslips()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mobile-tint)] text-white rounded-lg text-mobile-body font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty
  if (payslips.length === 0) {
    return (
      <div data-testid="mobile-payslip-list">
        <MobileHeader title={t('mobile.payslips.title')} />
        <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="mobile-payslip-empty">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)]">
            {t('mobile.payslips.noPayslips')}
          </p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const groups = groupByYear(payslips);

  return (
    <div data-testid="mobile-payslip-list">
      <MobileHeader title={t('mobile.payslips.title')} />
      <div className="divide-y divide-[var(--mobile-separator)]">
        {groups.map(({ year, items }) => (
          <div key={year}>
            {/* Hide current year header to reduce noise */}
            {year !== currentYear && <YearHeader year={year} />}
            {items.map((slip) => (
              <PayslipRow
                key={slip.id}
                payslip={slip}
                onTap={handleTap}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobilePayslipList;
