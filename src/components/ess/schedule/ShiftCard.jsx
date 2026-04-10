import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getShiftColors } from './shiftColors';

/**
 * ShiftCard — read-only shift display card.
 *
 * Rendered inside a day cell in both week and month views.
 * Colour bar on the left edge matches the Planning App scheduler grid.
 * No hover effects suggesting editability, no drag handles, no context menu.
 */
const ShiftCard = ({ shift }) => {
  const { t } = useTranslation('ess');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const colors = getShiftColors(shift.shiftType);

  return (
    <div
      className={`relative rounded-md border ${colors.bg} ${colors.border} overflow-hidden`}
      style={{ cursor: 'default' }}
      data-testid="shift-card"
    >
      {/* Left colour bar — terracotta brand accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
        style={{ backgroundColor: 'var(--mobile-tint)' }}
      />

      <div className="pl-3 pr-2 py-2">
        {/* Time row */}
        <p className={`text-xs font-semibold ${colors.text}`}>
          {shift.startTime} – {shift.endTime}
        </p>

        {/* Duration + type badge */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`text-xs font-medium ${colors.text} opacity-80`}>
            {t('schedule.duration', { hours: shift.duration })}
          </span>
          {shift.shiftType && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
              {shift.shiftType}
            </span>
          )}
        </div>

        {/* Department */}
        {shift.department && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {shift.department}
          </p>
        )}

        {/* Notes — expandable */}
        {shift.notes && (
          <div className="mt-1">
            <button
              type="button"
              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 transition-colors"
              onClick={() => setNotesExpanded(v => !v)}
            >
              {notesExpanded ? '▲' : '▼'} {t('schedule.notes')}
            </button>
            {notesExpanded && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                {shift.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCard;
