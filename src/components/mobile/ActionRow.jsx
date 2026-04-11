/**
 * ActionRow — Task 63 (C.5)
 *
 * Tappable list row for profile sections, settings, and grouped lists.
 * Meets 44px minimum touch height. Keyboard-accessible.
 */
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const ActionRow = ({ icon: Icon, label, value, detail, onPress, chevron = true }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 min-h-[44px] active:bg-[var(--mobile-bg-grouped)] transition-colors duration-150 cursor-pointer"
    onClick={onPress}
    onKeyDown={onPress ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(e); } } : undefined}
    role="button"
    tabIndex={0}
    data-testid="action-row"
  >
    {Icon && <Icon className="h-5 w-5 text-[var(--mobile-tint)] flex-shrink-0" />}
    <div className="flex-1 min-w-0">
      <span className="text-mobile-body text-[var(--mobile-label-primary)]">{label}</span>
      {detail && (
        <span className="block text-mobile-footnote text-[var(--mobile-label-secondary)] truncate">
          {detail}
        </span>
      )}
    </div>
    {value && (
      <span className="text-mobile-body text-[var(--mobile-label-secondary)] flex-shrink-0">
        {value}
      </span>
    )}
    {chevron && (
      <ChevronRightIcon className="h-5 w-5 text-gray-300 flex-shrink-0" />
    )}
  </div>
);

export default ActionRow;
