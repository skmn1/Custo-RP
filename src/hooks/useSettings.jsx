import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { settingsApi } from '../api/settingsApi';
import { useAuth } from './useAuth';

const SettingsContext = createContext(null);

// ── Default values (used before API responds or as fallback) ────────

const APP_DEFAULTS = {
  general: {
    companyName: 'Staff Scheduler Pro',
    timezone: 'America/New_York',
    workWeekStart: 'monday',
    dateFormat: 'yyyy-MM-dd',
    timeFormat: '24h',
    currency: 'CAD',
    fiscalYearStart: '1',
  },
  scheduling: {
    defaultView: 'week',
    defaultShiftDuration: 8,
    maxShiftDuration: 12,
    minHoursBetweenShifts: 8,
    allowOverlap: false,
    autoAssignColors: true,
    showCostOnCards: true,
    enableDragDrop: true,
    requireConfirmation: false,
    maxShiftsPerDay: 3,
  },
  payroll: {
    payPeriodType: 'biweekly',
    payDayOfWeek: 'friday',
    payDayOfMonth: 15,
    overtimeThreshold: 40,
    overtimeMultiplier: 1.5,
    dailyOvertimeThreshold: 0,
    doubleTimeThreshold: 60,
    doubleTimeMultiplier: 2.0,
    autoApproveTimesheets: false,
    roundClockEntries: 0,
    showGrossPay: true,
  },
  timeOff: {
    ptoAccrualRate: 1.25,
    annualPtoCap: 20,
    requireApproval: true,
    maxConsecutiveDays: 15,
    blackoutDatesEnabled: false,
    minNoticeDays: 7,
    carryOverLimit: 5,
  },
  swaps: {
    swapRequireApproval: true,
    swapWindowHours: 24,
    maxSwapsPerMonth: 4,
    allowCrossDepartment: false,
    notifyManager: true,
  },
  notifications: {
    emailEnabled: true,
    shiftAssignment: true,
    schedulePublished: true,
    swapRequests: true,
    timeOffDecision: true,
    performanceReviews: true,
    reminderLeadTime: 24,
    digestFrequency: 'none',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  },
  featureFlags: {
    enablePayroll: true,
    enableTimeOff: true,
    enableShiftSwaps: true,
    enableReports: true,
    enableDashboard: true,
    enablePOS: true,
    enableNotifications: true,
    enableMobile: false,
    enableAuditLog: false,
    enableBetaFeatures: false,
  },
  security: {
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: false,
    passwordExpiryDays: 0,
    twoFactorEnabled: false,
    ipWhitelistEnabled: false,
    auditLogRetentionDays: 365,
    forcePasswordChangeOnFirstLogin: true,
  },
  dataPrivacy: {
    dataRetentionDays: 730,
    anonymizeAfterTermination: true,
    exportFormat: 'csv',
    allowSelfDataExport: true,
    cookieConsentRequired: false,
    privacyPolicyUrl: '',
  },
};

const PREF_DEFAULTS = {
  theme: 'light',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  rowsPerPage: 10,
  compactMode: false,
  sidebarCollapsed: false,
  animateTransitions: true,
  reducedMotion: false,
  fontSize: 'medium',
  highContrast: false,
  focusRingAlwaysVisible: false,
  myShiftAssignment: true,
  mySchedulePublished: true,
  mySwapRequests: true,
  myTimeOffDecision: true,
  myPerformanceReviews: true,
};

// ── Type coercion helpers ───────────────────────────────────────────

const NUMBER_KEYS = new Set([
  'overtimeThreshold', 'overtimeMultiplier', 'doubleTimeThreshold',
  'doubleTimeMultiplier', 'dailyOvertimeThreshold',
  'defaultShiftDuration', 'maxShiftDuration', 'minHoursBetweenShifts',
  'maxShiftsPerDay',
  'ptoAccrualRate', 'annualPtoCap', 'maxConsecutiveDays', 'minNoticeDays', 'carryOverLimit',
  'swapWindowHours', 'maxSwapsPerMonth',
  'reminderLeadTime', 'rowsPerPage',
  'payDayOfMonth', 'roundClockEntries',
  'sessionTimeoutMinutes', 'maxLoginAttempts', 'lockoutDurationMinutes',
  'passwordMinLength', 'passwordExpiryDays', 'auditLogRetentionDays',
  'dataRetentionDays', 'fiscalYearStart',
]);

const BOOLEAN_KEYS = new Set([
  'allowOverlap', 'autoAssignColors', 'showCostOnCards',
  'enableDragDrop', 'requireConfirmation',
  'autoApproveTimesheets', 'showGrossPay',
  'requireApproval', 'blackoutDatesEnabled',
  'swapRequireApproval', 'allowCrossDepartment', 'notifyManager',
  'emailEnabled', 'shiftAssignment', 'schedulePublished',
  'swapRequests', 'timeOffDecision', 'performanceReviews',
  'enablePayroll', 'enableTimeOff', 'enableShiftSwaps',
  'enableReports', 'enableDashboard', 'enablePOS',
  'enableNotifications', 'enableMobile', 'enableAuditLog', 'enableBetaFeatures',
  'passwordRequireUppercase', 'passwordRequireNumbers', 'passwordRequireSpecial',
  'twoFactorEnabled', 'ipWhitelistEnabled', 'forcePasswordChangeOnFirstLogin',
  'anonymizeAfterTermination', 'allowSelfDataExport', 'cookieConsentRequired',
  'compactMode', 'sidebarCollapsed', 'animateTransitions',
  'reducedMotion', 'highContrast', 'focusRingAlwaysVisible',
  'myShiftAssignment', 'mySchedulePublished', 'mySwapRequests',
  'myTimeOffDecision', 'myPerformanceReviews',
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
  list.forEach(({ key, value }) => { map[key] = coerce(key, value); });
  return map;
}

function groupedApiToState(grouped) {
  const state = {};
  Object.entries(grouped).forEach(([category, items]) => {
    state[category] = apiListToMap(items);
  });
  return state;
}

// All backend categories
const ALL_CATEGORIES = [
  'general', 'scheduling', 'payroll', 'timeOff', 'swaps',
  'notifications', 'featureFlags', 'security', 'dataPrivacy',
];

// ── Provider ────────────────────────────────────────────────────────

export function SettingsProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  const [appSettings, setAppSettings] = useState(APP_DEFAULTS);
  const [preferences, setPreferences] = useState(PREF_DEFAULTS);
  const [navItems, setNavItems] = useState([]);
  const [featureFlags, setFeatureFlags] = useState(APP_DEFAULTS.featureFlags);
  const [departments, setDepartments] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
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
        const promises = [
          isAdmin ? settingsApi.getAll() : settingsApi.getPublic(),
          settingsApi.getPreferences(),
          settingsApi.getFeatureFlags(),
          settingsApi.getNavItems(),
        ];
        if (isAdmin) {
          promises.push(settingsApi.getDepartments(), settingsApi.getShiftTypes());
        }

        const results = await Promise.all(promises);
        if (cancelled) return;

        const [settingsData, prefsData, flagsData, navData] = results;

        if (isAdmin && settingsData) {
          const fromApi = groupedApiToState(settingsData);
          setAppSettings((prev) => {
            const merged = { ...prev };
            ALL_CATEGORIES.forEach((cat) => {
              if (fromApi[cat]) {
                merged[cat] = { ...prev[cat], ...fromApi[cat] };
              }
            });
            return merged;
          });
        } else if (settingsData) {
          const pubMap = apiListToMap(settingsData);
          setAppSettings((prev) => ({
            ...prev,
            general: { ...prev.general, ...pubMap },
          }));
        }

        if (prefsData) {
          const prefMap = apiListToMap(prefsData);
          setPreferences((prev) => ({ ...prev, ...prefMap }));
        }

        if (flagsData) setFeatureFlags(flagsData);
        if (navData) setNavItems(navData);
        if (isAdmin && results[4]) setDepartments(results[4]);
        if (isAdmin && results[5]) setShiftTypes(results[5]);
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
      // If featureFlags category was updated, also update the separate flags state
      if (category === 'featureFlags') {
        const flags = {};
        Object.entries(updated).forEach(([k, v]) => { flags[k] = Boolean(v); });
        setFeatureFlags((prev) => ({ ...prev, ...flags }));
      }
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
        key, value: String(value),
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

  // ── Nav Items ─────────────────────────────────────────────────────

  const saveNavItems = useCallback(async (items) => {
    try {
      const result = await settingsApi.saveNavItems(items);
      setNavItems(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Departments CRUD ──────────────────────────────────────────────

  const createDepartment = useCallback(async (dept) => {
    const result = await settingsApi.createDepartment(dept);
    setDepartments((prev) => [...prev, result]);
    return result;
  }, []);

  const updateDepartment = useCallback(async (id, dept) => {
    const result = await settingsApi.updateDepartment(id, dept);
    setDepartments((prev) => prev.map((d) => (d.id === id ? result : d)));
    return result;
  }, []);

  const deleteDepartment = useCallback(async (id) => {
    await settingsApi.deleteDepartment(id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Shift Types CRUD ──────────────────────────────────────────────

  const createShiftType = useCallback(async (st) => {
    const result = await settingsApi.createShiftType(st);
    setShiftTypes((prev) => [...prev, result]);
    return result;
  }, []);

  const updateShiftType = useCallback(async (id, st) => {
    const result = await settingsApi.updateShiftType(id, st);
    setShiftTypes((prev) => prev.map((s) => (s.id === id ? result : s)));
    return result;
  }, []);

  const deleteShiftType = useCallback(async (id) => {
    await settingsApi.deleteShiftType(id);
    setShiftTypes((prev) => prev.filter((s) => s.id !== id));
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
    navItems,
    featureFlags,
    departments,
    shiftTypes,
    isLoading,
    error,
    updateAppSettings,
    resetAppSettings,
    updatePreferences,
    resetPreferences,
    saveNavItems,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createShiftType,
    updateShiftType,
    deleteShiftType,
  }), [settings, appSettings, preferences, navItems, featureFlags, departments, shiftTypes,
    isLoading, error, updateAppSettings, resetAppSettings, updatePreferences, resetPreferences,
    saveNavItems, createDepartment, updateDepartment, deleteDepartment,
    createShiftType, updateShiftType, deleteShiftType]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: { ...APP_DEFAULTS, display: PREF_DEFAULTS },
      appSettings: APP_DEFAULTS,
      preferences: PREF_DEFAULTS,
      navItems: [],
      featureFlags: APP_DEFAULTS.featureFlags,
      departments: [],
      shiftTypes: [],
      isLoading: false,
      error: null,
      updateAppSettings: async () => {},
      resetAppSettings: async () => {},
      updatePreferences: async () => {},
      resetPreferences: async () => {},
      saveNavItems: async () => {},
      createDepartment: async () => {},
      updateDepartment: async () => {},
      deleteDepartment: async () => {},
      createShiftType: async () => {},
      updateShiftType: async () => {},
      deleteShiftType: async () => {},
    };
  }
  return ctx;
}
