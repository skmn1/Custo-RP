import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useCandidate } from '../../hooks/useCandidates';
import CandidateStatusBadge from '../../components/hr/CandidateStatusBadge';
import OnboardingChecklist from '../../components/hr/OnboardingChecklist';
import OnboardingProgress from '../../components/hr/OnboardingProgress';
import DocumentVault from '../../components/hr/DocumentVault';
import ActivateModal from '../../components/hr/ActivateModal';

const TABS = ['info', 'onboarding', 'documents'];

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatCurrency(val) {
  if (val == null) return '–';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

const CandidateDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation('hr');
  const navigate = useNavigate();
  const {
    candidate, loading, error, refresh,
    updateStep, uploadDocument, verifyDocument, deleteDocument,
    activate, resendInvite, updateStatus, rejectCandidate,
  } = useCandidate(id);

  const [tab, setTab] = useState('info');
  const [showActivate, setShowActivate] = useState(false);
  const [activating, setActivating] = useState(false);
  const [toast, setToast] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-6 text-center text-red-500">
        {error || 'Candidate not found'}
      </div>
    );
  }

  const steps = candidate.steps || [];
  const documents = candidate.documents || [];

  const requiredSteps = steps.filter((s) => s.isRequired);
  const completedRequired = requiredSteps.filter((s) => s.status === 'completed');
  const canActivate = completedRequired.length === requiredSteps.length && requiredSteps.length > 0;

  const handleActivate = async () => {
    setActivating(true);
    try {
      const result = await activate();
      setShowActivate(false);
      setToast(t('candidates.activate.success', { email: candidate.email }));
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setActivating(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendInvite();
      setToast('Invitation re-sent to ' + candidate.email);
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleStatusAdvance = async (newStatus) => {
    try {
      await updateStatus(newStatus);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    try {
      await rejectCandidate();
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-gray-900 text-white text-sm shadow-lg max-w-sm">
          {toast}
        </div>
      )}

      {/* Back + Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/app/hr/candidates')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {candidate.fullName}
            </h1>
            <CandidateStatusBadge status={candidate.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {candidate.positionTitle} · {candidate.email}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {candidate.status === 'activated' && (
            <button
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
              {t('candidates.invite.resend')}
            </button>
          )}
          {candidate.status !== 'activated' && candidate.status !== 'rejected' && candidate.status !== 'archived' && (
            <>
              <button
                onClick={() => setShowActivate(true)}
                disabled={!canActivate}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  canActivate
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                }`}
                title={!canActivate ? t('candidates.activate.buttonBlocked') : ''}
              >
                {t('candidates.activate.button')}
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {t === 'info' && <UserCircleIcon className="w-3.5 h-3.5 inline mr-1" />}
            {t === 'onboarding' && <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 inline mr-1" />}
            {t === 'documents' && <FolderIcon className="w-3.5 h-3.5 inline mr-1" />}
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && <InfoTab candidate={candidate} onStatusAdvance={handleStatusAdvance} t={t} />}
      {tab === 'onboarding' && (
        <OnboardingChecklist steps={steps} onUpdateStep={updateStep} />
      )}
      {tab === 'documents' && (
        <DocumentVault
          candidateId={id}
          documents={documents}
          onUpload={uploadDocument}
          onVerify={verifyDocument}
          onDelete={deleteDocument}
        />
      )}

      {/* Activation modal */}
      {showActivate && (
        <ActivateModal
          candidate={candidate}
          steps={steps}
          documents={documents}
          onConfirm={handleActivate}
          onClose={() => setShowActivate(false)}
        />
      )}
    </div>
  );
};

function InfoTab({ candidate, onStatusAdvance, t }) {
  const PIPELINE = ['new', 'invited', 'documents_pending', 'under_review', 'approved', 'activated'];
  const currentIdx = PIPELINE.indexOf(candidate.status);

  return (
    <div className="space-y-6">
      {/* Status pipeline */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Status Pipeline
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {PIPELINE.map((status, idx) => (
            <React.Fragment key={status}>
              {idx > 0 && (
                <div className={`h-0.5 w-6 flex-shrink-0 ${idx <= currentIdx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
              <button
                onClick={() => {
                  if (status !== 'activated' && status !== candidate.status) {
                    onStatusAdvance(status);
                  }
                }}
                disabled={status === 'activated'}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  status === candidate.status
                    ? 'bg-green-600 text-white'
                    : idx < currentIdx
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t(`candidates.status.${status}`, status)}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal information */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Personal Information
          </h3>
          <dl className="space-y-2.5 text-sm">
            <InfoRow label={t('candidates.fields.firstName')} value={candidate.firstName} />
            <InfoRow label={t('candidates.fields.lastName')} value={candidate.lastName} />
            <InfoRow label={t('candidates.fields.email')} value={candidate.email} />
            <InfoRow label={t('candidates.fields.phone')} value={candidate.phone} />
          </dl>
        </div>

        {/* Contract details */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Contract Details
          </h3>
          <dl className="space-y-2.5 text-sm">
            <InfoRow label={t('candidates.fields.positionTitle')} value={candidate.positionTitle} />
            <InfoRow label={t('candidates.fields.department')} value={candidate.department} />
            <InfoRow
              label={t('candidates.fields.contractType')}
              value={t(`candidates.contractTypes.${candidate.contractType}`, candidate.contractType)}
            />
            <InfoRow label={t('candidates.fields.plannedStartDate')} value={formatDate(candidate.plannedStartDate)} />
            <InfoRow label={t('candidates.fields.grossSalary')} value={formatCurrency(candidate.grossSalary)} />
            <InfoRow label={t('candidates.fields.probationEndDate')} value={formatDate(candidate.probationEndDate)} />
          </dl>
        </div>
      </div>

      {/* Notes */}
      {candidate.notes && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {t('candidates.fields.notes')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {candidate.notes}
          </p>
        </div>
      )}

      {/* Onboarding progress summary */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Onboarding Progress
        </h3>
        <OnboardingProgress steps={candidate.steps || []} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-900 dark:text-gray-100">{value || '–'}</dd>
    </div>
  );
}

export default CandidateDetailPage;
