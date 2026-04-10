/**
 * ScreenTransition — Task 63 (C.6)
 *
 * Page-level enter animation wrapper. Applies fade + slide-up on mount.
 * Respects prefers-reduced-motion via CSS (animation: none).
 */
const ScreenTransition = ({ children }) => (
  <div className="animate-screen-enter">
    {children}
  </div>
);

export default ScreenTransition;
