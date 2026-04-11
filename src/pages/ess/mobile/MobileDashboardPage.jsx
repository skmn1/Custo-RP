/**
 * MobileDashboardPage — Task 80 (SCREEN_39)
 *
 * ESS home dashboard redesigned with Nexus Kinetic visual language:
 * - Personalised time-based greeting header
 * - Next Shift hero card with Magenta accent bar and "Clock In" CTA
 * - Annual Leave balance card (gradient surface, progress bar)
 * - Company Pulse horizontal-scroll carousel
 * - Quick Links 2-column grid
 *
 * Data: useEssDashboard() → GET /api/ess/* (parallel sub-requests)
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssDashboard } from '../../../hooks/useEssDashboard';

// ── Helpers ─────────────────────────────────────────────────────

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'mobile.dashboard.goodMorning';
  if (hour < 18) return 'mobile.dashboard.goodAfternoon';
  return 'mobile.dashboard.goodEvening';
}

// ── Greeting Header (B.1) ────────────────────────────────────────

const EssDashboardGreeting = ({ firstName, currentDate }) => {
  const { t } = useTranslation('ess');
  const greeting = t(getGreetingKey());

  return (
    <div className="px-6 pt-6 pb-2" data-testid="mobile-dashboard-greeting">
      <span className="text-primary font-semibold text-[10px] tracking-[0.15em] uppercase mb-1 block font-label">
        {t('mobile.dashboard.essPortal')}
      </span>
      <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
        {greeting}, {firstName} 👋
      </h1>
      <p className="text-on-surface-variant mt-1 font-medium font-body text-sm">
        {new Intl.DateTimeFormat(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(currentDate instanceof Date ? currentDate : new Date(currentDate))}
      </p>
    </div>
  );
};

// ── Next Shift Hero Card (B.2) ───────────────────────────────────

const NextShiftHero = ({ shift }) => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();

  if (!shift) {
    return (
      <div
        className="mx-6 mt-4 bg-surface-container-lowest rounded-2xl p-8 text-center shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
        data-testid="mobile-next-shift-card"
      >
        <span
          className="material-symbols-outlined text-3xl text-outline mb-2 block"
          aria-hidden="true"
        >
          event_busy
        </span>
        <p className="text-on-surface-variant font-medium font-body">
          {t('mobile.dashboard.noUpcomingShift')}
        </p>
      </div>
    );
  }

  const shiftDate = shift.date ? new Date(shift.date) : null;

  return (
    <div
      className="mx-6 mt-4 relative overflow-hidden bg-surface-container-lowest rounded-2xl shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
      data-testid="mobile-next-shift-card"
    >
      {/* Magenta left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
        style={{ background: 'linear-gradient(to bottom, #da336b, #8b2044)' }}
        aria-hidden="true"
      />

      <div className="pl-7 pr-6 pt-6 pb-0">
        <span className="text-primary font-bold text-[10px] tracking-[0.15em] uppercase font-label">
          {t('mobile.dashboard.nextShift')}
        </span>
        {shiftDate && (
          <h2 className="font-headline text-xl font-bold text-on-surface mt-1">
            {new Intl.DateTimeFormat(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            }).format(shiftDate)}
          </h2>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">
            schedule
          </span>
          <p className="text-on-surface-variant font-medium font-body text-sm">
            {shift.startTime} – {shift.endTime}
            {shift.duration ? ` · ${shift.duration}` : ''}
          </p>
        </div>
        {shift.locationName && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="material-symbols-outlined text-lg text-outline" aria-hidden="true">
              location_on
            </span>
            <p className="text-on-surface-variant font-medium font-body text-sm">
              {shift.locationName}
            </p>
          </div>
        )}
      </div>

      {/* Footer with team avatars + Clock In */}
      <div className="mt-5 bg-surface-container-low px-7 py-4 flex items-center justify-between border-t border-outline-variant/20">
        <div className="flex -space-x-2" aria-hidden="true">
          {(shift.teammates ?? []).slice(0, 4).map((tm) => (
            <img
              key={tm.id}
              src={tm.avatar}
              alt={tm.name}
              loading="lazy"
              className="w-7 h-7 rounded-full border-2 border-surface-container-lowest object-cover"
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/app/ess/schedule')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm font-headline text-on-primary shadow-lg active:scale-[0.97] transition-all"
          style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
          aria-label={t('mobile.dashboard.clockIn')}
        >
          {t('mobile.dashboard.clockIn')}
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

// ── Leave Balance Card (B.3) ─────────────────────────────────────

const LeaveBalanceCard = ({ used, total }) => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const safeUsed = Number(used) || 0;
  const safeTotal = Number(total) || 21;
  const percentage = safeTotal > 0 ? Math.min(Math.round((safeUsed / safeTotal) * 100), 100) : 0;
  const remaining = safeTotal - safeUsed;

  return (
    <div
      className="mx-6 mt-4 relative overflow-hidden rounded-2xl p-6 text-on-primary"
      style={{ background: 'linear-gradient(135deg, #8b003b 0%, #da336b 100%)' }}
      data-testid="mobile-leave-balance-card"
    >
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" aria-hidden="true" />
      <div className="absolute -right-2 bottom-4 w-16 h-16 bg-white/5 rounded-full" aria-hidden="true" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className="text-primary-fixed-dim text-[10px] font-bold uppercase tracking-[0.15em] font-label">
            {t('mobile.dashboard.annualLeave')}
          </span>
          <p className="font-headline text-4xl font-extrabold mt-1">
            {remaining}{' '}
            <span className="text-lg font-medium opacity-80">
              {t('mobile.dashboard.daysLeft')}
            </span>
          </p>
          <p className="text-primary-fixed text-xs mt-0.5 font-body opacity-80">
            {t('mobile.dashboard.leaveProgress', { used: safeUsed, total: safeTotal })}
          </p>
        </div>
        <span
          className="material-symbols-outlined text-4xl opacity-40"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          beach_access
        </span>
      </div>

      <div
        className="h-2 rounded-full bg-white/20 overflow-hidden relative z-10"
        role="progressbar"
        aria-valuenow={safeUsed}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-label={t('mobile.dashboard.leaveProgress', { used: safeUsed, total: safeTotal })}
      >
        <div
          className="h-full rounded-full bg-white transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <button
        onClick={() => navigate('/app/ess/schedule')}
        className="mt-4 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-on-primary font-bold text-sm font-label tracking-wide relative z-10"
      >
        {t('mobile.dashboard.requestTimeOff')}
      </button>
    </div>
  );
};

// ── Company Pulse Carousel (B.4) ─────────────────────────────────

const CompanyPulseCarousel = ({ news }) => {
  const { t } = useTranslation('ess');

  if (!news || news.length === 0) return null;

  return (
    <div className="mt-6" data-testid="mobile-company-pulse">
      <div className="px-6 mb-3 flex items-baseline justify-between">
        <h2 className="font-headline text-lg font-bold text-on-surface">
          {t('mobile.dashboard.companyPulse')}
        </h2>
        <button className="text-primary font-semibold text-xs uppercase tracking-widest font-label">
          {t('mobile.dashboard.seeAll')}
        </button>
      </div>
      <div
        className="flex gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        role="list"
        aria-label={t('mobile.dashboard.companyPulse')}
      >
        {news.map((item) => (
          <div
            key={item.id}
            role="listitem"
            className="flex-shrink-0 w-[220px] snap-center bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
          >
            {item.imageUrl && (
              <div className="h-28 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4">
              {item.category && (
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.12em] font-label">
                  {item.category}
                </span>
              )}
              <h3 className="font-headline text-sm font-bold text-on-surface mt-1 line-clamp-2 leading-snug">
                {item.title}
              </h3>
              {item.date && (
                <p className="text-outline text-[11px] mt-1 font-body">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Quick Links (B.5) ────────────────────────────────────────────

const QUICK_LINKS = [
  { icon: 'payments',      labelKey: 'mobile.dashboard.payrollHub',  path: '/app/ess/payslips',  iconFill: true  },
  { icon: 'badge',         labelKey: 'mobile.dashboard.myProfile',   path: '/app/ess/profile',   iconFill: true  },
  { icon: 'beach_access',  labelKey: 'mobile.dashboard.leaveTime',   path: '/app/ess/schedule',  iconFill: false },
  { icon: 'calendar_today',labelKey: 'mobile.nav.schedule',          path: '/app/ess/schedule',  iconFill: false },
];

const QuickLinks = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();

  return (
    <div className="mt-6 px-6 pb-6" data-testid="mobile-quick-links">
      <h2 className="font-headline text-lg font-bold text-on-surface mb-3">
        {t('mobile.dashboard.quickLinks')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.path + link.labelKey}
            onClick={() => navigate(link.path)}
            className="bg-surface-container-lowest rounded-2xl p-5 text-left hover:shadow-md active:scale-[0.97] transition-all shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
            aria-label={t(link.labelKey)}
          >
            <span
              className="material-symbols-outlined text-2xl text-primary mb-3 block"
              style={link.iconFill ? { fontVariationSettings: "'FILL' 1" } : {}}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            <p className="font-headline text-sm font-bold text-on-surface">{t(link.labelKey)}</p>
            <p className="text-primary text-[11px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1 font-label">
              {t('mobile.dashboard.view')}
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                arrow_forward
              </span>
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Skeleton (loading state) ─────────────────────────────────────

const MobileDashboardSkeleton = () => (
  <div className="animate-pulse px-6 pt-6 space-y-4" data-testid="mobile-dashboard-skeleton">
    {/* Greeting skeleton */}
    <div>
      <div className="h-2.5 w-24 bg-zinc-200 rounded mb-2" />
      <div className="h-8 w-56 bg-zinc-200 rounded mb-1.5" />
      <div className="h-3.5 w-44 bg-zinc-200 rounded" />
    </div>
    {/* Shift hero skeleton */}
    <div className="h-44 rounded-2xl bg-zinc-200" />
    {/* Leave card skeleton */}
    <div className="h-36 rounded-2xl bg-zinc-200" />
    {/* Pulse skeleton */}
    <div>
      <div className="h-5 w-32 bg-zinc-200 rounded mb-3" />
      <div className="flex gap-4 overflow-hidden">
        <div className="flex-shrink-0 w-[220px] h-44 rounded-2xl bg-zinc-200" />
        <div className="flex-shrink-0 w-[220px] h-44 rounded-2xl bg-zinc-200" />
      </div>
    </div>
    {/* Quick links skeleton */}
    <div className="grid grid-cols-2 gap-3">
      <div className="h-28 rounded-2xl bg-zinc-200" />
      <div className="h-28 rounded-2xl bg-zinc-200" />
      <div className="h-28 rounded-2xl bg-zinc-200" />
      <div className="h-28 rounded-2xl bg-zinc-200" />
    </div>
  </div>
);

// ── Error state ──────────────────────────────────────────────────

const MobileDashboardError = ({ onRetry }) => {
  const { t } = useTranslation('ess');

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <span
        className="material-symbols-outlined text-4xl text-outline mb-4"
        aria-hidden="true"
      >
        error_outline
      </span>
      <p className="text-on-surface-variant font-body mb-6">{t('dashboard.unableToLoad')}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm font-label text-on-primary"
        style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          refresh
        </span>
        {t('dashboard.retry')}
      </button>
    </div>
  );
};

// ── Page Assembly (C.1) ──────────────────────────────────────────

export const MobileDashboardPage = () => {
  const { dashboard, isLoading, error, refetch } = useEssDashboard();

  if (isLoading && !dashboard) return <MobileDashboardSkeleton />;
  if (error && !dashboard) return <MobileDashboardError onRetry={refetch} />;

  const firstName = dashboard?.greeting?.firstName ?? '';
  const upcomingShifts = dashboard?.upcomingShifts ?? [];
  const nextShift = upcomingShifts[0] ?? null;
  const leaveBalance = dashboard?.leaveBalance ?? { used: 0, total: 21 };
  const companyNews = dashboard?.companyNews ?? [];

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#fff8f7" />
      </Helmet>

      {/* Mobile stacked layout (single-column, full-width scroll) */}
      <div className="pb-6 max-w-2xl mx-auto" data-testid="mobile-dashboard-page">
        <EssDashboardGreeting
          firstName={firstName}
          currentDate={new Date()}
        />

        {/* Bento grid — single col on mobile, 12-col on md+ */}
        <div className="md:grid md:grid-cols-12 md:gap-6 md:px-6 md:mt-4">
          <div className="md:col-span-8">
            <NextShiftHero shift={nextShift} />
          </div>
          {/* Leave card: hidden on mobile here — rendered below in stacked order */}
          <div className="hidden md:block md:col-span-4">
            <LeaveBalanceCard used={leaveBalance.used} total={leaveBalance.total} />
          </div>
          <div className="md:col-span-12">
            <CompanyPulseCarousel news={companyNews} />
          </div>
        </div>

        {/* Leave card — mobile stacking order (below shift hero) */}
        <div className="md:hidden">
          <LeaveBalanceCard used={leaveBalance.used} total={leaveBalance.total} />
        </div>

        <QuickLinks />
      </div>

      {/* Desktop support FAB */}
      <button
        className="hidden md:flex fixed bottom-8 right-8 bg-primary text-on-primary rounded-full shadow-2xl p-4 items-center gap-2 font-bold font-label text-sm hover:opacity-90 active:scale-[0.97] transition-all"
        aria-label="Support"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          help
        </span>
        Support
      </button>
    </>
  );
};

export default MobileDashboardPage;
