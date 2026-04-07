import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { settingsApi } from '../api/settingsApi';
import { useAuth } from './useAuth';

const SettingsContext = createContext(null);

// ── Default values (used before API responds or as fallback) ────────

const APP_DEFAULTS = {
  business: {
    companyName: 'Staff Scheduler Pro',
    timezone: 'America/New_York',
    workWeekStart: 'monday',
    overtimeThreshold: 40,
    overtimeMultiplier: 1.5,
    doubleTimeThreshold: 60,
    doubleTimeMultiplier: 2.0,
    payPeriodType: 'biweekly',
    defaultShiftDuration: 8,
    maxShiftDuration: 12,
    minHoursBetweenShifts: 8,
    ptoAccrualRate: 1.25,
    annualPtoCap: 20,
  },
  scheduling: {
    allowShiftOverlap: false,
    autoAssignColors: true,
    showShiftCosts: true,
    defaultView: 'week',
    enableDragAndDrop: true,
    requireShiftConfirmation: false,
  },
  notifications: {
    emailEnabled: true,
    shiftReminders: true,
    schedulePublishedAlerts: true,
    swapRequests: true,
    timeOffApprovals: true,
    reviewAlerts: true,
    reminderHours: 24,
  },
};

const PREF_DEFAULTS = {
  theme: 'light',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  rowsPerPage: 10,
  compactMode: false,
  sidebarCollapsed: false,
};

// ── Type coercion helpers ───────────────────────────────────────────

const NUMBER_KEYS = new Set([
  'overtimeThreshold', 'overtimeMultiplier', 'doubleTimeThreshold',
  'doubleTimeMultiplier', 'defaultShiftDuration', 'maxShiftDuration',
  'minHoursBetweenShifts', 'ptoAccrualRate', 'annualPtoCap',
  'reminderHours', 'rowsPerPage',
]);

const BOOLEAN_KEYS = new Set([
  'allowShiftOverlap', 'autoAssignColors', 'showShiftCosts',
  'enableDragAndDrop', 'requireShiftConfirmation',
  'emailEnabled', 'shiftReminders', 'schedulePublishedAlerts',
  'swapRequests', 'timeOffApprovals', 'reviewAlerts',
  'compactMode', 'sidebarCollapsed',
]);

function coerce(key, value) {
  if (value === null || value === undefined) return value;
  if (NUMBER_KEYS.has(key)) return Number(value);
  if (BOOLEAN_KEYS.has(key)) {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  }
  return value;
}

function apiListToMap(list) {
  const map = {};
  if (!Array.isArray(list)) return map;
  list.forEach(({ key, value }) => {
    map[key] = coerce(key, value);
  });
  return map;
}

function groupedApiToState(grouped) {
  const state = {};
  Object.entries(grouped).forEach(([category, items]) => {
    state[category] = apiListToMap(items);
  });
  return state;
}

// ── Provider ────────────────────────────────────────────────────────

export function SettingsProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  const [appSettings, setAppSettings] = useState(APP_DEFAULTS);
  const [preferences, setPreferences] = useState(PREF_DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings on mount / auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [settingsData, prefsData] = await Promise.all([
          isAdmin ? settingsApi.getAll() : settingsApi.getPublic(),
          settingsApi.getPreferences(),
        ]);

        if (cancelled) return;

        if (isAdmin && settingsData) {
          setAppSettings((prev) => {
            const fromApi = groupedApiToState(settingsData);
            return {
              business: { ...prev.business, ...fromApi.business },
              scheduling: { ...prev.scheduling, ...fromApi.scheduling },
              notifications: { ...prev.notifications, ...fromApi.notifications },
            };
          });
        } else if (settingsData) {
          // Public settings — flat list
          const pubMap = apiListToMap(settingsData);
          setAppSettings((prev) => ({
            ...prev,
            business: { ...prev.business, ...pubMap },
          }));
        }

        if (prefsData) {
          const prefMap = apiListToMap(prefsData);
          setPreferences((prev) => ({ ...prev, ...prefMap }));
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to load settings, using defaults:', err.message);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, isAdmin]);

  // ── Update helpers ────────────────────────────────────────────────

  const updateAppSettings = useCallback(async (category, updates) => {
    try {
      const payload = Object.entries(updates).map(([key, value]) => ({
        key,
        value: String(value),
        valueType: NUMBER_KEYS.has(key) ? 'number' : BOOLEAN_KEYS.has(key) ? 'boolean' : 'string',
      }));
      const result = await settingsApi.updateCategory(category, payload);
      const updated = apiListToMap(result);
      setAppSettings((prev) => ({
        ...prev,
        [category]: { ...prev[category], ...updated },
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resetAppSettings = useCallback(async (category) => {
    try {
      const result = await settingsApi.resetCategory(category);
      const updated = apiListToMap(result);
      setAppSettings((prev) => ({
        ...prev,
        [category]: { ...APP_DEFAULTS[category], ...updated },
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updatePreferences = useCallback(async (updates) => {
    try {
      const payload = Object.entries(updates).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      const result = await settingsApi.updatePreferences(payload);
      const updated = apiListToMap(result);
      setPreferences((prev) => ({ ...prev, ...updated }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resetPreferences = useCallback(async () => {
    try {
      const result = await settingsApi.resetPreferences();
      const updated = apiListToMap(result);
      setPreferences({ ...PREF_DEFAULTS, ...updated });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Convenience accessors ─────────────────────────────────────────

  const settings = useMemo(() => ({
    ...appSettings,
    display: preferences,
  }), [appSettings, preferences]);

  const value = useMemo(() => ({
    settings,
    appSettings,
    preferences,
    isLoading,
    error,
    updateAppSettings,
    resetAppSettings,
    updatePreferences,
    resetPreferences,
  }), [settings, appSettings, preferences, isLoading, error,
    updateAppSettings, resetAppSettings, updatePreferences, resetPreferences]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Fallback when used outside provider (shouldn't happen but safety)
    return {
      settings: { ...APP_DEFAULTS, display: PREF_DEFAULTS },
      appSettings: APP_DEFAULTS,
      preferences: PREF_DEFAULTS,
      isLoading: false,
      error: null,
      updateAppSettings: async () => {},
      resetAppSettings: async () => {},
      updatePreferences: async () => {},
      resetPreferences: async () => {},
    };
  }
  return ctx;
}

export default useSettings;
