import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  MinusCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import OnboardingProgress from './OnboardingProgress';

const CATEGORY_ORDER = ['identity', 'contract', 'hr', 'it', 'safety'];

const STATUS_ICONS = {
  pending:   <MinusCircleIcon className="w-5 h-5 text-gray-400" />,
  completed: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  skipped:   <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />,
  na:        <MinusCircleIcon className="w-5 h-5 text-gray-300" />,
};

export default function OnboardingChecklist({ steps, onUpdateStep }) {
  const { t } = useTranslation('hr');
  const [noteInput, setNoteInput] = useState({});
  const [showNote, setShowNote] = useState({});

  if (!steps || steps.length === 0) {
    return <p className="text-sm text-gray-400">No onboarding steps found.</p>;
  }

  // Group by category
  const grouped = {};
  for (const step of steps) {
    const cat = step.category || 'hr';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(step);
  }

  const handleToggle = (step) => {
    const newStatus = step.status === 'completed' ? 'pending' : 'completed';
    onUpdateStep(step.id, { status: newStatus });
  };

  const handleStatusChange = (step, newStatus) => {
    onUpdateStep(step.id, { status: newStatus });
  };

  const handleNoteSave = (step) => {
    const note = noteInput[step.id] || '';
    onUpdateStep(step.id, { notes: note });
    setShowNote((prev) => ({ ...prev, [step.id]: false }));
  };

  return (
    <div className="space-y-6">
      <OnboardingProgress steps={steps} />

      {CATEGORY_ORDER.map((cat) => {
        const catSteps = grouped[cat];
        if (!catSteps) return null;
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t(`candidates.onboarding.categories.${cat}`, cat)}
            </h4>
            <div className="space-y-2">
              {catSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(step)}
                    className="mt-0.5 flex-shrink-0"
                    title={step.status === 'completed' ? 'Mark pending' : t('candidates.onboarding.step.complete')}
                  >
                    {STATUS_ICONS[step.status] || STATUS_ICONS.pending}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        step.status === 'completed'
                          ? 'text-gray-400 line-through'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {step.name}
                      </span>
                      {step.isRequired && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold">
                          required
                        </span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.description}
                      </p>
                    )}
                    {step.notes && !showNote[step.id] && (
                      <p className="text-xs text-blue-500 mt-1 italic">
                        Note: {step.notes}
                      </p>
                    )}

                    {/* Inline note input */}
                    {showNote[step.id] && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={noteInput[step.id] ?? step.notes ?? ''}
                          onChange={(e) => setNoteInput((prev) => ({ ...prev, [step.id]: e.target.value }))}
                          placeholder="Add note…"
                          className="flex-1 text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={() => handleNoteSave(step)}
                          className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowNote((prev) => ({ ...prev, [step.id]: false }))}
                          className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setShowNote((prev) => ({ ...prev, [step.id]: !prev[step.id] }))}
                      className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title={t('candidates.onboarding.step.addNote')}
                    >
                      <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                    </button>
                    <select
                      value={step.status}
                      onChange={(e) => handleStatusChange(step, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                      <option value="na">N/A</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
