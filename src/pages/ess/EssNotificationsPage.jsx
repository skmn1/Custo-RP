import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo, TYPE_ICONS } from '../../components/ess/NotificationBell';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import EssOfflineFallback from '../../components/ess/EssOfflineFallback';
import { apiFetch } from '../../api/config';
import { subscribeToPush, unsubscribeFromPush } from '../../lib/essPushSubscription';

// ─── Filter type-to-notification-type mapping ───────────────

const TYPE_FILTER_MAP = {
  payslips: ['payslip_available'],
  schedule: ['schedule_published', 'shift_updated'],
  profile:  ['profile_change_approved', 'profile_change_rejected'],
  leave:    ['leave_approved', 'leave_rejected', 'leave_balance_adjusted', 'leave_starting'],
};

// Preference categories (must match backend WebPushService TYPE_TO_CATEGORY values)
const PREF_CATEGORIES = [
  { key: 'payslip',  labelKey: 'notifications.filter.payslips' },
  { key: 'schedule', labelKey: 'notifications.filter.schedule' },
  { key: 'profile',  labelKey: 'notifications.filter.profile' },
  { key: 'leave',    labelKey: 'notifications.filter.leave' },
  { key: 'general',  labelKey: 'notifications.filter.general' },
];

// ─── Date grouping ──────────────────────────────────────────

function groupByDate(notifications) {
  const groups = [];
  let currentLabel = null;
  let currentItems = [];

  for (const n of notifications) {
    const label = getDateLabel(n.createdAt);
    if (label !== currentLabel) {
      if (currentLabel !== null) groups.push({ label: currentLabel, items: currentItems });
      currentLabel = label;
      currentItems = [n];
    } else {
      currentItems.push(n);
    }
  }
  if (currentLabel !== null) groups.push({ label: currentLabel, items: currentItems });
  return groups;
}

function getDateLabel(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main Component ─────────────────────────────────────────

const EssNotificationsPage = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { isOnline } = useEssConnectivity();
  const [typeFilter, setTypeFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Notification preferences state
  const [preferences, setPreferences] = useState({});
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    fetchList,
    markAsRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  // Initial load
  useEffect(() => {
    fetchList({ page: 1, pageSize: 20, unreadOnly });
  }, [fetchList, unreadOnly]);

  // Load notification preferences
  useEffect(() => {
    setPrefsLoading(true);
    apiFetch('/ess/notifications/preferences')
      .then((res) => {
        if (res.data) setPreferences(res.data);
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

  const handleTogglePref = useCallback(async (category, field, newValue) => {
    // Optimistic update
    setPreferences((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: newValue },
    }));

    try {
      if (field === 'pushEnabled' && newValue && pushPermission !== 'granted') {
        // Need to request permission + subscribe
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission !== 'granted') {
          // Revert
          setPreferences((prev) => ({
            ...prev,
            [category]: { ...prev[category], [field]: false },
          }));
          return;
        }
        await subscribeToPush();
      }

      await apiFetch(`/ess/notifications/preferences/${category}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: newValue }),
      });

      // If push disabled for all categories, unsubscribe
      if (field === 'pushEnabled' && !newValue) {
        const updated = { ...preferences, [category]: { ...preferences[category], pushEnabled: false } };
        const anyPushEnabled = Object.values(updated).some((p) => p.pushEnabled);
        if (!anyPushEnabled) {
          await unsubscribeFromPush().catch(() => {});
        }
      }
    } catch {
      // Revert on error
      setPreferences((prev) => ({
        ...prev,
        [category]: { ...prev[category], [field]: !newValue },
      }));
    }
  }, [preferences, pushPermission]);

  // Filter by type on the client side
  const filtered = useMemo(() => {
    if (typeFilter === 'all') return notifications;
    const allowedTypes = TYPE_FILTER_MAP[typeFilter] || [];
    return notifications.filter((n) => allowedTypes.includes(n.type));
  }, [notifications, typeFilter]);

  const dateGroups = useMemo(() => groupByDate(filtered), [filtered]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchList({ page: pagination.page + 1, pageSize: pagination.pageSize, unreadOnly, append: true });
    }
  }, [pagination, fetchList, unreadOnly]);

  const handleNotificationClick = useCallback((n) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) navigate(n.link);
  }, [markAsRead, navigate]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('notifications.title')}
        </h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              data-cy="page-mark-all-read"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6" data-cy="notification-filters">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          data-cy="type-filter"
        >
          <option value="all">{t('notifications.filter.all')}</option>
          <option value="payslips">{t('notifications.filter.payslips')}</option>
          <option value="schedule">{t('notifications.filter.schedule')}</option>
          <option value="profile">{t('notifications.filter.profile')}</option>
          <option value="leave">{t('notifications.filter.leave')}</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            data-cy="unread-toggle"
          />
          {t('notifications.unreadOnly')}
        </label>
      </div>

      {/* Notification list */}
      {!isOnline && notifications.length === 0 && !isLoading ? (
        <EssOfflineFallback />
      ) : isLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-400 dark:text-gray-500">{t('notifications.empty')}</p>
        </div>
      ) : (
        <div className="space-y-6" data-cy="notification-list">
          {dateGroups.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.items.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onClick={() => handleNotificationClick(n)}
                    onDelete={() => deleteNotification(n.id)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load more */}
          {pagination.hasNextPage && (
            <div className="text-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                data-cy="load-more"
              >
                {t('notifications.loadMore')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Notification Preferences ── */}
      <div className="mt-10" data-cy="notification-preferences">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('notifications.preferences.title')}
        </h2>

        {pushPermission === 'denied' ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm text-amber-800 dark:text-amber-300"
            data-cy="push-blocked-banner"
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{t('pwa.push.settingsBlocked')}</span>
          </div>
        ) : prefsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <span>{t('notifications.preferences.category')}</span>
              <span className="text-center">{t('notifications.preferences.inApp')}</span>
              <span className="text-center">{t('pwa.push.settingsLabel')}</span>
            </div>

            {PREF_CATEGORIES.map(({ key, labelKey }) => {
              const pref = preferences[key] || { inAppEnabled: true, pushEnabled: true };
              return (
                <div
                  key={key}
                  className="grid grid-cols-3 items-center px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0"
                  data-cy={`pref-row-${key}`}
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t(labelKey)}</span>

                  {/* In-App toggle */}
                  <div className="flex justify-center">
                    <button
                      role="switch"
                      aria-checked={pref.inAppEnabled}
                      onClick={() => handleTogglePref(key, 'inAppEnabled', !pref.inAppEnabled)}
                      data-cy={`pref-inapp-${key}`}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                        pref.inAppEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          pref.inAppEnabled ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push toggle (hidden when denied) */}
                  <div className="flex justify-center">
                    {pushPermission === 'denied' ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <button
                        role="switch"
                        aria-checked={pref.pushEnabled}
                        onClick={() => handleTogglePref(key, 'pushEnabled', !pref.pushEnabled)}
                        data-cy={`pref-push-${key}`}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                          pref.pushEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            pref.pushEnabled ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Notification Card ──────────────────────────────────────

const NotificationCard = ({ notification, onClick, onDelete, t }) => {
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.general;

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex gap-3 ${
        !notification.isRead ? 'border-l-4 border-l-indigo-500' : ''
      }`}
      data-cy="notification-card"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg className={`w-5 h-5 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.path} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm leading-snug ${
              notification.isRead
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100 font-medium'
            }`}>
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.body}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" data-cy="unread-dot" />
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {formatTimeAgo(notification.createdAt, t)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {notification.link ? (
            <button
              onClick={onClick}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              data-cy="notification-link"
            >
              {t(`notifications.types.${notification.type}`)} →
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            data-cy="delete-notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EssNotificationsPage;
