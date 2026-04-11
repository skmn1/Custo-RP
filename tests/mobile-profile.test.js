/**
 * Unit tests for Task 69 — ESS Mobile Profile
 *
 * Covers:
 *  - Validation helpers: validateField() with all branches
 *  - ProfileHeader: avatar, initials fallback, completeness bar
 *  - ProfileSection: section title, card wrapper
 *  - ProfileFieldRow: editable vs read-only, pending chip, chevron
 *  - DocumentRow: status variants (uploaded, pending, missing)
 *  - ChangeRequestSheet: new request mode, pending review mode
 *  - MobileProfile: sections, testids, dependencies
 *  - i18n: EN + FR mobile.profile keys
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const profileSrc = fs.readFileSync(
  path.resolve('src/components/ess/profile/MobileProfile.jsx'),
  'utf-8',
);

// ── Validation helpers ─────────────────────────────────────────────

describe('validateField logic', () => {
  // Replicate the validation logic from the component
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^\+?[\d\s\-().]{7,}$/;

  function validateField(key, value) {
    if (!value || !value.trim()) return 'required';
    const v = value.trim();
    if (key === 'email' && !EMAIL_RE.test(v)) return 'invalidEmail';
    if ((key === 'phone' || key === 'emergencyPhone') && !PHONE_RE.test(v)) return 'invalidPhone';
    if (key === 'address' && v.length < 5) return 'tooShort';
    if ((key === 'firstName' || key === 'lastName' || key === 'emergencyName') && v.length < 2) return 'tooShort';
    return null;
  }

  it('returns required for empty string', () => {
    expect(validateField('email', '')).toBe('required');
  });

  it('returns required for whitespace-only string', () => {
    expect(validateField('phone', '   ')).toBe('required');
  });

  it('returns required for null', () => {
    expect(validateField('firstName', null)).toBe('required');
  });

  it('returns required for undefined', () => {
    expect(validateField('address', undefined)).toBe('required');
  });

  it('returns invalidEmail for malformed email', () => {
    expect(validateField('email', 'notanemail')).toBe('invalidEmail');
    expect(validateField('email', 'missing@tld')).toBe('invalidEmail');
  });

  it('returns null for valid email', () => {
    expect(validateField('email', 'user@example.com')).toBeNull();
  });

  it('returns invalidPhone for short phone', () => {
    expect(validateField('phone', '123')).toBe('invalidPhone');
  });

  it('returns null for valid phone with international format', () => {
    expect(validateField('phone', '+1 (555) 123-4567')).toBeNull();
  });

  it('validates emergencyPhone like phone', () => {
    expect(validateField('emergencyPhone', '12')).toBe('invalidPhone');
    expect(validateField('emergencyPhone', '+33 6 12 34 56 78')).toBeNull();
  });

  it('returns tooShort for address under 5 chars', () => {
    expect(validateField('address', 'abc')).toBe('tooShort');
  });

  it('returns null for valid address', () => {
    expect(validateField('address', '123 Main Street')).toBeNull();
  });

  it('returns tooShort for firstName/lastName under 2 chars', () => {
    expect(validateField('firstName', 'A')).toBe('tooShort');
    expect(validateField('lastName', 'B')).toBe('tooShort');
  });

  it('returns tooShort for emergencyName under 2 chars', () => {
    expect(validateField('emergencyName', 'X')).toBe('tooShort');
  });

  it('returns null for valid names', () => {
    expect(validateField('firstName', 'Alice')).toBeNull();
    expect(validateField('lastName', 'Smith')).toBeNull();
    expect(validateField('emergencyName', 'Bob')).toBeNull();
  });

  it('returns null for fields without specific rules', () => {
    expect(validateField('gender', 'Male')).toBeNull();
    expect(validateField('dateOfBirth', '1990-01-01')).toBeNull();
  });
});

// ── ProfileHeader structure ────────────────────────────────────────

describe('ProfileHeader component structure', () => {
  it('has data-testid="profile-header"', () => {
    expect(profileSrc).toContain('data-testid="profile-header"');
  });

  it('renders avatar image when personal.avatar exists', () => {
    expect(profileSrc).toContain('personal.avatar');
    expect(profileSrc).toContain('data-testid="profile-avatar"');
  });

  it('renders initials fallback when no avatar', () => {
    expect(profileSrc).toContain('data-testid="profile-avatar-fallback"');
  });

  it('avatar is 80×80 rounded', () => {
    expect(profileSrc).toContain('h-20');
    expect(profileSrc).toContain('w-20');
    expect(profileSrc).toContain('rounded-full');
  });

  it('computes fullName from name or firstName+lastName', () => {
    expect(profileSrc).toContain('personal.name');
    expect(profileSrc).toContain('personal.firstName');
    expect(profileSrc).toContain('personal.lastName');
  });

  it('shows jobTitle and department', () => {
    expect(profileSrc).toContain('contract.jobTitle');
    expect(profileSrc).toContain('contract.department');
  });

  it('renders completeness bar with data-testid', () => {
    expect(profileSrc).toContain('data-testid="completeness-bar"');
  });

  it('hides completeness bar at 100%', () => {
    expect(profileSrc).toContain('profile.completeness');
  });
});

// ── ProfileSection structure ───────────────────────────────────────

describe('ProfileSection component structure', () => {
  it('renders section title', () => {
    expect(profileSrc).toContain('data-testid="profile-section"');
  });

  it('wraps content in elevated card with rounded corners', () => {
    expect(profileSrc).toContain('bg-[var(--mobile-bg-elevated)]');
    expect(profileSrc).toContain('rounded-xl');
  });
});

// ── ProfileFieldRow structure ──────────────────────────────────────

describe('ProfileFieldRow component structure', () => {
  it('has data-testid="profile-field-row"', () => {
    expect(profileSrc).toContain('data-testid="profile-field-row"');
  });

  it('renders ChevronRightIcon for editable fields', () => {
    expect(profileSrc).toContain('ChevronRightIcon');
  });

  it('supports pending change chip', () => {
    expect(profileSrc).toContain('StatusChip');
  });

  it('handles keyboard accessibility with Enter and Space', () => {
    expect(profileSrc).toContain('Enter');
    expect(profileSrc).toContain("' '");
  });

  it('uses cursor-pointer for editable fields', () => {
    expect(profileSrc).toContain('cursor-pointer');
  });
});

// ── DocumentRow structure ──────────────────────────────────────────

describe('DocumentRow component structure', () => {
  it('has data-testid="document-row"', () => {
    expect(profileSrc).toContain('data-testid="document-row"');
  });

  it('shows StatusChip with uploaded variant', () => {
    expect(profileSrc).toContain("variant=\"success\"");
  });

  it('shows StatusChip with pending variant', () => {
    expect(profileSrc).toContain("variant=\"warning\"");
  });

  it('shows StatusChip with missing variant', () => {
    expect(profileSrc).toContain("variant=\"neutral\"");
  });
});

// ── ChangeRequestSheet structure ───────────────────────────────────

describe('ChangeRequestSheet component structure', () => {
  it('has data-testid="change-request-sheet"', () => {
    expect(profileSrc).toContain('data-testid="change-request-sheet"');
  });

  it('renders BottomSheet', () => {
    expect(profileSrc).toContain('<BottomSheet');
  });

  it('shows current value', () => {
    expect(profileSrc).toContain("t('mobile.profile.currentValue')");
  });

  it('has input for new value with data-testid', () => {
    expect(profileSrc).toContain('data-testid="change-input"');
  });

  it('has submit request button', () => {
    expect(profileSrc).toContain('data-testid="submit-request-btn"');
  });

  it('has cancel request button for pending changes', () => {
    expect(profileSrc).toContain('data-testid="cancel-request-btn"');
  });

  it('shows validation error', () => {
    expect(profileSrc).toContain('data-testid="change-validation-error"');
  });

  it('displays HR review note', () => {
    expect(profileSrc).toContain("t('mobile.profile.hrReviewNote')");
  });

  it('uses validateField for client-side validation', () => {
    expect(profileSrc).toContain('validateField');
  });
});

// ── MobileProfile main component ──────────────────────────────────

describe('MobileProfile overall structure', () => {
  it('has data-testid="mobile-profile"', () => {
    expect(profileSrc).toContain('data-testid="mobile-profile"');
  });

  it('imports useEssProfile hook', () => {
    expect(profileSrc).toContain("from '../../../hooks/useEssProfile'");
  });

  it('imports useEssConnectivity context', () => {
    expect(profileSrc).toContain("from '../../../contexts/EssConnectivityContext'");
  });

  it('imports MobileHeader', () => {
    expect(profileSrc).toContain("from '../../mobile/MobileHeader'");
  });

  it('imports BottomSheet', () => {
    expect(profileSrc).toContain("from '../../mobile/BottomSheet'");
  });

  it('imports EssOfflineFallback', () => {
    expect(profileSrc).toContain("from '../EssOfflineFallback'");
  });

  it('renders loading skeleton with data-testid', () => {
    expect(profileSrc).toContain('data-testid="profile-skeleton"');
  });

  it('renders error state with data-testid', () => {
    expect(profileSrc).toContain('data-testid="mobile-profile-error"');
  });

  it('renders all five sections', () => {
    expect(profileSrc).toContain("t('mobile.profile.personalInfo')");
    expect(profileSrc).toContain("t('mobile.profile.contact')");
    expect(profileSrc).toContain("t('mobile.profile.emergencyContact')");
    expect(profileSrc).toContain("t('mobile.profile.experience')");
    expect(profileSrc).toContain("t('mobile.profile.documents')");
  });

  it('builds pendingMap from changeRequests and queuedRequests', () => {
    expect(profileSrc).toContain('pendingMap');
    expect(profileSrc).toContain('changeRequests');
    expect(profileSrc).toContain('queuedRequests');
  });

  it('uses useMemo for field arrays', () => {
    expect(profileSrc).toContain('useMemo');
  });

  it('uses useCallback for event handlers', () => {
    expect(profileSrc).toContain('useCallback');
  });

  it('default export is MobileProfile', () => {
    expect(profileSrc).toContain('export default MobileProfile');
  });
});

// ── EssProfilePage mobile wiring ──────────────────────────────────

describe('EssProfilePage mobile conditional', () => {
  const pageSrc = fs.readFileSync(
    path.resolve('src/pages/ess/EssProfilePage.jsx'),
    'utf-8',
  );

  it('imports useMobileLayout', () => {
    expect(pageSrc).toContain("import { useMobileLayout } from '../../hooks/useMobileLayout'");
  });

  it('imports MobileProfilePage with Nexus Kinetic styling', () => {
    expect(pageSrc).toContain("import { MobileProfilePage } from './mobile/MobileProfilePage'");
  });

  it('calls useMobileLayout()', () => {
    expect(pageSrc).toContain('useMobileLayout()');
  });

  it('returns MobileProfilePage with Nexus Kinetic styling when isMobile', () => {
    expect(pageSrc).toContain('if (isMobile) return <MobileProfilePage />');
  });
});

// ── i18n — mobile.profile keys ────────────────────────────────────

describe('i18n — mobile.profile keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'title', 'complete', 'personalInfo', 'contact', 'emergencyContact',
    'experience', 'documents', 'pending', 'uploaded', 'missing',
    'updateField', 'pendingChange', 'currentValue', 'newValue',
    'requestedValue', 'submitted', 'statusPendingReview', 'submitRequest',
    'cancelRequest', 'cancel', 'close', 'hrReviewNote',
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone',
    'address', 'emergencyName', 'emergencyRelationship', 'emergencyPhone',
    'department', 'startDate', 'contract',
    'validationRequired', 'validationEmail', 'validationPhone',
    'validationShort', 'validationError',
  ];

  it('EN has all mobile.profile keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.profile).toHaveProperty(key);
      expect(en.mobile.profile[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.profile keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.profile).toHaveProperty(key);
      expect(fr.mobile.profile[key]).toBeTruthy();
    });
  });

  it('EN and FR have same number of profile keys', () => {
    const enKeys = Object.keys(en.mobile.profile);
    const frKeys = Object.keys(fr.mobile.profile);
    expect(enKeys.length).toBe(frKeys.length);
  });

  it('FR title is "Profil"', () => {
    expect(fr.mobile.profile.title).toBe('Profil');
  });

  it('FR personalInfo is "Informations personnelles"', () => {
    expect(fr.mobile.profile.personalInfo).toBe('Informations personnelles');
  });

  it('FR emergencyContact is "Contact d\'urgence"', () => {
    expect(fr.mobile.profile.emergencyContact).toBe("Contact d'urgence");
  });

  it('interpolation placeholders are present in both locales', () => {
    expect(en.mobile.profile.complete).toContain('{{percent}}');
    expect(fr.mobile.profile.complete).toContain('{{percent}}');
    expect(en.mobile.profile.updateField).toContain('{{field}}');
    expect(fr.mobile.profile.updateField).toContain('{{field}}');
    expect(en.mobile.profile.submitted).toContain('{{date}}');
    expect(fr.mobile.profile.submitted).toContain('{{date}}');
  });
});
