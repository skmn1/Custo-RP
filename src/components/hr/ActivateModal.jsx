import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const REQUIRED_DOC_TYPES = ['contract_signed', 'rib', 'social_security'];
const IDENTITY_DOC_TYPES = ['national_id', 'passport'];

export default function ActivateModal({ candidate, steps, documents, onConfirm, onClose }) {
  const { t } = useTranslation('hr');

  // Validate steps
  const requiredSteps = (steps || []).filter((s) => s.isRequired);
  const completedSteps = requiredSteps.filter((s) => s.status === 'completed');
  const stepsOk = completedSteps.length === requiredSteps.length && requiredSteps.length > 0;

  // Validate documents
  const verifiedDocs = (documents || []).filter((d) => d.verifiedAt);
  const verifiedTypes = new Set(verifiedDocs.map((d) => d.documentType));

  const missingDocs = [];
  for (const dt of REQUIRED_DOC_TYPES) {
    if (!verifiedTypes.has(dt)) missingDocs.push(dt);
  }
  const hasIdentity = IDENTITY_DOC_TYPES.some((dt) => verifiedTypes.has(dt));
  if (!hasIdentity) missingDocs.push('national_id or passport');
  const docsOk = missingDocs.length === 0;

  const canActivate = stepsOk && docsOk;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('candidates.activate.modal.title')}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('candidates.activate.modal.body', {
            name: candidate?.fullName,
            email: candidate?.email,
          })}
        </p>

        {/* Validation summary */}
        <div className="space-y-3 mb-6">
          {/* Steps */}
          <div className="flex items-start gap-2">
            {stepsOk ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Onboarding Steps: {completedSteps.length}/{requiredSteps.length} required completed
              </p>
              {!stepsOk && (
                <p className="text-xs text-red-500 mt-0.5">
                  {t('candidates.activate.errors.incompleteSteps')}
                </p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="flex items-start gap-2">
            {docsOk ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Documents: {verifiedDocs.length} verified
              </p>
              {!docsOk && (
                <div className="mt-1">
                  <p className="text-xs text-red-500">
                    {t('candidates.activate.errors.missingDocs')}
                  </p>
                  {missingDocs.map((dt) => (
                    <p key={dt} className="text-xs text-red-400 ml-2">• {dt}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Invitation will be sent to: <strong>{candidate?.email}</strong>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canActivate}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              canActivate
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            }`}
            title={!canActivate ? t('candidates.activate.buttonBlocked') : ''}
          >
            {t('candidates.activate.modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
