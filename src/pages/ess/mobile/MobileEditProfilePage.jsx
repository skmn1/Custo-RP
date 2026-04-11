import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssProfile } from '../../../hooks/useEssProfile';
import { useEssUpdateProfile } from '../../../hooks/useEssUpdateProfile';

// ── Constants ─────────────────────────────────────────────────────

const AVAILABLE_PREFERENCES = ['fastFood', 'grocery', 'butcher', 'bakery', 'cafe'];

const PREF_ICONS = {
  fastFood: 'lunch_dining',
  grocery: 'shopping_cart',
  butcher: 'kitchen',
  bakery: 'bakery_dining',
  cafe: 'coffee',
};

const LOCATION_OPTIONS = ['Downtown', 'Westside', 'Northgate'];

// ── Main component ────────────────────────────────────────────────

export const MobileEditProfilePage = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { profile } = useEssProfile();
  const { updateProfile, isLoading } = useEssUpdateProfile();

  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact ?? '');
  const [preferences, setPreferences] = useState(profile?.workPreferences ?? []);
  const [location, setLocation] = useState(profile?.preferredLocation ?? '');
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    setSaveError(null);
    try {
      await updateProfile({
        phone,
        email,
        emergencyContact,
        workPreferences: preferences,
        preferredLocation: location,
      });
      navigate(-1);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const removePreference = (pref) => {
    setPreferences((prev) => prev.filter((p) => p !== pref));
  };

  const addPreference = (pref) => {
    if (!preferences.includes(pref)) {
      setPreferences((prev) => [...prev, pref]);
    }
  };

  const availableToAdd = AVAILABLE_PREFERENCES.filter((p) => !preferences.includes(p));

  const contactFields = [
    {
      key: 'phone',
      label: t('mobile.profile.phone'),
      type: 'tel',
      value: phone,
      onChange: setPhone,
      icon: 'phone',
      testid: 'input-phone',
    },
    {
      key: 'email',
      label: t('mobile.profile.email'),
      type: 'email',
      value: email,
      onChange: setEmail,
      icon: 'mail',
      testid: 'input-email',
    },
    {
      key: 'emergency',
      label: t('mobile.profile.emergencyContact'),
      type: 'text',
      value: emergencyContact,
      onChange: setEmergencyContact,
      icon: 'emergency',
      testid: 'input-emergency',
    },
  ];

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#fff8f7" />
        <title>{t('mobile.profile.editTitle')}</title>
      </Helmet>
      <div className="pb-10 max-w-lg mx-auto" data-testid="edit-profile-page">
        {/* Top action bar */}
        <div
          className="flex items-center justify-between px-6 pt-6 mb-6"
          data-testid="edit-topbar"
        >
          <button
            onClick={() => navigate(-1)}
            className="text-primary font-semibold font-body hover:opacity-80 transition-opacity"
            data-testid="cancel-btn"
          >
            {t('mobile.profile.cancel')}
          </button>
          <h1 className="font-headline text-lg font-bold text-on-surface">
            {t('mobile.profile.editTitle')}
          </h1>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="font-bold text-on-primary px-4 py-2 rounded-xl text-sm font-label disabled:opacity-60 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
            data-testid="save-btn"
          >
            {t('mobile.profile.save')}
          </button>
        </div>

        {/* Save error */}
        {saveError && (
          <div
            role="alert"
            className="mx-6 mb-4 px-4 py-3 bg-error-container/40 text-error rounded-xl text-sm font-body"
            data-testid="save-error"
          >
            {saveError}
          </div>
        )}

        {/* Avatar preview */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div
              className="w-28 h-28 rounded-full p-1 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
            >
              <img
                src={profile?.avatar || '/default-avatar.png'}
                alt={t('mobile.profile.avatarAlt')}
                loading="lazy"
                className="w-full h-full rounded-full object-cover"
                data-testid="edit-avatar"
              />
            </div>
          </div>
          <p className="text-on-surface-variant text-xs mt-2 font-body">
            {t('mobile.profile.avatarHint')}
          </p>
        </div>

        {/* Contact details */}
        <div className="px-6" data-testid="contact-section">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              {t('mobile.profile.contactDetails')}
            </h2>
          </div>
          <div className="space-y-4">
            {contactFields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.testid}
                  className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block font-label"
                >
                  {field.label}
                </label>
                <div className="relative group">
                  <span
                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors"
                    aria-hidden="true"
                  >
                    {field.icon}
                  </span>
                  <input
                    id={field.testid}
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest rounded-xl outline-none border-b-2 border-transparent focus:border-primary transition-all text-on-surface font-body text-base"
                    data-testid={field.testid}
                    autoComplete={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'off'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred location */}
        <div className="px-6 mt-8" data-testid="location-section">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              {t('mobile.profile.preferredLocation')}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LOCATION_OPTIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`py-3 px-4 rounded-xl text-xs font-bold font-label tracking-wide transition-all ${
                  location === loc
                    ? 'text-on-primary shadow-lg'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
                style={location === loc ? { background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' } : {}}
                aria-pressed={location === loc}
                data-testid={`location-btn-${loc.toLowerCase()}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Work preferences */}
        <div className="px-6 mt-8" data-testid="preferences-section">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              {t('mobile.profile.workPreferences')}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="preferences-edit-list">
            {preferences.map((pref) => (
              <span
                key={pref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold font-label"
                data-testid={`pref-chip-${pref}`}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  {PREF_ICONS[pref] ?? 'label'}
                </span>
                {t(`mobile.profile.pref.${pref}`, { defaultValue: pref })}
                <button
                  onClick={() => removePreference(pref)}
                  className="hover:opacity-70 transition-opacity ml-0.5"
                  aria-label={`${t('mobile.profile.remove')} ${t(`mobile.profile.pref.${pref}`, { defaultValue: pref })}`}
                  data-testid={`remove-pref-${pref}`}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    aria-hidden="true"
                  >
                    close
                  </span>
                </button>
              </span>
            ))}
            {availableToAdd.map((pref) => (
              <button
                key={pref}
                onClick={() => addPreference(pref)}
                className="px-3 py-1.5 border-2 border-dashed border-outline-variant text-on-surface-variant rounded-full text-xs font-bold font-label hover:border-primary hover:text-primary transition-all"
                data-testid={`add-pref-${pref}`}
                aria-label={`${t('mobile.profile.addPreference')} ${t(`mobile.profile.pref.${pref}`, { defaultValue: pref })}`}
              >
                + {t(`mobile.profile.pref.${pref}`, { defaultValue: pref })}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
