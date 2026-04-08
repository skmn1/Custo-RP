import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const STORAGE_KEY = 'scheduler.darkMode';

const DarkModeContext = createContext(null);

/**
 * DarkModeProvider — wraps the app and manages dark/light mode state.
 * Default is light mode. Preference is persisted in localStorage.
 * Adds/removes the `dark` class on <html> when toggled.
 */
export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark));
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark((d) => !d), []);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used inside DarkModeProvider');
  return ctx;
}
