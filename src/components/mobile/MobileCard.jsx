/**
 * MobileCard — Task 63 (C.1) / Task 77 (Nexus Kinetic)
 *
 * Flat card surface for grouped content on mobile viewports.
 * Uses Nexus Kinetic tokens: 24px radius, editorial Magenta shadow.
 * Optional onPress makes it tappable with role="button".
 */

// Standard card — white bg, editorial shadow, Magenta-tinted shadow
const MobileCard = ({ children, active = false, onPress, className = '', testId, ...props }) => (
  <div
    className={`
      bg-surface-container-lowest rounded-3xl shadow-editorial relative overflow-hidden
      ${active ? 'border-l-[6px] border-primary' : ''}
      ${onPress ? 'active:bg-surface-container-low cursor-pointer transition-colors duration-150' : ''}
      ${className}
    `}
    onClick={onPress}
    onKeyDown={onPress ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(e); } } : undefined}
    role={onPress ? 'button' : undefined}
    tabIndex={onPress ? 0 : undefined}
    data-testid={testId}
    {...props}
  >
    {children}
  </div>
);

// Card with gradient left accent bar (shift/alert cards)
export const AccentCard = ({ children, className = '', ...props }) => (
  <div
    className={`relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-editorial ${className}`}
    {...props}
  >
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-secondary-fixed" />
    {children}
  </div>
);

export default MobileCard;
