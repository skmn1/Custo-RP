import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useEssNotifications } from '../../../hooks/useEssNotifications';
import { useEssMarkRead } from '../../../hooks/useEssMarkRead';

// ── Constants ─────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all', labelKey: 'mobile.notifications.filterAll' },
  { key: 'shift', labelKey: 'mobile.notifications.filterShifts' },
  { key: 'payroll', labelKey: 'mobile.notifications.filterPayroll' },
  { key: 'news', labelKey: 'mobile.notifications.filterNews' },
];

const CATEGORY_ICONS = {
  shift: 'swap_horiz',
  payroll: 'payments',
  news: 'campaign',
  schedule: 'event',
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Format a timestamp as a relative human-readable string.
 * e.g. "Just now", "2h ago", "1 day ago", "3 days ago"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

/**
 * Group an array of notifications into date buckets:
 * "Today", "Yesterday", or a formatted date string.
 */
export function groupByDate(notifications) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return notifications.reduce((acc, notif) => {
    const d = new Date(notif.createdAt);
    let group;
    if (d.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    } else {
      group = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(d);
    }
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});
}

// ── Sub-components ────────────────────────────────────────────────

const MobileNotificationsSkeleton = () => (
  <div className="animate-pulse px-6 py-8" data-testid="notifications-skeleton">
    <div className="h-8 bg-surface-container rounded-xl w-48 mb-4" />
    <div className="flex gap-2 mb-6">
      {[80, 60, 72, 56].map((w, i) => (
        <div key={i} className={`h-9 bg-surface-container rounded-full`} style={{ width: `${w}px` }} />
      ))}
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-24 bg-surface-container rounded-2xl mb-3" />
    ))}
  </div>
);

const NotificationItem = ({ notification, onMarkRead, onNavigate, onSwapAction, t }) => {
  const isUnread = !notification.read;

  const handleView = useCallback(() => {
    if (isUnread) onMarkRead(notification.id);
    if (notification.actionType === 'navigate' && notification.actionPayload?.to) {
      onNavigate(notification.actionPayload.to);
    }
  }, [isUnread, notification, onMarkRead, onNavigate]);

  const icon = CATEGORY_ICONS[notification.type] ?? 'notifications';

  return (
    <div
      className="relative bg-surface-container-lowest rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
      onClick={handleView}
      onKeyDown={(e) => e.key === 'Enter' && handleView()}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}: ${notification.body}${isUnread ? ' (unread)' : ''}`}
      data-testid="notification-item"
      data-unread={isUnread}
    >
      {/* Unread left accent bar */}
      {isUnread && (
        <div
          className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl"
          data-testid="unread-accent"
        />
      )}

      <div className="flex items-start gap-4 pl-1">
        {/* Icon badge */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isUnread ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
          }`}
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-body ${isUnread ? 'font-bold text-on-surface' : 'font-medium text-on-surface'}`}
          >
            {notification.title}
          </p>
          <p className="text-on-surface-variant text-xs mt-0.5 font-body line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
          <p className="text-outline text-[10px] mt-1.5 font-label uppercase tracking-wide">
            {formatRelativeTime(notification.createdAt)}
          </p>

          {/* Inline swap actions */}
          {notification.actionType === 'swapRequest' && (
            <div className="flex gap-2 mt-3" data-testid="swap-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwapAction(notification.id, 'accept');
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs font-label hover:opacity-90 transition-opacity"
                aria-label={`${t('mobile.notifications.accept')}: ${notification.title}`}
                data-testid="accept-btn"
              >
                {t('mobile.notifications.accept')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwapAction(notification.id, 'decline');
                }}
                className="px-4 py-2 rounded-lg text-primary border-2 border-primary font-bold text-xs font-label hover:bg-primary-container/30 transition-colors"
                aria-label={`${t('mobile.notifications.decline')}: ${notification.title}`}
                data-testid="decline-btn"
              >
                {t('mobile.notifications.decline')}
              </button>
            </div>
          )}

          {/* Navigate action link */}
          {notification.actionType === 'navigate' && (
            <button
              className="text-primary font-bold text-xs mt-2 flex items-center gap-1 font-label uppercase tracking-wide hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              data-testid="view-action-btn"
              aria-label={`${t('mobile.notifications.viewAction')}: ${notification.title}`}
            >
              {t('mobile.notifications.viewAction')}
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── In-app toast (SCREEN_95 reference) ───────────────────────────

export const EssNotificationToast = ({ title, body, onView, onDismiss }) => (
  <div
    className="fixed top-4 inset-x-4 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[20px] rounded-[2rem] p-5 shadow-2xl border border-white/30 flex items-start gap-3"
    role="alert"
    aria-live="assertive"
    data-testid="notification-toast"
  >
    <div
      className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0"
      aria-hidden="true"
    >
      <span
        className="material-symbols-outlined text-on-primary text-base"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        notifications
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-headline text-sm font-bold text-on-surface">{title}</p>
      <p className="text-on-surface-variant text-xs mt-0.5 font-body line-clamp-2">{body}</p>
    </div>
    <div className="flex flex-col gap-2 flex-shrink-0">
      <button
        onClick={onView}
        className="px-3 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold font-label"
        data-testid="toast-view-btn"
      >
        View
      </button>
      <button
        onClick={onDismiss}
        className="text-outline text-xs font-label"
        aria-label="Dismiss notification"
        data-testid="toast-dismiss-btn"
      >
        ✕
      </button>
    </div>
  </div>
);

// ── Main export ───────────────────────────────────────────────────

export const MobileNotificationsPage = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { data: notifications, isLoading, refetch } = useEssNotifications();
  const { markRead, markAllRead } = useEssMarkRead();
  const [activeFilter, setActiveFilter] = useState('all');

  // Optimistic unread state: set of ids marked read locally
  const [localRead, setLocalRead] = useState(new Set());

  const handleMarkRead = useCallback(
    async (id) => {
      setLocalRead((prev) => new Set([...prev, id]));
      try {
        await markRead(id);
      } catch {
        // Revert on failure
        setLocalRead((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [markRead]
  );

  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = (notifications ?? [])
      .filter((n) => !n.read && !localRead.has(n.id))
      .map((n) => n.id);
    setLocalRead((prev) => new Set([...prev, ...unreadIds]));
    try {
      await markAllRead();
      refetch();
    } catch {
      setLocalRead((prev) => {
        const next = new Set(prev);
        unreadIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  }, [notifications, localRead, markAllRead, refetch]);

  const handleSwapAction = useCallback(
    async (id, action) => {
      await handleMarkRead(id);
      // POST to accept/decline endpoint
      try {
        const { apiFetch } = await import('../../../api/config');
        await apiFetch(`/ess/notifications/${id}/swap-${action}`, { method: 'POST' });
        refetch();
      } catch {
        // Silently ignore — item is already marked read
      }
    },
    [handleMarkRead, refetch]
  );

  if (isLoading) return <MobileNotificationsSkeleton />;

  // Merge optimistic read state
  const merged = (notifications ?? []).map((n) => ({
    ...n,
    read: n.read || localRead.has(n.id),
  }));

  const filtered =
    activeFilter === 'all' ? merged : merged.filter((n) => n.type === activeFilter);

  const grouped = groupByDate(filtered);
  const hasUnread = merged.some((n) => !n.read);

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#fff8f7" />
        <title>{t('mobile.notifications.title')}</title>
      </Helmet>
      <div className="pb-28 max-w-4xl mx-auto" data-testid="notifications-page">
        {/* Editorial header */}
        <div className="px-6 pt-6 pb-2" data-testid="notifications-header">
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.15em] font-label block mb-1">
            {t('mobile.notifications.stayInformed')}
          </span>
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
              {t('mobile.notifications.title')}
            </h1>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                className="text-primary text-xs font-bold font-label hover:opacity-80 transition-opacity"
                aria-label={t('mobile.notifications.markAllRead')}
                data-testid="mark-all-read-btn"
              >
                {t('mobile.notifications.markAllRead')}
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div
          className="flex gap-2 overflow-x-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t('mobile.notifications.filterLabel')}
          data-testid="filter-tabs"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeFilter === tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm font-label tracking-wide transition-all ${
                activeFilter === tab.key
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              data-testid={`filter-tab-${tab.key}`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Bento grid: main feed + sidebar on md+ */}
        <div className="px-6 md:grid md:grid-cols-12 md:gap-8">
          {/* Main feed */}
          <div className="md:col-span-8" data-testid="notifications-feed">
            {filtered.length === 0 ? (
              <div
                className="bg-surface-container-lowest rounded-2xl text-center py-12"
                data-testid="notifications-empty"
              >
                <span
                  className="material-symbols-outlined text-4xl text-outline block mb-2"
                  aria-hidden="true"
                >
                  notifications_off
                </span>
                <p className="text-on-surface-variant font-medium font-body">
                  {t('mobile.notifications.empty')}
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([dateGroup, items]) => (
                <div key={dateGroup} className="mb-6" data-testid="date-group">
                  {/* Group header with divider */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase text-outline tracking-widest font-label flex-shrink-0">
                      {dateGroup}
                    </span>
                    <div className="h-px bg-outline-variant flex-grow" />
                  </div>
                  <div className="space-y-3">
                    {items.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={handleMarkRead}
                        onNavigate={navigate}
                        onSwapAction={handleSwapAction}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar — desktop only (md+) */}
          <aside
            className="hidden md:block md:col-span-4 space-y-4"
            data-testid="notifications-sidebar"
          >
            {/* Weekly Pulse digest */}
            <div
              className="rounded-3xl p-8 text-on-primary"
              style={{ background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)' }}
              data-testid="weekly-pulse"
            >
              <span
                className="material-symbols-outlined text-3xl mb-4 block opacity-80"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                trending_up
              </span>
              <h3 className="font-headline text-xl font-bold mb-2">
                {t('mobile.notifications.weeklyPulse')}
              </h3>
              <p className="text-on-primary/80 text-sm font-body mb-5 leading-relaxed">
                {t('mobile.notifications.weeklyPulseBody')}
              </p>
              <button className="w-full py-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all font-bold text-sm font-label text-on-primary">
                {t('mobile.notifications.readDigest')}
              </button>
            </div>

            {/* Feed preferences */}
            <div className="bg-surface-container-low rounded-3xl p-6" data-testid="feed-preferences">
              <h3 className="font-headline text-base font-bold text-on-surface mb-4">
                {t('mobile.notifications.feedPreferences')}
              </h3>
              {[
                t('mobile.notifications.prefShiftAlerts'),
                t('mobile.notifications.prefPayrollUpdates'),
                t('mobile.notifications.prefTeamNews'),
                t('mobile.notifications.prefHrAnnouncements'),
              ].map((pref) => (
                <div
                  key={pref}
                  className="flex items-center justify-between py-3 border-t border-outline-variant/30 first:border-t-0"
                >
                  <span className="text-on-surface-variant text-sm font-body">{pref}</span>
                  <button
                    className="w-10 h-6 rounded-full bg-primary relative flex-shrink-0 transition-colors"
                    role="switch"
                    aria-checked="true"
                    aria-label={`${pref} notifications`}
                  >
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};
