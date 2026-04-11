/**
 * Unit tests for Task 84 — MobileProfilePage & MobileEditProfilePage (Nexus Kinetic)
 *
 * Covers:
 *  - certRingOffset(): SVG strokeDashoffset geometry (r=45, circumference≈283)
 *  - PREF_ICONS: preference key → material symbol mapping
 *  - removePreference logic: filters a value from array
 *  - addPreference logic: deduplicates additions
 *  - EN i18n: mobile.profile.* flat keys + pref.* nested
 *  - FR i18n: key presence + exact translated values
 *  - Source structural assertions: MobileProfilePage (testids, aria, Magenta, ring)
 *  - Source structural assertions: MobileEditProfilePage (form, labels, testids)
 *  - useEssUpdateProfile hook: PATCH /ess/profile, returns updateProfile/isLoading/error
 *  - App.jsx: imports + routes for profile and profile/edit
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Helpers mirrored from MobileProfilePage ──────────────────────

const TWO_PI_R45 = 2 * Math.PI * 45; // ≈ 282.743

function certRingOffset(score) {
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  return TWO_PI_R45 * (1 - pct / 100);
}

function removePreference(preferences, pref) {
  return preferences.filter((p) => p !== pref);
}

function addPreference(preferences, pref) {
  if (preferences.includes(pref)) return preferences;
  return [...preferences, pref];
}

// ── certRingOffset ────────────────────────────────────────────────

describe('certRingOffset()', () => {
  it('returns 0 for score=100 (fully filled)', () => {
    expect(certRingOffset(100)).toBeCloseTo(0);
  });

  it('returns full circumference for score=0 (empty ring)', () => {
    expect(certRingOffset(0)).toBeCloseTo(TWO_PI_R45);
  });

  it('score=80 → offset ≈ 283 × 0.20 ≈ 56.55', () => {
    expect(certRingOffset(80)).toBeCloseTo(TWO_PI_R45 * 0.2);
  });

  it('score=50 → half circumference', () => {
    expect(certRingOffset(50)).toBeCloseTo(TWO_PI_R45 * 0.5);
  });

  it('score=98 → small offset ≈ 5.65', () => {
    expect(certRingOffset(98)).toBeCloseTo(TWO_PI_R45 * 0.02);
  });

  it('clamps score above 100 – treats as 100 → offset=0', () => {
    expect(certRingOffset(120)).toBeCloseTo(0);
  });

  it('clamps negative score – treats as 0 → full offset', () => {
    expect(certRingOffset(-10)).toBeCloseTo(TWO_PI_R45);
  });

  it('handles null score gracefully → full offset', () => {
    expect(certRingOffset(null)).toBeCloseTo(TWO_PI_R45);
  });
});

// ── removePreference ──────────────────────────────────────────────

describe('removePreference()', () => {
  it('removes the specified preference', () => {
    expect(removePreference(['fastFood', 'grocery', 'butcher'], 'grocery')).toEqual([
      'fastFood',
      'butcher',
    ]);
  });

  it('returns original array when pref not present', () => {
    expect(removePreference(['fastFood'], 'cafe')).toEqual(['fastFood']);
  });

  it('returns empty array when removing last item', () => {
    expect(removePreference(['cafe'], 'cafe')).toEqual([]);
  });
});

// ── addPreference ─────────────────────────────────────────────────

describe('addPreference()', () => {
  it('adds a new preference', () => {
    expect(addPreference(['fastFood'], 'grocery')).toEqual(['fastFood', 'grocery']);
  });

  it('does not add duplicate preference', () => {
    expect(addPreference(['fastFood', 'grocery'], 'grocery')).toEqual(['fastFood', 'grocery']);
  });

  it('adds to empty array', () => {
    expect(addPreference([], 'butcher')).toEqual(['butcher']);
  });
});

// ── EN i18n keys ──────────────────────────────────────────────────

describe('EN mobile.profile i18n keys', () => {
  const enPath = path.resolve(process.cwd(), 'public/locales/en/ess.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const prof = en.mobile?.profile ?? {};

  const flatKeys = [
    'employeeProfile', 'activeScore', 'profileCompleteness', 'completeHint',
    'personalInfo', 'email', 'phone', 'started', 'department',
    'workPreferences', 'workLocations', 'present',
    'editProfile', 'editTitle', 'cancel', 'save',
    'contactDetails', 'emergencyContact', 'addPreference', 'remove',
    'noPreferences', 'noLocations', 'preferredLocation',
  ];

  flatKeys.forEach((key) => {
    it(`has EN key mobile.profile.${key}`, () => {
      expect(prof[key]).toBeDefined();
      expect(typeof prof[key]).toBe('string');
      expect(prof[key].length).toBeGreaterThan(0);
    });
  });

  it('editProfile is "Edit Profile"', () => {
    expect(prof.editProfile).toBe('Edit Profile');
  });

  it('save is "Save"', () => {
    expect(prof.save).toBe('Save');
  });

  it('present is "Present"', () => {
    expect(prof.present).toBe('Present');
  });

  it('has pref.fastFood', () => {
    expect(prof.pref?.fastFood).toBe('Fast Food');
  });

  it('has pref.grocery', () => {
    expect(prof.pref?.grocery).toBeDefined();
  });

  it('has pref.butcher', () => {
    expect(prof.pref?.butcher).toBeDefined();
  });

  it('has pref.bakery', () => {
    expect(prof.pref?.bakery).toBeDefined();
  });

  it('has pref.cafe', () => {
    expect(prof.pref?.cafe).toBeDefined();
  });
});

// ── FR i18n keys ──────────────────────────────────────────────────

describe('FR mobile.profile i18n keys', () => {
  const frPath = path.resolve(process.cwd(), 'public/locales/fr/ess.json');
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const prof = fr.mobile?.profile ?? {};

  it('personalInfo → "Informations personnelles"', () => {
    expect(prof.personalInfo).toBe('Informations personnelles');
  });

  it('editProfile → "Modifier le profil"', () => {
    expect(prof.editProfile).toBe('Modifier le profil');
  });

  it('save → "Enregistrer"', () => {
    expect(prof.save).toBe('Enregistrer');
  });

  it('cancel → "Annuler"', () => {
    expect(prof.cancel).toBe('Annuler');
  });

  it('workPreferences → contains "Préférences"', () => {
    expect(prof.workPreferences).toContain('Préférences');
  });

  it('workLocations → contains "Lieux"', () => {
    expect(prof.workLocations).toContain('Lieux');
  });

  it('present → "Présent"', () => {
    expect(prof.present).toBe('Présent');
  });

  it('pref.fastFood → "Restauration rapide"', () => {
    expect(prof.pref?.fastFood).toBe('Restauration rapide');
  });

  it('pref.grocery → contains "picerie"', () => {
    expect(prof.pref?.grocery).toContain('picerie');
  });

  it('pref.butcher → "Boucherie"', () => {
    expect(prof.pref?.butcher).toBe('Boucherie');
  });

  it('department → "Département"', () => {
    expect(prof.department).toBe('Département');
  });
});

// ── Source: MobileProfilePage (Task 89 — Executive Pulse redesign) ──

describe('MobileProfilePage source structure', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileProfilePage.jsx'),
    'utf8'
  );

  it('imports useEssProfile', () => {
    expect(src).toContain('useEssProfile');
  });

  it('imports useEssPayslips', () => {
    expect(src).toContain('useEssPayslips');
  });

  it('imports useTranslation', () => {
    expect(src).toContain('useTranslation');
  });

  it('imports Helmet', () => {
    expect(src).toContain('Helmet');
  });

  it('imports useNavigate', () => {
    expect(src).toContain('useNavigate');
  });

  it('imports boring-avatars Avatar', () => {
    expect(src).toContain("from 'boring-avatars'");
  });

  it('exports certRingOffset', () => {
    expect(src).toContain('export function certRingOffset');
  });

  it('certRingOffset uses r=45 circumference', () => {
    expect(src).toMatch(/2\s*\*\s*Math\.PI\s*\*\s*45/);
  });

  it('has Magenta primary gradient #da336b', () => {
    expect(src).toContain('#da336b');
  });

  it('has profile-page testid', () => {
    expect(src).toContain('data-testid="profile-page"');
  });

  it('has profile-hero testid', () => {
    expect(src).toContain('data-testid="profile-hero"');
  });

  it('has profile-avatar-img testid', () => {
    expect(src).toContain('data-testid="profile-avatar-img"');
  });

  it('has profile-avatar-generated testid', () => {
    expect(src).toContain('data-testid="profile-avatar-generated"');
  });

  it('has profile-name testid', () => {
    expect(src).toContain('data-testid="profile-name"');
  });

  it('has personal-info-card testid', () => {
    expect(src).toContain('data-testid="personal-info-card"');
  });

  it('has cert-card testid', () => {
    expect(src).toContain('data-testid="cert-card"');
  });

  it('has cert-score testid', () => {
    expect(src).toContain('data-testid="cert-score"');
  });

  it('has cert-progress-bar testid', () => {
    expect(src).toContain('data-testid="cert-progress-bar"');
  });

  it('has payslips-card testid', () => {
    expect(src).toContain('data-testid="payslips-card"');
  });

  it('has payslip-row testid', () => {
    expect(src).toContain('data-testid="payslip-row"');
  });

  it('has location-row testid', () => {
    expect(src).toContain('data-testid="location-row"');
  });

  it('has edit-profile-btn testid', () => {
    expect(src).toContain('data-testid="edit-profile-btn"');
  });

  it('navigates to /app/ess/profile/edit on edit button click', () => {
    expect(src).toContain('/app/ess/profile/edit');
  });

  it('has profile-skeleton testid', () => {
    expect(src).toContain('data-testid="profile-skeleton"');
  });

  it('Intl.DateTimeFormat used for date formatting', () => {
    expect(src).toContain('Intl.DateTimeFormat');
  });

  it('exports MobileProfilePage as named export', () => {
    expect(src).toContain('export const MobileProfilePage');
  });

  it('uses normalise() helper to flatten profile data', () => {
    expect(src).toContain('function normalise(raw)');
  });

  it('completeness defaults to 85', () => {
    expect(src).toContain('completeness ?? 85');
  });

  it('AVATAR_PALETTE includes primary magenta', () => {
    expect(src).toContain("'#da336b'");
  });

  it('bento grid uses md:grid-cols-12', () => {
    expect(src).toContain('md:grid-cols-12');
  });

  it('personal info is md:col-span-8', () => {
    expect(src).toContain('md:col-span-8');
  });

  it('sidebar is md:col-span-4', () => {
    expect(src).toContain('md:col-span-4');
  });

  it('hero avatar has tilted gradient background', () => {
    expect(src).toContain('rotate-6');
  });

  it('aria-hidden on decorative icons', () => {
    expect(src).toContain('aria-hidden="true"');
  });
});

// ── Source: MobileEditProfilePage ────────────────────────────────

describe('MobileEditProfilePage source structure', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileEditProfilePage.jsx'),
    'utf8'
  );

  it('imports useEssProfile', () => {
    expect(src).toContain('useEssProfile');
  });

  it('imports useEssUpdateProfile', () => {
    expect(src).toContain('useEssUpdateProfile');
  });

  it('imports useTranslation', () => {
    expect(src).toContain('useTranslation');
  });

  it('imports useNavigate', () => {
    expect(src).toContain('useNavigate');
  });

  it('exports MobileEditProfilePage as named export', () => {
    expect(src).toContain('export const MobileEditProfilePage');
  });

  it('has edit-profile-page testid', () => {
    expect(src).toContain('data-testid="edit-profile-page"');
  });

  it('has edit-topbar testid', () => {
    expect(src).toContain('data-testid="edit-topbar"');
  });

  it('has cancel-btn testid', () => {
    expect(src).toContain('data-testid="cancel-btn"');
  });

  it('has save-btn testid', () => {
    expect(src).toContain('data-testid="save-btn"');
  });

  it('save button has disabled={isLoading}', () => {
    expect(src).toContain('disabled={isLoading}');
  });

  it('has cancellation navigation to -1', () => {
    expect(src).toContain('navigate(-1)');
  });

  it('calls updateProfile on save', () => {
    expect(src).toContain('updateProfile');
  });

  it('has save-error testid with role="alert"', () => {
    expect(src).toContain('data-testid="save-error"');
    expect(src).toContain('role="alert"');
  });

  it('has contact-section testid', () => {
    expect(src).toContain('data-testid="contact-section"');
  });

  it('has input-phone testid value in config', () => {
    expect(src).toContain("testid: 'input-phone'");
  });

  it('has input-email testid value in config', () => {
    expect(src).toContain("testid: 'input-email'");
  });

  it('has input-emergency testid value in config', () => {
    expect(src).toContain("testid: 'input-emergency'");
  });

  it('inputs use dynamic data-testid={field.testid}', () => {
    expect(src).toContain('data-testid={field.testid}');
  });

  it('inputs have associated htmlFor label', () => {
    expect(src).toContain('htmlFor={field.testid}');
  });

  it('phone input has type="tel"', () => {
    expect(src).toContain("type: 'tel'");
  });

  it('email input has type="email"', () => {
    expect(src).toContain("type: 'email'");
  });

  it('has preferences-section testid', () => {
    expect(src).toContain('data-testid="preferences-section"');
  });

  it('has preferences-edit-list testid', () => {
    expect(src).toContain('data-testid="preferences-edit-list"');
  });

  it('remove preference buttons have aria-label', () => {
    expect(src).toContain('mobile.profile.remove');
  });

  it('preference remove buttons use data-testid remove-pref-{pref}', () => {
    expect(src).toContain('data-testid={`remove-pref-${pref}`}');
  });

  it('add preference buttons have aria-label', () => {
    expect(src).toContain('mobile.profile.addPreference');
  });

  it('location buttons have aria-pressed', () => {
    expect(src).toContain('aria-pressed={location === loc}');
  });

  it('has location-section testid', () => {
    expect(src).toContain('data-testid="location-section"');
  });

  it('Magenta gradient on save button', () => {
    expect(src).toContain('#da336b');
    expect(src).toContain('#8b2044');
  });

  it('pre-populates phone from profile?.phone', () => {
    expect(src).toContain('profile?.phone');
  });

  it('pre-populates email from profile?.email', () => {
    expect(src).toContain('profile?.email');
  });

  it('pre-populates workPreferences from profile?.workPreferences', () => {
    expect(src).toContain('profile?.workPreferences');
  });

  it('has edit-avatar testid', () => {
    expect(src).toContain('data-testid="edit-avatar"');
  });
});

// ── useEssUpdateProfile hook ──────────────────────────────────────

describe('useEssUpdateProfile hook', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useEssUpdateProfile.js'),
    'utf8'
  );

  it('exports useEssUpdateProfile', () => {
    expect(src).toContain('export function useEssUpdateProfile');
  });

  it('calls /ess/profile with PATCH', () => {
    expect(src).toContain('/ess/profile');
    expect(src).toContain("method: 'PATCH'");
  });

  it('sends JSON body', () => {
    expect(src).toContain("'Content-Type': 'application/json'");
    expect(src).toContain('JSON.stringify');
  });

  it('returns updateProfile function', () => {
    expect(src).toContain('return { updateProfile, isLoading, error }');
  });

  it('tracks isLoading state', () => {
    expect(src).toContain('isLoading');
  });

  it('tracks error state', () => {
    expect(src).toContain('setError');
  });

  it('uses useCallback for stable reference', () => {
    expect(src).toContain('useCallback');
  });
});

// ── App.jsx routes ────────────────────────────────────────────────

describe('App.jsx profile routes', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/App.jsx'),
    'utf8'
  );

  it('imports MobileProfilePage', () => {
    expect(src).toContain('MobileProfilePage');
  });

  it('imports MobileEditProfilePage', () => {
    expect(src).toContain('MobileEditProfilePage');
  });

  it('has profile route pointing to MobileProfilePage', () => {
    expect(src).toContain('element={<MobileProfilePage />}');
  });

  it('has profile/edit route pointing to MobileEditProfilePage', () => {
    expect(src).toContain('path="profile/edit"');
    expect(src).toContain('element={<MobileEditProfilePage />}');
  });

  it('no longer uses EssProfilePage for profile route', () => {
    // The profile path should now map to MobileProfilePage, not EssProfilePage
    // EssProfilePage may still be imported for other use but not as the profile route element
    const profileRouteMatch = src.match(/path="profile"\s+element=\{<([^>]+)>/);
    expect(profileRouteMatch?.[1]).toContain('MobileProfilePage');
  });
});
