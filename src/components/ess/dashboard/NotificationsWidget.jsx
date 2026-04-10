import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../../../api/config';

function timeAgo(dateStr, t) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('notifications.timeAgo.justNow');
  if (diffMin < 60) return t('notifications.timeAgo.minutesAgo', { n: diffMin });
  if (diffHrs < 24) return t('notifications.timeAgo.hoursAgo', { n: diffHrs });
  if (diffDays === 1) return t('notifications.timeAgo.yesterday');
  return t('notifications.timeAgo.daysAgo', { n: diffDays });
}

const NotificationsWidget = ({ notifications, unreadCount, error }) => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await apiFetch(`/ess/notifications/${notif.id}/read`, { method: 'PUT' });
      } catch {
        // non-blocking
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          {t('dashboard.notifications.title')}
        </h3>
        <p className="text-sm text-red-500 dark:text-red-400 text-center py-4">{t('dashboard.unableToLoad')}</p>
      </div>
    );
  }

  const displayed = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <BellIcon className="h-4 w-4" />
        {t('dashboard.notifications.title')}
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </h3>

      {displayed.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center flex-1 flex items-center justify-center">
          {t('dashboard.notifications.empty')}
        </p>
      ) : (
        <ul className="space-y-2 flex-1">
          {displayed.map((notif) => (
            <li
              key={notif.id}
              onClick={() => handleClick(notif)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(notif)}
              className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-gray-300 dark:bg-gray-600' : 'bg-indigo-500'}`} />
              <div className="flex-1 min-w-0">
                <p className={`truncate ${notif.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {timeAgo(notif.createdAt, t)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/app/ess/notifications"
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-4 inline-block"
      >
        {t('dashboard.notifications.viewAll')} →
      </Link>
    </div>
  );
};

export default NotificationsWidget;
