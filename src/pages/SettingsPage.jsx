import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import useLocale from '../hooks/useLocale';

// ── Reusable Setting Input Components ──────────────────────────────

const SettingToggle = ({ label, description, value, onChange, disabled }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        value ? 'bg-indigo-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const SettingSelect = ({ label, value, onChange, options, disabled }) => (
  <div className="py-3">
    <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const SettingNumber = ({ label, value, onChange, min, max, step = 1, disabled }) => (
  <div className="py-3">
    <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    />
  </div>
);

const SettingText = ({ label, value, onChange, disabled }) => (
  <div className="py-3">
    <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    />
  </div>
);

const SettingGroup = ({ title, children }) => (
  <div className="border-b border-gray-100 last:border-b-0 pb-4 mb-4 last:pb-0 last:mb-0">
    {title && <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>}
    {children}
  </div>
);

// ── Unsaved Changes Modal ──────────────────────────────────────────

const UnsavedChangesModal = ({ isOpen, onSave, onDiscard, onCancel, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('settings:unsavedChanges.title')}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {t('settings:unsavedChanges.message')}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('settings:unsavedChanges.cancel')}
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            {t('settings:unsavedChanges.discard')}
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t('settings:unsavedChanges.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Section Action Bar ─────────────────────────────────────────────

const SectionActions = ({ hasChanges, onSave, onReset, saving, t }) => (
  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
    <button
      type="button"
      onClick={onReset}
      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      {t('settings:actions.resetSection')}
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={!hasChanges || saving}
      className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
        hasChanges && !saving
          ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm'
          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
      }`}
    >
      {saving ? t('settings:actions.saving') : t('settings:actions.saveChanges')}
    </button>
  </div>
);

// ── Category Icons ─────────────────────────────────────────────────

const CATEGORY_ICONS = {
  business: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  scheduling: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  display: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

// ── Main Page Component ────────────────────────────────────────────

const SettingsPage = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { isAdmin, isManager } = useAuth();
  const { language, setLocale } = useLocale();
  const {
    appSettings,
    preferences,
    updateAppSettings,
    resetAppSettings,
    updatePreferences,
    resetPreferences,
    isLoading: settingsLoading,
  } = useSettings();

  // Local draft state for each category
  const [businessDraft, setBusinessDraft] = useState({});
  const [schedulingDraft, setSchedulingDraft] = useState({});
  const [notificationsDraft, setNotificationsDraft] = useState({});
  const [displayDraft, setDisplayDraft] = useState({});

  const [activeCategory, setActiveCategory] = useState(isAdmin ? 'business' : 'display');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingCategoryRef = useRef(null);

  // Sync drafts when settings load
  useEffect(() => {
    setBusinessDraft(appSettings.business);
    setSchedulingDraft(appSettings.scheduling);
    setNotificationsDraft(appSettings.notifications);
  }, [appSettings]);

  useEffect(() => {
    setDisplayDraft(preferences);
  }, [preferences]);

  // Draft setters map
  const drafts = {
    business: businessDraft,
    scheduling: schedulingDraft,
    notifications: notificationsDraft,
    display: displayDraft,
  };

  const setDraft = {
    business: setBusinessDraft,
    scheduling: setSchedulingDraft,
    notifications: setNotificationsDraft,
    display: setDisplayDraft,
  };

  const originals = {
    business: appSettings.business,
    scheduling: appSettings.scheduling,
    notifications: appSettings.notifications,
    display: preferences,
  };

  // Check if current category has unsaved changes
  const hasChanges = useCallback((category) => {
    const draft = drafts[category];
    const original = originals[category];
    if (!draft || !original) return false;
    return Object.keys(draft).some((k) => String(draft[k]) !== String(original[k]));
  }, [businessDraft, schedulingDraft, notificationsDraft, displayDraft, appSettings, preferences]);

  const updateDraftField = (category, key, value) => {
    setDraft[category]((prev) => ({ ...prev, [key]: value }));
  };

  // ── Save / Reset handlers ─────────────────────────────────────────

  const saveCategory = useCallback(async (category) => {
    setSaving(true);
    setSaveMessage('');
    try {
      const draft = drafts[category];
      const original = originals[category];
      const changed = {};
      Object.keys(draft).forEach((k) => {
        if (String(draft[k]) !== String(original[k])) {
          changed[k] = draft[k];
        }
      });
      if (Object.keys(changed).length === 0) return;

      if (category === 'display') {
        await updatePreferences(changed);
      } else {
        await updateAppSettings(category, changed);
      }
      setSaveMessage(t('settings:actions.saved'));
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Error saving');
    } finally {
      setSaving(false);
    }
  }, [businessDraft, schedulingDraft, notificationsDraft, displayDraft, appSettings, preferences, updateAppSettings, updatePreferences, t]);

  const resetCategory = useCallback(async (category) => {
    if (!window.confirm(t('settings:actions.resetConfirm'))) return;
    setSaving(true);
    try {
      if (category === 'display') {
        await resetPreferences();
      } else {
        await resetAppSettings(category);
      }
      setSaveMessage(t('settings:actions.saved'));
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Error resetting');
    } finally {
      setSaving(false);
    }
  }, [resetAppSettings, resetPreferences, t]);

  // ── Unsaved changes navigation guard ──────────────────────────────

  const tryChangeCategory = (newCategory) => {
    if (hasChanges(activeCategory)) {
      pendingCategoryRef.current = newCategory;
      setShowUnsavedModal(true);
    } else {
      setActiveCategory(newCategory);
    }
  };

  const handleSaveAndLeave = async () => {
    await saveCategory(activeCategory);
    setShowUnsavedModal(false);
    if (pendingCategoryRef.current) {
      setActiveCategory(pendingCategoryRef.current);
      pendingCategoryRef.current = null;
    }
  };

  const handleDiscard = () => {
    // Revert draft
    setDraft[activeCategory](originals[activeCategory]);
    setShowUnsavedModal(false);
    if (pendingCategoryRef.current) {
      setActiveCategory(pendingCategoryRef.current);
      pendingCategoryRef.current = null;
    }
  };

  // ── Category list ─────────────────────────────────────────────────

  const categories = [];
  if (isAdmin) {
    categories.push(
      { id: 'business', labelKey: 'settings:category.business' },
      { id: 'scheduling', labelKey: 'settings:category.scheduling' },
    );
  } else if (isManager) {
    categories.push(
      { id: 'scheduling', labelKey: 'settings:category.scheduling' },
    );
  }
  categories.push(
    { id: 'notifications', labelKey: 'settings:category.notifications' },
    { id: 'display', labelKey: 'settings:category.display' },
  );

  // ── Section renderers ─────────────────────────────────────────────

  const renderBusiness = () => (
    <div>
      <SettingGroup>
        <SettingText
          label={t('settings:business.companyName')}
          value={businessDraft.companyName || ''}
          onChange={(v) => updateDraftField('business', 'companyName', v)}
        />
        <SettingSelect
          label={t('settings:business.timezone')}
          value={businessDraft.timezone || 'America/New_York'}
          onChange={(v) => updateDraftField('business', 'timezone', v)}
          options={[
            { value: 'America/New_York', label: 'Eastern (America/New_York)' },
            { value: 'America/Chicago', label: 'Central (America/Chicago)' },
            { value: 'America/Denver', label: 'Mountain (America/Denver)' },
            { value: 'America/Los_Angeles', label: 'Pacific (America/Los_Angeles)' },
            { value: 'America/Toronto', label: 'Toronto (America/Toronto)' },
            { value: 'America/Montreal', label: 'Montreal (America/Montreal)' },
            { value: 'Europe/London', label: 'London (Europe/London)' },
            { value: 'Europe/Paris', label: 'Paris (Europe/Paris)' },
            { value: 'UTC', label: 'UTC' },
          ]}
        />
        <SettingSelect
          label={t('settings:business.workWeekStart')}
          value={businessDraft.workWeekStart || 'monday'}
          onChange={(v) => updateDraftField('business', 'workWeekStart', v)}
          options={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => ({
            value: d,
            label: t(`settings:weekDays.${d}`),
          }))}
        />
      </SettingGroup>

      <SettingGroup title={t('settings:business.overtimeThreshold')?.split('(')[0]?.trim()}>
        <SettingNumber
          label={t('settings:business.overtimeThreshold')}
          value={businessDraft.overtimeThreshold ?? 40}
          onChange={(v) => updateDraftField('business', 'overtimeThreshold', v)}
          min={0} max={168} step={1}
        />
        <SettingNumber
          label={t('settings:business.overtimeMultiplier')}
          value={businessDraft.overtimeMultiplier ?? 1.5}
          onChange={(v) => updateDraftField('business', 'overtimeMultiplier', v)}
          min={1} max={5} step={0.1}
        />
        <SettingNumber
          label={t('settings:business.doubleTimeThreshold')}
          value={businessDraft.doubleTimeThreshold ?? 60}
          onChange={(v) => updateDraftField('business', 'doubleTimeThreshold', v)}
          min={0} max={168} step={1}
        />
        <SettingNumber
          label={t('settings:business.doubleTimeMultiplier')}
          value={businessDraft.doubleTimeMultiplier ?? 2.0}
          onChange={(v) => updateDraftField('business', 'doubleTimeMultiplier', v)}
          min={1} max={5} step={0.1}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingSelect
          label={t('settings:business.payPeriodType')}
          value={businessDraft.payPeriodType || 'biweekly'}
          onChange={(v) => updateDraftField('business', 'payPeriodType', v)}
          options={[
            { value: 'weekly', label: t('settings:business.payPeriodType_weekly') },
            { value: 'biweekly', label: t('settings:business.payPeriodType_biweekly') },
            { value: 'semiMonthly', label: t('settings:business.payPeriodType_semiMonthly') },
            { value: 'monthly', label: t('settings:business.payPeriodType_monthly') },
          ]}
        />
        <SettingNumber
          label={t('settings:business.defaultShiftDuration')}
          value={businessDraft.defaultShiftDuration ?? 8}
          onChange={(v) => updateDraftField('business', 'defaultShiftDuration', v)}
          min={1} max={24} step={0.5}
        />
        <SettingNumber
          label={t('settings:business.maxShiftDuration')}
          value={businessDraft.maxShiftDuration ?? 12}
          onChange={(v) => updateDraftField('business', 'maxShiftDuration', v)}
          min={1} max={24} step={0.5}
        />
        <SettingNumber
          label={t('settings:business.minHoursBetweenShifts')}
          value={businessDraft.minHoursBetweenShifts ?? 8}
          onChange={(v) => updateDraftField('business', 'minHoursBetweenShifts', v)}
          min={0} max={48} step={1}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingNumber
          label={t('settings:business.ptoAccrualRate')}
          value={businessDraft.ptoAccrualRate ?? 1.25}
          onChange={(v) => updateDraftField('business', 'ptoAccrualRate', v)}
          min={0} max={10} step={0.25}
        />
        <SettingNumber
          label={t('settings:business.annualPtoCap')}
          value={businessDraft.annualPtoCap ?? 20}
          onChange={(v) => updateDraftField('business', 'annualPtoCap', v)}
          min={0} max={365} step={1}
        />
      </SettingGroup>

      <SectionActions
        hasChanges={hasChanges('business')}
        onSave={() => saveCategory('business')}
        onReset={() => resetCategory('business')}
        saving={saving}
        t={t}
      />
    </div>
  );

  const renderScheduling = () => (
    <div>
      <SettingGroup>
        <SettingToggle
          label={t('settings:scheduling.allowShiftOverlap')}
          description={t('settings:scheduling.allowShiftOverlap_desc')}
          value={schedulingDraft.allowShiftOverlap ?? false}
          onChange={(v) => updateDraftField('scheduling', 'allowShiftOverlap', v)}
        />
        <SettingToggle
          label={t('settings:scheduling.autoAssignColors')}
          description={t('settings:scheduling.autoAssignColors_desc')}
          value={schedulingDraft.autoAssignColors ?? true}
          onChange={(v) => updateDraftField('scheduling', 'autoAssignColors', v)}
        />
        <SettingToggle
          label={t('settings:scheduling.showShiftCosts')}
          description={t('settings:scheduling.showShiftCosts_desc')}
          value={schedulingDraft.showShiftCosts ?? true}
          onChange={(v) => updateDraftField('scheduling', 'showShiftCosts', v)}
        />
        <SettingToggle
          label={t('settings:scheduling.enableDragAndDrop')}
          description={t('settings:scheduling.enableDragAndDrop_desc')}
          value={schedulingDraft.enableDragAndDrop ?? true}
          onChange={(v) => updateDraftField('scheduling', 'enableDragAndDrop', v)}
        />
        <SettingToggle
          label={t('settings:scheduling.requireShiftConfirmation')}
          description={t('settings:scheduling.requireShiftConfirmation_desc')}
          value={schedulingDraft.requireShiftConfirmation ?? false}
          onChange={(v) => updateDraftField('scheduling', 'requireShiftConfirmation', v)}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingSelect
          label={t('settings:scheduling.defaultView')}
          value={schedulingDraft.defaultView || 'week'}
          onChange={(v) => updateDraftField('scheduling', 'defaultView', v)}
          options={[
            { value: 'day', label: t('settings:scheduling.defaultView_day') },
            { value: 'week', label: t('settings:scheduling.defaultView_week') },
            { value: 'month', label: t('settings:scheduling.defaultView_month') },
          ]}
        />
      </SettingGroup>

      <SectionActions
        hasChanges={hasChanges('scheduling')}
        onSave={() => saveCategory('scheduling')}
        onReset={() => resetCategory('scheduling')}
        saving={saving}
        t={t}
      />
    </div>
  );

  const renderNotifications = () => (
    <div>
      <SettingGroup>
        <SettingToggle
          label={t('settings:notifications.emailEnabled')}
          value={notificationsDraft.emailEnabled ?? true}
          onChange={(v) => updateDraftField('notifications', 'emailEnabled', v)}
        />
        <SettingToggle
          label={t('settings:notifications.shiftReminders')}
          value={notificationsDraft.shiftReminders ?? true}
          onChange={(v) => updateDraftField('notifications', 'shiftReminders', v)}
        />
        <SettingToggle
          label={t('settings:notifications.schedulePublishedAlerts')}
          value={notificationsDraft.schedulePublishedAlerts ?? true}
          onChange={(v) => updateDraftField('notifications', 'schedulePublishedAlerts', v)}
        />
        <SettingToggle
          label={t('settings:notifications.swapRequests')}
          value={notificationsDraft.swapRequests ?? true}
          onChange={(v) => updateDraftField('notifications', 'swapRequests', v)}
        />
        <SettingToggle
          label={t('settings:notifications.timeOffApprovals')}
          value={notificationsDraft.timeOffApprovals ?? true}
          onChange={(v) => updateDraftField('notifications', 'timeOffApprovals', v)}
        />
        <SettingToggle
          label={t('settings:notifications.reviewAlerts')}
          value={notificationsDraft.reviewAlerts ?? true}
          onChange={(v) => updateDraftField('notifications', 'reviewAlerts', v)}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingNumber
          label={t('settings:notifications.reminderHours')}
          value={notificationsDraft.reminderHours ?? 24}
          onChange={(v) => updateDraftField('notifications', 'reminderHours', v)}
          min={1} max={72} step={1}
        />
      </SettingGroup>

      <SectionActions
        hasChanges={hasChanges('notifications')}
        onSave={() => saveCategory('notifications')}
        onReset={() => resetCategory('notifications')}
        saving={saving}
        t={t}
      />
    </div>
  );

  const renderDisplay = () => (
    <div>
      <SettingGroup>
        <SettingSelect
          label={t('settings:display.theme')}
          value={displayDraft.theme || 'light'}
          onChange={(v) => updateDraftField('display', 'theme', v)}
          options={[
            { value: 'light', label: t('settings:display.theme_light') },
            { value: 'dark', label: t('settings:display.theme_dark') },
            { value: 'system', label: t('settings:display.theme_system') },
          ]}
        />
        <div className="py-3">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {t('settings:display.language')}
          </label>
          <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale('fr')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                language === 'fr' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Français
            </button>
          </div>
        </div>
      </SettingGroup>

      <SettingGroup>
        <SettingSelect
          label={t('settings:display.dateFormat')}
          value={displayDraft.dateFormat || 'MM/dd/yyyy'}
          onChange={(v) => updateDraftField('display', 'dateFormat', v)}
          options={[
            { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
            { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
            { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
          ]}
        />
        <SettingSelect
          label={t('settings:display.timeFormat')}
          value={displayDraft.timeFormat || '12h'}
          onChange={(v) => updateDraftField('display', 'timeFormat', v)}
          options={[
            { value: '12h', label: t('settings:display.timeFormat_12h') },
            { value: '24h', label: t('settings:display.timeFormat_24h') },
          ]}
        />
        <SettingSelect
          label={t('settings:display.rowsPerPage')}
          value={String(displayDraft.rowsPerPage ?? 10)}
          onChange={(v) => updateDraftField('display', 'rowsPerPage', Number(v))}
          options={[
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' },
          ]}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingToggle
          label={t('settings:display.compactMode')}
          description={t('settings:display.compactMode_desc')}
          value={displayDraft.compactMode ?? false}
          onChange={(v) => updateDraftField('display', 'compactMode', v)}
        />
        <SettingToggle
          label={t('settings:display.sidebarCollapsed')}
          description={t('settings:display.sidebarCollapsed_desc')}
          value={displayDraft.sidebarCollapsed ?? false}
          onChange={(v) => updateDraftField('display', 'sidebarCollapsed', v)}
        />
      </SettingGroup>

      <SectionActions
        hasChanges={hasChanges('display')}
        onSave={() => saveCategory('display')}
        onReset={() => resetCategory('display')}
        saving={saving}
        t={t}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'business': return renderBusiness();
      case 'scheduling': return renderScheduling();
      case 'notifications': return renderNotifications();
      case 'display': return renderDisplay();
      default: return null;
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('settings:title')}</h1>
          {saveMessage && (
            <p className="mt-2 text-sm text-green-600 font-medium">{saveMessage}</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => tryChangeCategory(cat.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                    activeCategory === cat.id
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={CATEGORY_ICONS[cat.id] || CATEGORY_ICONS.display} />
                  </svg>
                  {t(cat.labelKey)}
                  {hasChanges(cat.id) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t(`settings:category.${activeCategory}`)}
              </h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscard}
        onCancel={() => setShowUnsavedModal(false)}
        t={t}
      />
    </div>
  );
};

export default SettingsPage;
