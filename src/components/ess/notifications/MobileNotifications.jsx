/**
 * MobileNotifications — Task 70
 *
 * Mobile-native notification feed with time-grouped sections (Today,
 * Yesterday, Earlier), unread indicators, tap-to-deep-link, mark-all-read
 * action, infinite scroll, and an empty state illustration.
 * Reuses useNotifications hook from task 53.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  BanknotesIcon,
  SunIcon,
  UserIcon,
  ClockIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../../hooks/useNotifications';
import { useEssConnectivity } from '../../../contexts/EssConnectivityContext';
import MobileHeader from '../../mobile/MobileHeader';
import EssOfflineFallback from '../EssOfflineFallback';

// ── Notification type → icon mapping ─────────────────────────

const ICON_MAP = {
  schedule: CalendarIcon,
  schedule_published: CalendarIcon,
  shift_updated: CalendarIcon,
  payslip: BanknotesIcon,
  payslip_available: BanknotesIcon,
  leave: SunIcon,
  leave_approved: SunIcon,
  leave_rejected: SunIcon,
  leave_balance_adjusted: SunIcon,
  leave_starting: SunIcon,
  profile: UserIcon,
  profile_change_approved: UserIcon,
  profile_change_rejected: UserIcon,
  attendance: ClockIcon,
  general: BellIcon,
  system_announcement: BellIcon,
};

function NotificationIcon({ type, isRead }) {
  const Icon = ICON_MAP[type] || BellIcon;
  return (
    <Icon
      className="h-5 w-5 flex-shrink-0"
      style={{ color: isRead ? 'var(--mobile-label-tertiary)' : 'var(--mobile-tint)' }}
      data-testid="notification-icon"
    />
  );
}

// ── Relative time formatting ─────────────────────────────────

function formatRelativeTime(dateStr, t) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return t('mobile.notifications.justNow');
  if (diffMin < 60) return t('mobile.notifications.minutesAgo', { count: diffMin });
  if (diffHours < 24) return t('mobile.notifications.hoursAgo', { count: diffHours });

  // Check if yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === yesterday.getTime()) return t('mobile.notifications.yesterday');

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Time grouping ────────────────────────────────────────────

function groupNotifications(notifications, t) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = { today: [], yesterday: [], earlier: [] };

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() >= today.getTime()) groups.today.push(n);
    else if (d.getTime() >= yesterday.getTime()) groups.yesterday.push(n);
    else groups.earlier.push(n);
  }

  const result = [];
  if (groups.today.length > 0) {
    result.push({ label: t('mobile.notifications.today'), key: 'today', items: groups.today });
  }
  if (groups.yesterday.length > 0) {
    result.push({ label: t('mobile.notifications.yesterday'), key: 'yesterday', items: groups.yesterday });
  }
  if (groups.earlier.length > 0) {
    result.push({ label: t('mobile.notifications.earlier'), key: 'earlier', items: groups.earlier });
  }
  return result;
}

// ── NotificationRow ──────────────────────────────────────────

const NotificationRow = ({ notification, onTap, t }) => (
  <li
    className={`flex gap-3 px-4 py-3 min-h-[44px] active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors duration-150 cursor-pointer ${
      notification.isRead ? 'opacity-75' : ''
    }`}
    onClick={() => onTap(notification)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(notification); } }}
    role="button"
    tabIndex={0}
    aria-label={`${notification.title}${notification.isRead ? '' : ` — ${t('mobile.notifications.unread')}`}`}
    data-testid="notification-row"
  >
    <div className="flex-shrink-0 mt-0.5">
      <NotificationIcon type={notification.type} isRead={notification.isRead} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-mobile-body truncate ${
            notification.isRead
              ? 'text-[var(--mobile-label-secondary)]'
              : 'text-[var(--mobile-label-primary)] font-semibold'
          }`}
        >
          {notification.title}
        </span>
        {!notification.isRead && (
          <span
            className="h-2 w-2 rounded-full bg-[var(--mobile-tint)] flex-shrink-0 mt-2"
            data-testid="unread-dot"
          />
        )}
      </div>
      {notification.body && (
        <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-0.5 line-clamp-2">
          {notification.body}
        </p>
      )}
      <span className="text-mobile-caption text-[var(--mobile-label-tertiary)] mt-1 block">
        {formatRelativeTime(notification.createdAt, t)}
      </span>
    </div>
  </li>
);

// ── Section Header ───────────────────────────────────────────

const SectionHeader = ({ label }) => (
  <h2
    className="text-mobile-caption font-semibold text-[var(--mobile-label-secondary)] uppercase tracking-wide px-4 pt-4 pb-2"
    data-testid="section-header"
  >
    {label}
  </h2>
);

// ── Empty State ──────────────────────────────────────────────

const EmptyState = ({ t }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4" data-testid="notifications-empty">
    <BellIcon className="h-12 w-12 text-[var(--mobile-label-tertiary)] mb-4" />
    <h3 className="text-mobile-headline text-[var(--mobile-label-primary)] font-semibold">
      {t('mobile.notifications.emptyTitle')}
    </h3>
    <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-1 text-center">
      {t('mobile.notifications.emptyBody')}
    </p>
  </div>
);

// ── Loading Skeleton ─────────────────────────────────────────

const NotificationSkeleton = () => (
  <div className="space-y-1" data-testid="notifications-skeleton">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// ── Load More Spinner ────────────────────────────────────────

const LoadMoreSpinner = () => (
  <div className="flex justify-center py-4" data-testid="load-more-spinner">
    <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-[var(--mobile-tint)] rounded-full animate-spin" />
  </div>
);

// ── Main Component ───────────────────────────────────────────

const MobileNotifications = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { isOnline } = useEssConnectivity();
  const scrollRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchList,
    markAsRead,
    markAllRead,
  } = useNotifications();

  // Initial load
  useEffect(() => {
    fetchList({ page: 1, pageSize: 20 });
  }, [fetchList]);

  // Time-grouped sections
  const groups = useMemo(
    () => groupNotifications(notifications, t),
    [notifications, t],
  );

  // Handle tap on notification
  const handleTap = useCallback(
    (n) => {
      if (!n.isRead) markAsRead(n.id);
      if (n.link) navigate(n.link);
    },
    [markAsRead, navigate],
  );

  // Mark all read (optimistic)
  const handleMarkAllRead = useCallback(() => {
    markAllRead();
  }, [markAllRead]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoadingMore || !pagination.hasNextPage) return;
    const threshold = 100;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      setIsLoadingMore(true);
      fetchList({
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        append: true,
      }).finally(() => setIsLoadingMore(false));
    }
  }, [isLoadingMore, pagination, fetchList]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Mark all read button
  const markAllReadAction = (
    <button
      onClick={handleMarkAllRead}
      disabled={unreadCount === 0}
      className="text-mobile-subheadline text-[var(--mobile-tint)] disabled:opacity-40"
      aria-disabled={unreadCount === 0}
      data-testid="mark-all-read-btn"
    >
      {t('mobile.notifications.markAllRead')}
    </button>
  );

  // Offline
  if (!isOnline && notifications.length === 0 && !isLoading) {
    return (
      <div data-testid="mobile-notifications">
        <MobileHeader title={t('mobile.notifications.title')} />
        <EssOfflineFallback />
      </div>
    );
  }

  // Error
  if (error && notifications.length === 0) {
    return (
      <div data-testid="mobile-notifications">
        <MobileHeader title={t('mobile.notifications.title')} />
        <div className="px-4 py-8 text-center text-[var(--mobile-label-secondary)]" data-testid="mobile-notifications-error">
          {error}
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading && notifications.length === 0) {
    return (
      <div data-testid="mobile-notifications">
        <MobileHeader title={t('mobile.notifications.title')} action={markAllReadAction} />
        <NotificationSkeleton />
      </div>
    );
  }

  // Empty
  if (notifications.length === 0) {
    return (
      <div data-testid="mobile-notifications">
        <MobileHeader title={t('mobile.notifications.title')} />
        <EmptyState t={t} />
      </div>
    );
  }

  return (
    <div data-testid="mobile-notifications">
      <MobileHeader title={t('mobile.notifications.title')} action={markAllReadAction} />

      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 140px)' }}>
        {groups.length === 1 && groups[0].key === 'today' ? (
          /* Single "Today" group — no header needed for a clean list */
          <ul className="divide-y divide-[var(--mobile-separator)]" role="list" data-testid="notification-list">
            {groups[0].items.map((n) => (
              <NotificationRow key={n.id} notification={n} onTap={handleTap} t={t} />
            ))}
          </ul>
        ) : (
          groups.map((group) => (
            <div key={group.key}>
              <SectionHeader label={group.label} />
              <ul className="divide-y divide-[var(--mobile-separator)]" role="list" data-testid="notification-list">
                {group.items.map((n) => (
                  <NotificationRow key={n.id} notification={n} onTap={handleTap} t={t} />
                ))}
              </ul>
            </div>
          ))
        )}

        {isLoadingMore && <LoadMoreSpinner />}
      </div>
    </div>
  );
};

export { formatRelativeTime, groupNotifications, ICON_MAP, NotificationRow, NotificationIcon };
export default MobileNotifications;
