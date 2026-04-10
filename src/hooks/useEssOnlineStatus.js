import { useState, useEffect } from 'react';

/**
 * useEssOnlineStatus — Task 58
 *
 * Tracks browser online/offline state for the ESS portal.
 * - `isOnline`: current connectivity state
 * - `wasOffline`: true for 5 seconds after transitioning offline → online
 *   (used by EssOfflineBanner to show a "Back online" toast).
 */
export function useEssOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    let resetTimer = null;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Clear the wasOffline flag after 5 seconds
      resetTimer = setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return { isOnline, wasOffline };
}
