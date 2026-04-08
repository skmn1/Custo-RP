import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { usePosTerminal } from '../../hooks/usePosTerminal';

/**
 * Terminal selector dropdown for the PoS sidebar.
 * Shows a compact selector when the user has multiple terminals.
 */
const TerminalSelector = ({ collapsed }) => {
  const { t } = useTranslation(['pos']);
  const { terminalId } = useParams();
  const navigate = useNavigate();
  const { terminals, selectedTerminal } = usePosTerminal();

  if (collapsed || terminals.length <= 1) return null;

  const currentTerminal = terminals.find((t) => String(t.id) === String(terminalId)) || selectedTerminal;

  const handleChange = (e) => {
    const id = e.target.value;
    navigate(`/app/pos/${id}/dashboard`);
  };

  return (
    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
      <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 block">
        {t('pos:terminalSelector.label')}
      </label>
      <div className="relative">
        <select
          value={currentTerminal?.id || ''}
          onChange={handleChange}
          className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          {terminals.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <ChevronUpDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default TerminalSelector;
