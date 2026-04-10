/**
 * MobileCard — Task 63 (C.1)
 *
 * Flat card surface for grouped content on mobile viewports.
 * Uses --mobile-bg-elevated for dark-mode lift.
 * Optional onPress makes it tappable with role="button".
 */
const MobileCard = ({ children, onPress, className = '', testId }) => (
  <div
    className={`bg-[var(--mobile-bg-elevated)] rounded-xl px-4 py-3 ${
      onPress
        ? 'active:bg-gray-100 dark:active:bg-gray-800 cursor-pointer transition-colors duration-150'
        : ''
    } ${className}`}
    onClick={onPress}
    onKeyDown={onPress ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(e); } } : undefined}
    role={onPress ? 'button' : undefined}
    tabIndex={onPress ? 0 : undefined}
    data-testid={testId}
  >
    {children}
  </div>
);

export default MobileCard;
