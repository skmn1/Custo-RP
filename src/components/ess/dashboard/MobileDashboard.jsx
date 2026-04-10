/**
 * MobileDashboard — Task 65
 *
 * Mobile-native ESS dashboard with at-a-glance cards and scrollable feed.
 * Reuses the useEssDashboard hook (task 54) — no new API endpoint.
 *
 * Sections:
 *  1. Time-based greeting with employee first name
 *  2. Next-shift hero card
 *  3. Quick stats row (horizontally scrollable)
 *  4. Summary cards: payslip, profile, attendance
 */
import { useTranslation } from 'react-i18next';
import { useNavigate, NavLink } from 'react-router-dom';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { useEssDashboard } from '../../../hooks/useEssDashboard';
import { useEssConnectivity } from '../../../contexts/EssConnectivityContext';
import { useLocaleFormat, useLocaleDateFns } from '../../../utils/formatLocale';
import MobileCard from '../../mobile/MobileCard';
import StatusChip from '../../mobile/StatusChip';
import EssOfflineFallback from '../EssOfflineFallback';
import { isToday, isTomorrow } from 'date-fns';

// ── Helpers ───────────────────────────────────────────────────────

function getTimeBasedGreeting(t) {
  const hour = new Date().getHours();
  if (hour < 12) return t('mobile.dashboard.goodMorning');
  if (hour < 18) return t('mobile.dashboard.goodAfternoon');
  return t('mobile.dashboard.goodEvening');
}

function formatRelativeDay(dateStr, t, formatDate) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return t('schedule.today');
  if (isTomorrow(d)) return t('mobile.dashboard.tomorrow');
  return formatDate(d, 'EEE d MMM');
}

// ── Greeting Header ──────────────────────────────────────────────

const MobileDashboardGreeting = ({ firstName, currentDate, t, formatDate, nextShift }) => {
  const greeting = getTimeBasedGreeting(t);

  return (
    <div
      className="mx-4 mt-4 rounded-2xl px-4 py-5"
      style={{
        background: 'linear-gradient(160deg, #EDE8DF 0%, #E5DDD0 100%)',
        boxShadow: 'var(--mobile-shadow-inner), var(--mobile-shadow-card)',
      }}
      data-testid="mobile-dashboard-greeting"
    >
      <h1 className="text-mobile-largeTitle font-bold text-[var(--mobile-label-primary)]">
        {greeting}, {firstName} 👋
      </h1>
      <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-1">
        {formatDate(currentDate || new Date(), 'EEEE, d MMMM yyyy')}
      </p>
      {nextShift && (
        <p className="text-mobile-title3 font-bold mt-3" style={{ color: 'var(--mobile-tint)' }}>
          {nextShift.startTime} – {nextShift.endTime}
        </p>
      )}
    </div>
  );
};

// ── Next Shift Hero Card ─────────────────────────────────────────

const NextShiftCard = ({ shift, t, formatDate }) => {
  const navigate = useNavigate();

  if (!shift) {
    return (
      <MobileCard className="mx-4" testId="mobile-next-shift-card">
        <p className="text-mobile-body text-[var(--mobile-label-secondary)]">
          {t('mobile.dashboard.noUpcomingShifts')}
        </p>
      </MobileCard>
    );
  }

  return (
    <MobileCard
      onPress={() => navigate('/app/ess/schedule')}
      className="mx-4"
      testId="mobile-next-shift-card"
    >
      <span className="text-mobile-caption text-[var(--mobile-tint)] font-semibold uppercase tracking-wide">
        {t('mobile.dashboard.nextShift')}
      </span>
      <p className="text-mobile-title2 text-[var(--mobile-label-primary)] mt-1">
        {formatRelativeDay(shift.date, t, formatDate)}
      </p>
      <p className="text-mobile-body text-[var(--mobile-label-primary)] mt-0.5">
        {shift.startTime} – {shift.endTime}  •  {shift.duration ?? ''}h
      </p>
      {shift.department && (
        <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-0.5">
          {shift.department}
        </p>
      )}
      <div className="flex items-center gap-1 mt-3 text-[var(--mobile-tint)]">
        <span className="text-mobile-subheadline">{t('mobile.dashboard.viewSchedule')}</span>
        <ChevronRightIcon className="h-4 w-4" />
      </div>
    </MobileCard>
  );
};

// ── Quick Stats Row ──────────────────────────────────────────────

const QuickStatsRow = ({ dashboard, t, formatCurrency }) => {
  const d = dashboard || {};
  const attendance = d.attendance || {};

  const items = [
    {
      value: d.upcomingShifts?.length ?? 0,
      label: t('mobile.dashboard.shifts'),
      link: '/app/ess/schedule',
    },
    {
      value: d.latestPayslip ? formatCurrency(d.latestPayslip.netPay) : '—',
      label: t('mobile.dashboard.lastPay'),
      link: '/app/ess/payslips',
      hidden: d.payslipRestricted,
    },
    {
      value: `${attendance.totalHours ?? 0}h`,
      label: t('mobile.dashboard.hours'),
      link: '/app/ess/attendance',
    },
    {
      value: `${attendance.attendanceRate ?? 0}%`,
      label: t('mobile.dashboard.attendance'),
      link: '/app/ess/attendance',
    },
  ];

  return (
    <div
      className="flex gap-3 px-4 overflow-x-auto scrollbar-hide py-2"
      data-testid="mobile-quick-stats"
    >
      {items
        .filter((i) => !i.hidden)
        .map(({ value, label, link }) => (
          <NavLink key={label} to={link} className="flex-shrink-0">
            <div className="bg-[var(--mobile-bg-grouped)] rounded-2xl px-4 py-3 min-w-[80px] text-center">
              <span className="text-mobile-title3 font-bold block" style={{ color: 'var(--mobile-tint)' }}>
                {value}
              </span>
              <span className="text-mobile-caption text-[var(--mobile-label-secondary)]">
                {label}
              </span>
            </div>
          </NavLink>
        ))}
    </div>
  );
};

// ── Payslip Summary Card ─────────────────────────────────────────

const PayslipCard = ({ payslip, restricted, t, formatCurrency, formatDate }) => {
  if (restricted || !payslip) return null;
  const navigate = useNavigate();

  return (
    <MobileCard
      onPress={() => navigate(`/app/ess/payslips/${payslip.id}`)}
      className="mx-4"
      testId="mobile-payslip-card"
    >
      <div className="flex items-center gap-2 mb-1">
        <span>💰</span>
        <span className="text-mobile-subheadline text-[var(--mobile-label-secondary)] font-medium">
          {t('mobile.dashboard.latestPayslip')}
        </span>
      </div>
      <p className="text-mobile-body text-[var(--mobile-label-primary)]">
        {payslip.periodLabel ?? ''} — {formatCurrency(payslip.netPay)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-mobile-caption text-[var(--mobile-label-tertiary)]">
          {t('mobile.dashboard.paidOn', { date: formatDate(payslip.paidDate, 'dd MMM') })}
        </span>
        <ChevronRightIcon className="h-4 w-4 text-[var(--mobile-tint)]" />
      </div>
    </MobileCard>
  );
};

// ── Profile Status Card ──────────────────────────────────────────

const ProfileCard = ({ completeness, pendingRequests, t }) => {
  const pct = completeness ?? 0;

  return (
    <MobileCard
      onPress={() => {}} // handled via NavLink wrapper
      className="mx-4"
      testId="mobile-profile-card"
    >
      <NavLink to="/app/ess/profile" className="block">
        <div className="flex items-center gap-2 mb-1">
          <span>👤</span>
          <span className="text-mobile-subheadline text-[var(--mobile-label-secondary)] font-medium">
            {t('mobile.dashboard.profile')}
          </span>
        </div>
        <p className="text-mobile-body text-[var(--mobile-label-primary)]">
          {t('mobile.dashboard.complete', { percent: pct })}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--mobile-tint)] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          {pendingRequests > 0 && (
            <StatusChip
              variant="warning"
              label={t('mobile.dashboard.pendingRequests', { count: pendingRequests })}
            />
          )}
        </div>
      </NavLink>
    </MobileCard>
  );
};

// ── Attendance Summary Card ──────────────────────────────────────

const AttendanceCard = ({ attendance, t }) => {
  const a = attendance || {};

  return (
    <MobileCard
      onPress={() => {}} // handled via NavLink wrapper
      className="mx-4"
      testId="mobile-attendance-card"
    >
      <NavLink to="/app/ess/attendance" className="block">
        <div className="flex items-center gap-2 mb-1">
          <span>⏱</span>
          <span className="text-mobile-subheadline text-[var(--mobile-label-secondary)] font-medium">
            {t('mobile.dashboard.attendanceThisMonth')}
          </span>
        </div>
        <p className="text-mobile-body text-[var(--mobile-label-primary)]">
          {t('mobile.dashboard.hoursWorked', { hours: a.totalHours ?? 0 })}
          {'  •  '}
          {t('mobile.dashboard.attendanceRate', { rate: a.attendanceRate ?? 0 })}
        </p>
      </NavLink>
    </MobileCard>
  );
};

// ── Loading Skeleton ─────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="space-y-4 px-4 pt-4 animate-pulse" data-testid="mobile-dashboard-skeleton">
    <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mt-4" />
    <div className="flex gap-3 mt-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 w-20 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0" />
      ))}
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────

const MobileDashboard = () => {
  const { t } = useTranslation('ess');
  const { user } = useAuth();
  const { dashboard, isLoading, error, refetch } = useEssDashboard();
  const { isOnline } = useEssConnectivity();
  const { formatCurrency } = useLocaleFormat();
  const { formatDate } = useLocaleDateFns();

  const firstName = dashboard?.greeting?.firstName || user?.firstName || '';

  // Offline with no cached data
  if (!isOnline && !dashboard && !isLoading) {
    return <EssOfflineFallback />;
  }

  // Loading
  if (isLoading && !dashboard) {
    return <DashboardSkeleton />;
  }

  // Error with no data
  if (error && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="mobile-dashboard-error">
        <p className="text-mobile-body text-[var(--mobile-label-secondary)] mb-4">
          {t('dashboard.unableToLoad')}
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mobile-tint)] text-white rounded-lg text-mobile-body font-medium"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {t('dashboard.retry')}
        </button>
      </div>
    );
  }

  const d = dashboard || {};
  const nextShift = d.upcomingShifts?.[0] ?? null;

  return (
    <div className="space-y-4 pb-4" data-testid="mobile-dashboard">
      <MobileDashboardGreeting
        firstName={firstName}
        currentDate={d.greeting?.currentDate}
        nextShift={nextShift}
        t={t}
        formatDate={formatDate}
      />
      <NextShiftCard shift={nextShift} t={t} formatDate={formatDate} />
      <QuickStatsRow dashboard={d} t={t} formatCurrency={formatCurrency} />
      <PayslipCard
        payslip={d.latestPayslip}
        restricted={d.payslipRestricted}
        t={t}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <ProfileCard
        completeness={d.profileCompletenessPct}
        pendingRequests={d.pendingProfileRequests}
        t={t}
      />
      <AttendanceCard attendance={d.attendance} t={t} />
    </div>
  );
};

export default MobileDashboard;
