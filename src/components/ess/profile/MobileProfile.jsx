/**
 * MobileProfile — Task 69
 *
 * Mobile-native profile screen with hero header (avatar, name, role),
 * sectioned field lists (personal, contact, emergency, experience, documents),
 * tappable editable fields that open a BottomSheet for change requests,
 * and inline pending-change amber chips.
 * Reuses useEssProfile hook from task 52.
 */
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEssProfile } from '../../../hooks/useEssProfile';
import { useEssConnectivity } from '../../../contexts/EssConnectivityContext';
import MobileHeader from '../../mobile/MobileHeader';
import MobileCard from '../../mobile/MobileCard';
import StatusChip from '../../mobile/StatusChip';
import BottomSheet from '../../mobile/BottomSheet';
import { QueuedActionsNotice } from '../../mobile/MobileOfflineIndicators';
import EssOfflineFallback from '../EssOfflineFallback';

// ── Validation helpers ───────────────────────────────────────

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

// ── ProfileHeader ────────────────────────────────────────────

const ProfileHeader = ({ profile, t }) => {
  const personal = profile.personal || {};
  const contract = profile.contract || {};
  const fullName = personal.name || `${personal.firstName || ''} ${personal.lastName || ''}`.trim();

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-6" data-testid="profile-header">
      <div className="relative">
        {personal.avatar ? (
          <img
            src={personal.avatar}
            alt={fullName}
            className="h-20 w-20 rounded-full object-cover"
            data-testid="profile-avatar"
          />
        ) : (
          <div
            className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold"
            data-testid="profile-avatar-fallback"
          >
            {(personal.firstName?.[0] || '').toUpperCase()}{(personal.lastName?.[0] || '').toUpperCase()}
          </div>
        )}
      </div>
      <h2 className="text-mobile-title2 text-[var(--mobile-label-primary)] mt-3">{fullName}</h2>
      <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-0.5">
        {contract.jobTitle || ''}
      </p>
      <p className="text-mobile-footnote text-[var(--mobile-label-tertiary)]">
        {contract.department || personal.location || ''}
      </p>

      {profile.completeness != null && profile.completeness < 100 && (
        <div className="w-full max-w-[200px] mt-4" data-testid="completeness-bar">
          <div className="flex justify-between text-mobile-caption text-[var(--mobile-label-secondary)] mb-1">
            <span>{t('mobile.profile.complete', { percent: profile.completeness })}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--mobile-separator)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--mobile-tint)] transition-all duration-500"
              style={{ width: `${profile.completeness}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── ProfileSection ───────────────────────────────────────────

const ProfileSection = ({ title, children }) => (
  <div className="mt-6" data-testid="profile-section">
    <h3 className="text-mobile-caption font-semibold text-[var(--mobile-label-secondary)] uppercase tracking-wide px-4 mb-2">
      {title}
    </h3>
    <div className="bg-[var(--mobile-bg-elevated)] rounded-xl mx-4 divide-y divide-[var(--mobile-separator)]">
      {children}
    </div>
  </div>
);

// ── ProfileFieldRow ──────────────────────────────────────────

const ProfileFieldRow = ({ label, value, editable, pending, onPress }) => (
  <div
    className={`flex items-center justify-between px-4 py-3 min-h-[44px] ${
      editable ? 'active:bg-gray-50 dark:active:bg-gray-800/50 cursor-pointer transition-colors duration-150' : ''
    }`}
    onClick={editable ? onPress : undefined}
    onKeyDown={editable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(); } } : undefined}
    role={editable ? 'button' : undefined}
    tabIndex={editable ? 0 : undefined}
    data-testid="profile-field-row"
  >
    <span className="text-mobile-body text-[var(--mobile-label-secondary)] w-1/3 flex-shrink-0">
      {label}
    </span>
    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
      <span className="text-mobile-body text-[var(--mobile-label-primary)] text-right truncate">
        {value || '—'}
      </span>
      {pending && <StatusChip label={pending.label || 'Pending'} variant="warning" />}
      {editable && (
        <ChevronRightIcon className="h-4 w-4 text-[var(--mobile-label-tertiary)] flex-shrink-0" />
      )}
    </div>
  </div>
);

// ── DocumentRow ──────────────────────────────────────────────

const DocumentRow = ({ doc, t, onPress }) => (
  <div
    className="flex items-center justify-between px-4 py-3 min-h-[44px] active:bg-gray-50 dark:active:bg-gray-800/50 cursor-pointer transition-colors duration-150"
    onClick={() => onPress(doc)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(doc); } }}
    role="button"
    tabIndex={0}
    data-testid="document-row"
  >
    <span className="text-mobile-body text-[var(--mobile-label-primary)]">{doc.label}</span>
    <div className="flex items-center gap-2">
      {doc.uploaded ? (
        <StatusChip label={t('mobile.profile.uploaded')} variant="success" />
      ) : doc.pending ? (
        <StatusChip label={t('mobile.profile.pending')} variant="warning" />
      ) : (
        <StatusChip label={t('mobile.profile.missing')} variant="neutral" />
      )}
      <ChevronRightIcon className="h-4 w-4 text-[var(--mobile-label-tertiary)] flex-shrink-0" />
    </div>
  </div>
);

// ── ChangeRequestSheet ───────────────────────────────────────

const ChangeRequestSheet = ({ field, onClose, onSubmit, onCancel, t }) => {
  const [newValue, setNewValue] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isPending = !!field?.pendingChange;

  const handleSubmit = async () => {
    const err = validateField(field.key, newValue);
    if (err) {
      setValidationError(err);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        fieldName: field.key,
        fieldLabel: field.label,
        oldValue: field.value || '',
        newValue: newValue.trim(),
      });
      onClose();
    } catch {
      setValidationError('submitError');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await onCancel(field.pendingChange.id);
      onClose();
    } catch {
      setValidationError('cancelError');
    } finally {
      setSubmitting(false);
    }
  };

  if (!field) return null;

  return (
    <BottomSheet
      isOpen={!!field}
      onClose={onClose}
      title={isPending
        ? t('mobile.profile.pendingChange', { field: field.label })
        : t('mobile.profile.updateField', { field: field.label })}
      snapPoints={['60%', '90%']}
    >
      <div className="space-y-4" data-testid="change-request-sheet">
        {/* Current value */}
        <div>
          <p className="text-mobile-caption text-[var(--mobile-label-secondary)] mb-1">
            {t('mobile.profile.currentValue')}
          </p>
          <p className="text-mobile-body text-[var(--mobile-label-primary)]">
            {field.value || '—'}
          </p>
        </div>

        {isPending ? (
          <>
            {/* Pending review mode */}
            <div>
              <p className="text-mobile-caption text-[var(--mobile-label-secondary)] mb-1">
                {t('mobile.profile.requestedValue')}
              </p>
              <p className="text-mobile-body text-[var(--mobile-label-primary)]">
                {field.pendingChange.newValue}
              </p>
            </div>
            <div className="text-mobile-footnote text-[var(--mobile-label-tertiary)] space-y-1">
              <p>{t('mobile.profile.submitted', {
                date: new Date(field.pendingChange.createdAt).toLocaleDateString(),
              })}</p>
              <p>{t('mobile.profile.statusPendingReview')}</p>
            </div>

            <button
              onClick={handleCancel}
              disabled={submitting}
              className="w-full py-3 bg-[var(--mobile-destructive,#ef4444)] text-white rounded-xl text-mobile-body font-semibold disabled:opacity-50"
              data-testid="cancel-request-btn"
            >
              {t('mobile.profile.cancelRequest')}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-[var(--mobile-tint)] text-mobile-body font-medium"
            >
              {t('mobile.profile.close')}
            </button>
          </>
        ) : (
          <>
            {/* New change request mode */}
            <div>
              <label
                htmlFor="change-new-value"
                className="text-mobile-caption text-[var(--mobile-label-secondary)] mb-1 block"
              >
                {t('mobile.profile.newValue')}
              </label>
              <input
                id="change-new-value"
                type={field.key === 'email' ? 'email' : field.key === 'phone' || field.key === 'emergencyPhone' ? 'tel' : 'text'}
                value={newValue}
                onChange={(e) => { setNewValue(e.target.value); setValidationError(null); }}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--mobile-separator)] bg-[var(--mobile-bg)] text-mobile-body text-[var(--mobile-label-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--mobile-tint)]"
                aria-describedby={validationError ? 'change-field-error' : undefined}
                data-testid="change-input"
              />
              {validationError && (
                <p
                  id="change-field-error"
                  className="text-mobile-caption text-[var(--mobile-destructive,#ef4444)] mt-1"
                  role="alert"
                  data-testid="change-validation-error"
                >
                  {validationError === 'required' ? t('mobile.profile.validationRequired', 'This field is required')
                    : validationError === 'invalidEmail' ? t('mobile.profile.validationEmail', 'Invalid email address')
                    : validationError === 'invalidPhone' ? t('mobile.profile.validationPhone', 'Invalid phone number')
                    : validationError === 'tooShort' ? t('mobile.profile.validationShort', 'Value is too short')
                    : t('mobile.profile.validationError', 'Something went wrong')}
                </p>
              )}
            </div>

            <p className="text-mobile-footnote text-[var(--mobile-label-tertiary)]">
              {t('mobile.profile.hrReviewNote')}
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting || !newValue.trim()}
              className="w-full py-3 bg-[var(--mobile-tint)] text-white rounded-xl text-mobile-body font-semibold disabled:opacity-50"
              data-testid="submit-request-btn"
            >
              {t('mobile.profile.submitRequest')}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-[var(--mobile-tint)] text-mobile-body font-medium"
            >
              {t('mobile.profile.cancel')}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
};

// ── Loading Skeleton ─────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="animate-pulse" data-testid="profile-skeleton">
    <div className="flex flex-col items-center pt-6 pb-4">
      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-3" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="mt-6 mx-4">
        <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="rounded-xl bg-gray-200 dark:bg-gray-700 h-24" />
      </div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────

const MobileProfile = () => {
  const { t } = useTranslation('ess');
  const { isOnline } = useEssConnectivity();
  const {
    profile,
    changeRequests,
    queuedRequests,
    isLoading,
    error,
    fetchProfile,
    submitChangeRequest,
    cancelChangeRequest,
  } = useEssProfile();

  const [activeField, setActiveField] = useState(null);

  // Build a map of pending changes by field name
  const pendingMap = useMemo(() => {
    const map = {};
    const allReqs = [
      ...(changeRequests || []),
      ...(queuedRequests || []),
    ];
    for (const req of allReqs) {
      if (req.status === 'pending' || req.isQueued) {
        map[req.fieldName] = req;
      }
    }
    return map;
  }, [changeRequests, queuedRequests]);

  // Build field definitions for each section
  const personal = profile?.personal || {};
  const contract = profile?.contract || {};
  const emergency = profile?.emergencyContact || personal.emergencyContact || {};
  const documents = profile?.documents || [];

  const buildField = (key, label, value, editable = true) => ({
    key,
    label,
    value: value || '',
    editable,
    pendingChange: pendingMap[key] || null,
  });

  const personalFields = [
    buildField('firstName', t('mobile.profile.firstName'), personal.firstName),
    buildField('lastName', t('mobile.profile.lastName'), personal.lastName),
    buildField('dateOfBirth', t('mobile.profile.dateOfBirth'), personal.dateOfBirth),
    buildField('gender', t('mobile.profile.gender'), personal.gender),
  ];

  const contactFields = [
    buildField('email', t('mobile.profile.email'), personal.email),
    buildField('phone', t('mobile.profile.phone'), personal.phone),
    buildField('address', t('mobile.profile.address'), personal.address),
  ];

  const emergencyFields = [
    buildField('emergencyName', t('mobile.profile.emergencyName'), emergency.name),
    buildField('emergencyRelationship', t('mobile.profile.emergencyRelationship'), emergency.relationship),
    buildField('emergencyPhone', t('mobile.profile.emergencyPhone'), emergency.phone),
  ];

  const experienceFields = [
    buildField('department', t('mobile.profile.department'), contract.department, false),
    buildField('startDate', t('mobile.profile.startDate'), contract.hireDate, false),
    buildField('contract', t('mobile.profile.contract'), contract.status || contract.contractType, false),
  ];

  const handleFieldTap = (field) => {
    setActiveField(field);
  };

  const handleSubmit = async (payload) => {
    await submitChangeRequest(payload);
  };

  const handleCancelRequest = async (id) => {
    await cancelChangeRequest(id);
  };

  const handleDocumentTap = (doc) => {
    if (doc.uploaded && doc.url) {
      window.open(doc.url, '_blank', 'noopener');
    }
    // Missing/pending docs could open a sheet — simplified for this sprint
  };

  // Offline with no data
  if (!isOnline && !profile && !isLoading) {
    return (
      <div data-testid="mobile-profile">
        <MobileHeader title={t('mobile.profile.title')} />
        <EssOfflineFallback />
      </div>
    );
  }

  // Loading
  if (isLoading && !profile) {
    return (
      <div data-testid="mobile-profile">
        <MobileHeader title={t('mobile.profile.title')} />
        <ProfileSkeleton />
      </div>
    );
  }

  // Error
  if (error && !profile) {
    return (
      <div data-testid="mobile-profile">
        <MobileHeader title={t('mobile.profile.title')} />
        <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="mobile-profile-error">
          <p className="text-mobile-body text-[var(--mobile-label-secondary)] mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--mobile-tint)] text-white rounded-lg text-mobile-body font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="pb-24" data-testid="mobile-profile">
      <MobileHeader title={t('mobile.profile.title')} />

      <QueuedActionsNotice />

      {/* Hero header */}
      <ProfileHeader profile={profile} t={t} />

      {/* Personal Information */}
      <ProfileSection title={t('mobile.profile.personalInfo')}>
        {personalFields.map((f) => (
          <ProfileFieldRow
            key={f.key}
            label={f.label}
            value={f.value}
            editable={f.editable}
            pending={f.pendingChange ? { label: t('mobile.profile.pending') } : null}
            onPress={() => handleFieldTap(f)}
          />
        ))}
      </ProfileSection>

      {/* Contact */}
      <ProfileSection title={t('mobile.profile.contact')}>
        {contactFields.map((f) => (
          <ProfileFieldRow
            key={f.key}
            label={f.label}
            value={f.value}
            editable={f.editable}
            pending={f.pendingChange ? { label: t('mobile.profile.pending') } : null}
            onPress={() => handleFieldTap(f)}
          />
        ))}
      </ProfileSection>

      {/* Emergency Contact */}
      <ProfileSection title={t('mobile.profile.emergencyContact')}>
        {emergencyFields.map((f) => (
          <ProfileFieldRow
            key={f.key}
            label={f.label}
            value={f.value}
            editable={f.editable}
            pending={f.pendingChange ? { label: t('mobile.profile.pending') } : null}
            onPress={() => handleFieldTap(f)}
          />
        ))}
      </ProfileSection>

      {/* Experience (read-only) */}
      <ProfileSection title={t('mobile.profile.experience')}>
        {experienceFields.map((f) => (
          <ProfileFieldRow
            key={f.key}
            label={f.label}
            value={f.value}
            editable={false}
          />
        ))}
      </ProfileSection>

      {/* Documents */}
      {documents.length > 0 && (
        <ProfileSection title={t('mobile.profile.documents')}>
          {documents.map((doc, i) => (
            <DocumentRow
              key={doc.id || i}
              doc={doc}
              t={t}
              onPress={handleDocumentTap}
            />
          ))}
        </ProfileSection>
      )}

      {/* Change Request Sheet */}
      <ChangeRequestSheet
        field={activeField}
        onClose={() => setActiveField(null)}
        onSubmit={handleSubmit}
        onCancel={handleCancelRequest}
        t={t}
      />
    </div>
  );
};

export default MobileProfile;
