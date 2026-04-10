/**
 * useMobileLayout — Task 63 (D.1)
 *
 * Returns true when the viewport is below the mobile breakpoint (1024px).
 * Uses matchMedia (fires only on breakpoint crossing, not every pixel).
 */
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024;

export function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
