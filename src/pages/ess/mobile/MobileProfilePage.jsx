/**
 * MobileProfilePage — Task 89
 *
 * ESS profile screen matching the Executive Pulse editorial design:
 * - Hero section with tilted avatar (boring-avatars fallback), name, role, description
 * - Bento grid: Personal Info (left 8/12), Certification Status + Payslips (right 4/12)
 * - Work Location History within Personal Info card
 * - Responsive: stacks vertically on mobile, 12-col grid on ≥md
 *
 * Data sources:
 *   useEssProfile()   → GET /api/ess/profile (nested: personal, contract, completeness, …)
 *   useEssPayslips()  → GET /api/ess/payslips (recent payslip list)
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Avatar from 'boring-avatars';
import { useEssProfile } from '../../../hooks/useEssProfile';
import { useEssPayslips } from '../../../hooks/useEssPayslips';

// ── Helpers ───────────────────────────────────────────────────────

/** Normalise the nested profile from useEssProfile into flat fields */
function normalise(raw) {
  const personal = raw?.personal || {};
  const contract = raw?.contract || {};
  return {
    firstName:     personal.firstName || '',
    lastName:      personal.lastName || '',
    name:          personal.name || `${personal.firstName || ''} ${personal.lastName || ''}`.trim(),
    email:         personal.email || '',
    phone:         personal.phone || '',
    avatar:        personal.avatar || null,
    employeeId:    personal.employeeId || raw?.employeeId || '',
    role:          contract.role || contract.jobTitle || '',
    jobTitle:      contract.jobTitle || contract.role || '',
    department:    contract.department || '',
    hireDate:      contract.hireDate || '',
    status:        contract.status || '',
    completeness:  raw?.completeness ?? 85,
    workPreferences: raw?.workPreferences ?? [],
    locations:     raw?.locations ?? [],
    qualifications: raw?.qualifications ?? [],
  };
}

/** SVG cert ring offset (R = 45, circumference ≈ 283) */
export function certRingOffset(score) {
  const circumference = 2 * Math.PI * 45;
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  return circumference * (1 - pct / 100);
}

/** Format a date as "October 2023" */
function formatPayslipDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(dateStr));
  } catch { return dateStr; }
}

// ── Colour palette for boring-avatars ────────────────────────────

const AVATAR_PALETTE = ['#da336b', '#fe8fa8', '#8b2044', '#ffd9df', '#ffb1c0'];

// ── Skeleton ─────────────────────────────────────────────────────

const MobileProfileSkeleton = () => (
  <div className="animate-pulse pt-8 px-6 max-w-7xl mx-auto" data-testid="profile-skeleton">
    <div className="flex flex-col md:flex-row gap-12 items-center">
      <div className="w-48 h-48 rounded-[2.5rem] bg-surface-container" />
      <div className="flex-1 space-y-4 w-full">
        <div className="h-3 w-32 bg-surface-variant rounded" />
        <div className="h-12 w-64 bg-surface-variant rounded" />
        <div className="h-4 w-80 bg-surface-variant rounded" />
        <div className="flex gap-3"><div className="h-12 w-36 bg-surface-variant rounded-xl" /><div className="h-12 w-28 bg-surface-variant rounded-xl" /></div>
      </div>
    </div>
    <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-8 h-80 bg-surface-variant rounded-[2rem]" />
      <div className="md:col-span-4 space-y-8"><div className="h-64 bg-surface-variant rounded-[2rem]" /><div className="h-64 bg-surface-variant rounded-[2rem]" /></div>
    </div>
  </div>
);

// ── ProfileAvatar ────────────────────────────────────────────────

const ProfileAvatar = ({ name, avatar, size = 'lg' }) => {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        loading="lazy"
        className="w-full h-full object-cover"
        data-testid="profile-avatar-img"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center" data-testid="profile-avatar-generated">
      <Avatar
        size={size === 'lg' ? 256 : 32}
        name={name || 'User'}
        variant="beam"
        colors={AVATAR_PALETTE}
      />
    </div>
  );
};

// ── Hero Section ─────────────────────────────────────────────────

const HeroSection = ({ profile, t, navigate }) => (
  <section className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-center" data-testid="profile-hero">
    {/* Tilted avatar */}
    <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
      <div
        className="absolute inset-0 rounded-[2.5rem] rotate-6"
        style={{ background: 'linear-gradient(135deg, #da336b 0%, #fe8fa8 100%)' }}
      />
      <div className="absolute inset-0 -rotate-2 border-4 border-white rounded-[2.5rem] shadow-xl overflow-hidden">
        <ProfileAvatar name={profile.name} avatar={profile.avatar} size="lg" />
      </div>
    </div>

    {/* Info */}
    <div className="flex-1 space-y-4 text-center md:text-left">
      <div className="space-y-1">
        <span className="font-label text-primary font-bold tracking-[0.05em] uppercase text-xs">
          {profile.jobTitle || profile.role}
        </span>
        <h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary font-headline"
          data-testid="profile-name"
        >
          {profile.name}
        </h1>
      </div>
      <p className="text-on-surface-variant font-body max-w-lg leading-relaxed">
        {profile.department && <>{profile.department} · </>}
        ID: {profile.employeeId || '—'}
      </p>
      <div className="flex gap-3 justify-center md:justify-start flex-wrap">
        <button
          onClick={() => navigate('/app/ess/profile/edit')}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 active:scale-[0.97]"
          data-testid="edit-profile-btn"
        >
          {t('mobile.profile.editProfile')} <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
        </button>
        <button
          onClick={() => navigate('/app/ess/attendance')}
          className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all active:scale-[0.97]"
        >
          {t('mobile.profile.clockIn', { defaultValue: 'Clock In' })}
        </button>
      </div>
    </div>
  </section>
);

// ── Personal Info Card ───────────────────────────────────────────

const PersonalInfoCard = ({ profile, t }) => (
  <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_8px_24px_rgba(25,28,30,0.04)] space-y-8" data-testid="personal-info-card">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-primary font-headline">{t('mobile.profile.personalInfo')}</h2>
      <span className="material-symbols-outlined text-outline" aria-hidden="true">verified_user</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
      <InfoField label={t('mobile.profile.email')} value={profile.email} />
      <InfoField label={t('mobile.profile.phone')} value={profile.phone} />
      <InfoField label={t('mobile.profile.department')} value={profile.department} />
      <InfoField label={t('mobile.profile.employeeId', { defaultValue: 'Employee ID' })} value={profile.employeeId} />
    </div>

    {/* Work Location History */}
    {profile.locations.length > 0 && (
      <div className="pt-8 border-t border-surface-container-high">
        <h3 className="text-lg font-bold text-primary mb-6 font-headline">{t('mobile.profile.workLocations')}</h3>
        <div className="space-y-4">
          {profile.locations.map((loc, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl ${i === 0 ? 'bg-surface-container-low' : 'bg-surface-container-low/50'}`} data-testid="location-row">
              <span className={`material-symbols-outlined mt-1 ${i === 0 ? 'text-primary' : 'text-outline'}`} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">location_on</span>
              <div>
                <p className="font-bold text-on-surface">{loc.name}</p>
                <p className="text-sm text-on-surface-variant">{loc.startDate} – {loc.endDate || t('mobile.profile.present')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <span className="text-xs font-label uppercase tracking-widest text-outline">{label}</span>
    <p className="font-semibold text-on-surface">{value || '—'}</p>
  </div>
);

// ── Certification Status Card ────────────────────────────────────

const CertificationCard = ({ profile, t }) => {
  const score = profile.completeness;

  const levelLabel = score >= 90
    ? t('mobile.profile.expertLevel', { defaultValue: 'Expert Level' })
    : score >= 70
      ? t('mobile.profile.advancedLevel', { defaultValue: 'Advanced Level' })
      : t('mobile.profile.beginnerLevel', { defaultValue: 'Beginner Level' });

  return (
    <div className="bg-primary text-on-primary p-8 rounded-[2rem] space-y-6 relative overflow-hidden" data-testid="cert-card">
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#ffb1c0] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="flex justify-between items-start relative z-10">
        <h2 className="text-xl font-bold leading-tight font-headline">{t('mobile.profile.certStatus', { defaultValue: 'Certification Status' })}</h2>
        <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">stars</span>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70 font-label">{t('mobile.profile.activeScore')}</p>
            <p className="text-3xl font-extrabold tracking-tight font-headline" data-testid="cert-score">{score}%</p>
          </div>
          <span className="text-secondary-container font-bold text-sm font-label">{levelLabel}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden" data-testid="cert-progress-bar">
          <div className="h-full bg-secondary-container transition-[width] duration-700" style={{ width: `${Math.min(score, 100)}%` }} />
        </div>
      </div>
      {profile.qualifications.length > 0 && (
        <ul className="space-y-3 pt-4 text-sm relative z-10" data-testid="cert-list">
          {profile.qualifications.slice(0, 3).map((q, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs" aria-hidden="true">check_circle</span>
              {q.name || q.title || q}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── Payslips Quick Access Card ───────────────────────────────────

const PayslipsCard = ({ payslips, t, navigate }) => (
  <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_8px_24px_rgba(25,28,30,0.04)] space-y-6" data-testid="payslips-card">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-primary font-headline">{t('nav.payslips')}</h2>
      <button onClick={() => navigate('/app/ess/payslips')} className="text-primary text-sm font-bold font-label">
        {t('mobile.profile.viewAll', { defaultValue: 'View All' })}
      </button>
    </div>
    <div className="space-y-2">
      {(!payslips || payslips.length === 0) ? (
        <p className="text-on-surface-variant text-sm py-4 text-center font-body">
          {t('mobile.profile.noPayslips', { defaultValue: 'No payslips available.' })}
        </p>
      ) : (
        payslips.slice(0, 3).map((slip, i) => (
          <button
            key={slip.id || i}
            onClick={() => navigate(`/app/ess/payslips/${slip.id}`)}
            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-low transition-all cursor-pointer w-full text-left"
            data-testid="payslip-row"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-secondary-container/20' : 'bg-surface-container'}`}>
                <span className={`material-symbols-outlined ${i === 0 ? 'text-primary' : 'text-outline'}`}>payments</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">{formatPayslipDate(slip.periodStart || slip.date)}</p>
                <p className="text-xs text-on-surface-variant">
                  {slip.processedDate
                    ? `${t('mobile.profile.processed', { defaultValue: 'Processed' })} ${new Intl.DateTimeFormat(undefined, { month: '2-digit', day: '2-digit' }).format(new Date(slip.processedDate))}`
                    : slip.status || ''}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">download</span>
          </button>
        ))
      )}
    </div>
  </div>
);

// ── Main export ───────────────────────────────────────────────────

export const MobileProfilePage = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { profile: rawProfile, isLoading } = useEssProfile();
  const { payslips } = useEssPayslips();

  if (isLoading || !rawProfile) return <MobileProfileSkeleton />;

  const profile = normalise(rawProfile);

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#fff8f7" />
        <title>{t('mobile.profile.title')}</title>
      </Helmet>

      <div className="pt-8 px-6 md:px-12 max-w-7xl mx-auto space-y-12 pb-32" data-testid="profile-page">
        {/* Hero */}
        <HeroSection profile={profile} t={t} navigate={navigate} />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left — Personal Info */}
          <div className="md:col-span-8">
            <PersonalInfoCard profile={profile} t={t} />
          </div>
          {/* Right — Certification + Payslips */}
          <div className="md:col-span-4 space-y-8">
            <CertificationCard profile={profile} t={t} />
            <PayslipsCard payslips={payslips || []} t={t} navigate={navigate} />
          </div>
        </div>
      </div>
    </>
  );
};
