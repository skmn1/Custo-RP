import { createContext, useContext } from 'react';
import { useEssOnlineStatus } from '../hooks/useEssOnlineStatus';

/**
 * EssConnectivityContext — Task 58
 *
 * Provides `{ isOnline, wasOffline }` to all ESS component subtrees
 * without prop drilling.
 *
 * Usage:
 *   const { isOnline, wasOffline } = useEssConnectivity();
 */
const EssConnectivityContext = createContext({ isOnline: true, wasOffline: false });

export function EssConnectivityProvider({ children }) {
  const status = useEssOnlineStatus();
  return (
    <EssConnectivityContext.Provider value={status}>
      {children}
    </EssConnectivityContext.Provider>
  );
}

export function useEssConnectivity() {
  return useContext(EssConnectivityContext);
}
