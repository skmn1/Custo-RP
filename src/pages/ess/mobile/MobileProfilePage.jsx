import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssProfile } from '../../../hooks/useEssProfile';

// ── Constants ─────────────────────────────────────────────────────

const PREF_ICONS = {
  fastFood: 'lunch_dining',
  grocery: 'shopping_cart',
  butcher: 'kitchen',
  bakery: 'bakery_dining',
  cafe: 'coffee',
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Compute SVG strokeDashoffset for a radius-45 circle.
 * circumference = 2 * Math.PI * 45 ≈ 283
 */
export function certRingOffset(score) {
  const circumference = 2 * Math.PI * 45;
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  return circumference * (1 - pct / 100);
}

// ── Sub-components ────────────────────────────────────────────────

const MobileProfileSkeleton = () => (
  <div className="animate-pulse px-6 py-8" data-testid="profile-skeleton">
    <div className="flex justify-center mb-6">
      <div className="w-32 h-32 rounded-[2rem] bg-surface-container" />
    </div>
    <div className="h-7 bg-surface-container rounded-xl w-48 mx-auto mb-2" />
    <div className="h-4 bg-surface-container rounded-xl w-32 mx-auto mb-6" />
    <div className="h-24 bg-surface-container rounded-2xl mb-4" />
    <div className="h-36 bg-surface-container rounded-2xl mb-4" />
    <div className="h-20 bg-surface-container rounded-2xl" />
  </div>
);

const ProfileHeader = ({ profile, t }) => {
  const score = profile.certificationScore ?? 85;
  const circumference = 2 * Math.PI * 45;
  const offset = certRingOffset(score);

  return (
    <div className="px-6 pt-6" data-testid="profile-header">
      {/* Avatar + rotated tile */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <div
            className="absolute inset-0 rounded-[2.5rem] rotate-6 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
          />
          <img
            src={profile.avatar || '/default-avatar.png'}
            alt={`${profile.firstName} ${profile.lastName}`}
            loading="lazy"
            className="relative z-10 w-full h-full rounded-[2rem] object-cover -rotate-2 shadow-lg"
            data-testid="profile-avatar"
          />
        </div>
      </div>

      {/* Name / role / ID */}
      <div className="text-center mb-4">
        <span className="text-primary font-bold text-[10px] uppercase tracking-[0.15em] font-label block mb-1">
          {t('mobile.profile.employeeProfile')}
        </span>
        <h1
          className="font-headline text-3xl font-extrabold tracking-tight text-on-surface"
          data-testid="profile-name"
        >
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-on-surface-variant mt-1 font-medium font-body">{profile.role}</p>
        <p className="text-outline text-sm mt-0.5 font-body">ID: {profile.employeeId}</p>

        {/* Active score badge */}
        <div
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-primary-container/40 text-primary"
          data-testid="cert-badge"
        >
          <span className="font-headline text-lg font-extrabold">{score}%</span>
          <span className="text-xs font-bold uppercase tracking-wide font-label">
            {t('mobile.profile.activeScore')}
          </span>
        </div>
      </div>

      {/* SVG certification ring */}
      <div
        className="flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-5 shadow-[0_8px_24px_rgba(218,51,107,0.06)]"
        data-testid="cert-ring-card"
      >
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 96 96"
            aria-hidden="true"
            data-testid="cert-ring-svg"
          >
            <circle
              cx="48"
              cy="48"
              r="45"
              fill="none"
              strokeWidth="4"
              className="stroke-surface-container"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              fill="none"
              strokeWidth="4"
              stroke="#da336b"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${offset}`}
              strokeLinecap="round"
              className="transition-all duration-700"
              data-testid="cert-ring-progress"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center font-headline text-xs font-bold text-primary"
            aria-hidden="true"
          >
            {score}
          </span>
        </div>
        <div>
          <p className="font-headline text-sm font-bold text-on-surface">
            {t('mobile.profile.profileCompleteness')}
          </p>
          <p className="text-on-surface-variant text-xs font-body mt-0.5">
            {t('mobile.profile.completeHint')}
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ title, items }) => (
  <div className="px-6 mt-6" data-testid="info-section">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 bg-primary rounded-full" />
      <h2 className="font-headline text-base font-bold text-on-surface">{title}</h2>
    </div>
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(25,28,30,0.06)]">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex justify-between items-center px-5 py-4 ${i > 0 ? 'border-t border-outline-variant/30' : ''}`}
          data-testid="info-row"
        >
          <span className="text-on-surface-variant text-sm font-body">{item.label}</span>
          <span className="font-headline text-sm font-bold text-on-surface text-right max-w-[60%] truncate">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const WorkPreferenceTags = ({ preferences, t }) => (
  <div className="px-6 mt-6" data-testid="work-preferences">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 bg-primary rounded-full" />
      <h2 className="font-headline text-base font-bold text-on-surface">
        {t('mobile.profile.workPreferences')}
      </h2>
    </div>
    {preferences.length === 0 ? (
      <p className="text-on-surface-variant text-sm font-body" data-testid="preferences-empty">
        {t('mobile.profile.noPreferences')}
      </p>
    ) : (
      <div className="flex flex-wrap gap-2" data-testid="preferences-list">
        {preferences.map((pref) => (
          <span
            key={pref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold font-label"
            data-testid="preference-chip"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              {PREF_ICONS[pref] ?? 'label'}
            </span>
            {t(`mobile.profile.pref.${pref}`, { defaultValue: pref })}
          </span>
        ))}
      </div>
    )}
  </div>
);

const LocationHistory = ({ locations, t }) => (
  <div className="px-6 mt-6" data-testid="location-history">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 bg-primary rounded-full" />
      <h2 className="font-headline text-base font-bold text-on-surface">
        {t('mobile.profile.workLocations')}
      </h2>
    </div>
    {locations.length === 0 ? (
      <p className="text-on-surface-variant text-sm font-body" data-testid="locations-empty">
        {t('mobile.profile.noLocations')}
      </p>
    ) : (
      <div
        className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(25,28,30,0.06)]"
        data-testid="locations-list"
      >
        {locations.map((loc, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? 'border-t border-outline-variant/30' : ''}`}
            data-testid="location-row"
          >
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              location_on
            </span>
            <div>
              <p className="font-headline text-sm font-bold text-on-surface">{loc.name}</p>
              <p className="text-outline text-xs font-body">
                {loc.startDate} – {loc.endDate || t('mobile.profile.present')}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Main export ───────────────────────────────────────────────────

export const MobileProfilePage = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { profile, isLoading } = useEssProfile();

  if (isLoading || !profile) return <MobileProfileSkeleton />;

  const startDateFormatted = profile.startDate
    ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(profile.startDate)
      )
    : '–';

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#fff8f7" />
        <title>{t('mobile.profile.title')}</title>
      </Helmet>
      <div className="pb-28 max-w-2xl mx-auto" data-testid="profile-page">
        <ProfileHeader profile={profile} t={t} />

        <InfoSection
          title={t('mobile.profile.personalInfo')}
          items={[
            { label: t('mobile.profile.email'), value: profile.email },
            { label: t('mobile.profile.phone'), value: profile.phone },
            {
              label: t('mobile.profile.started'),
              value: startDateFormatted,
            },
            { label: t('mobile.profile.department'), value: profile.department },
          ]}
        />

        <WorkPreferenceTags preferences={profile.workPreferences ?? []} t={t} />
        <LocationHistory locations={profile.locations ?? []} t={t} />

        <div className="px-6 mt-6">
          <button
            onClick={() => navigate('/app/ess/profile/edit')}
            className="w-full py-4 rounded-xl text-on-primary font-bold text-base font-headline flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
            aria-label={t('mobile.profile.editProfile')}
            data-testid="edit-profile-btn"
          >
            <span
              className="material-symbols-outlined text-xl"
              aria-hidden="true"
            >
              edit
            </span>
            {t('mobile.profile.editProfile')}
          </button>
        </div>
      </div>
    </>
  );
};
