import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/useNotifications';

// ─── Type icon paths (Heroicons outline) ────────────────────

const TYPE_ICONS = {
  payslip_available:        { path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-500' },
  schedule_published:       { path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-indigo-500' },
  profile_change_approved:  { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-500' },
  profile_change_rejected:  { path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-500' },
  leave_approved:           { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-500' },
  leave_rejected:           { path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-500' },
  leave_balance_adjusted:   { path: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', color: 'text-amber-500' },
  leave_starting:           { path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-indigo-500' },
  shift_updated:            { path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: 'text-blue-500' },
  system_announcement:      { path: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', color: 'text-gray-500' },
  general:                  { path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-gray-500' },
};

// ─── Relative time formatting ───────────────────────────────

function formatTimeAgo(dateStr, t) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('notifications.timeAgo.justNow');
  if (diffMin < 60) return t('notifications.timeAgo.minutesAgo', { n: diffMin });
  if (diffHours < 24) return t('notifications.timeAgo.hoursAgo', { n: diffHours });
  if (diffDays === 1) return t('notifications.timeAgo.yesterday');
  if (diffDays < 30) return t('notifications.timeAgo.daysAgo', { n: diffDays });
  return date.toLocaleDateString();
}

// ─── NotificationBell ───────────────────────────────────────

const NotificationBell = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    fetchList,
    markAsRead,
    markAllRead,
  } = useNotifications();

  // Load latest 10 when dropdown opens
  useEffect(() => {
    if (isOpen) fetchList({ page: 1, pageSize: 10 });
  }, [isOpen, fetchList]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.link) navigate(notification.link);
    setIsOpen(false);
  }, [markAsRead, navigate]);

  const handleMarkAllRead = useCallback(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
        aria-label={t('notifications.title')}
        data-cy="notification-bell"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full"
            data-cy="notification-badge"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[480px] flex flex-col"
          data-cy="notification-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                data-cy="mark-all-read"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                {t('notifications.empty')}
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <NotificationDropdownItem
                  key={n.id}
                  notification={n}
                  onClick={() => handleNotificationClick(n)}
                  t={t}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <button
              onClick={() => { navigate('/app/ess/notifications'); setIsOpen(false); }}
              className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium py-1"
              data-cy="view-all-notifications"
            >
              {t('notifications.viewAll')} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Dropdown Item ──────────────────────────────────────────

const NotificationDropdownItem = ({ notification, onClick, t }) => {
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.general;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
        !notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
      }`}
      data-cy="notification-item"
    >
      {/* Type icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg className={`w-5 h-5 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.path} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {/* Read indicator */}
          {!notification.isRead && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-500" />
          )}
          <p className={`text-sm leading-snug truncate ${
            notification.isRead
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100 font-medium'
          }`}>
            {notification.title}
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {formatTimeAgo(notification.createdAt, t)}
        </p>
      </div>
    </button>
  );
};

export { formatTimeAgo, TYPE_ICONS };
export default NotificationBell;
