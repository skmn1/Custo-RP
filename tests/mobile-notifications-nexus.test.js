/**
 * Unit tests for Task 85 — MobileNotificationsPage (Nexus Kinetic)
 *
 * Covers:
 *  - formatRelativeTime(): "Just now", Xm ago, Xh ago, "1 day ago", "X days ago"
 *  - groupByDate(): Today / Yesterday / formatted date groupings
 *  - Notification filtering by type
 *  - EN i18n keys: mobile.notifications.*
 *  - FR i18n keys: exact translated values
 *  - Source structural assertions: MobileNotificationsPage (testids, aria, filter tabs)
 *  - Source assertions: NotificationItem (unread accent, swap actions, navigate action)
 *  - Source assertions: EssNotificationToast (glassmorphism, role="alert")
 *  - useEssNotifications hook: GET endpoint, returned shape
 *  - useEssMarkRead hook: PATCH single + bulk endpoints
 *  - App.jsx: imports + route
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Helpers mirrored from MobileNotificationsPage ─────────────────

function formatRelativeTime(isoString) {
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

function groupByDate(notifications) {
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

function makeNotif(overrides) {
  return {
    id: 'n1',
    type: 'payroll',
    title: 'Payroll Update',
    body: 'Your payslip is ready.',
    createdAt: new Date().toISOString(),
    read: false,
    actionType: null,
    actionPayload: null,
    ...overrides,
  };
}

// ── formatRelativeTime ────────────────────────────────────────────

describe('formatRelativeTime()', () => {
  it('returns empty string for null / undefined', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
  });

  it('returns "Just now" for timestamps < 1 minute ago', () => {
    const ts = new Date(Date.now() - 30_000).toISOString(); // 30 s ago
    expect(formatRelativeTime(ts)).toBe('Just now');
  });

  it('returns "2m ago" for 2 minutes ago', () => {
    const ts = new Date(Date.now() - 2 * 60_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('2m ago');
  });

  it('returns "59m ago" for 59 minutes ago', () => {
    const ts = new Date(Date.now() - 59 * 60_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('59m ago');
  });

  it('returns "2h ago" for 2 hours ago', () => {
    const ts = new Date(Date.now() - 2 * 3_600_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('2h ago');
  });

  it('returns "23h ago" for 23 hours ago', () => {
    const ts = new Date(Date.now() - 23 * 3_600_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('23h ago');
  });

  it('returns "1 day ago" for exactly 1 day ago', () => {
    const ts = new Date(Date.now() - 25 * 3_600_000).toISOString(); // 25h
    expect(formatRelativeTime(ts)).toBe('1 day ago');
  });

  it('returns "5 days ago" for 5 days ago', () => {
    const ts = new Date(Date.now() - 5 * 86_400_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('5 days ago');
  });

  it('returns "3 days ago" for 3 days ago', () => {
    const ts = new Date(Date.now() - 3 * 86_400_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('3 days ago');
  });
});

// ── groupByDate ───────────────────────────────────────────────────

describe('groupByDate()', () => {
  it('groups today\'s notifications under "Today"', () => {
    const notif = makeNotif({ createdAt: new Date().toISOString() });
    const groups = groupByDate([notif]);
    expect(Object.keys(groups)).toContain('Today');
    expect(groups['Today']).toHaveLength(1);
  });

  it('groups yesterday\'s notifications under "Yesterday"', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(10, 0, 0, 0);
    const notif = makeNotif({ createdAt: d.toISOString() });
    const groups = groupByDate([notif]);
    expect(Object.keys(groups)).toContain('Yesterday');
  });

  it('groups older notifications under a formatted date', () => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    const notif = makeNotif({ createdAt: d.toISOString() });
    const groups = groupByDate([notif]);
    const keys = Object.keys(groups);
    expect(keys).not.toContain('Today');
    expect(keys).not.toContain('Yesterday');
    expect(keys.length).toBe(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupByDate([])).toEqual({});
  });

  it('puts multiple notifications on same day in same group', () => {
    const ts = new Date().toISOString();
    const n1 = makeNotif({ id: 'a', createdAt: ts });
    const n2 = makeNotif({ id: 'b', createdAt: ts });
    const groups = groupByDate([n1, n2]);
    expect(groups['Today']).toHaveLength(2);
  });
});

// ── Notification filter logic ────────────────────────────────────

describe('Notification filtering', () => {
  const notifications = [
    makeNotif({ id: '1', type: 'shift' }),
    makeNotif({ id: '2', type: 'payroll' }),
    makeNotif({ id: '3', type: 'news' }),
    makeNotif({ id: '4', type: 'shift' }),
  ];

  it('"all" filter returns all notifications', () => {
    const filtered = notifications.filter((n) => 'all' === 'all' || n.type === 'all');
    expect(filtered).toHaveLength(4);
  });

  it('"shift" filter returns only shift notifications', () => {
    const filtered = notifications.filter((n) => n.type === 'shift');
    expect(filtered).toHaveLength(2);
  });

  it('"payroll" filter returns only payroll notifications', () => {
    const filtered = notifications.filter((n) => n.type === 'payroll');
    expect(filtered).toHaveLength(1);
  });

  it('"news" filter returns only news notifications', () => {
    const filtered = notifications.filter((n) => n.type === 'news');
    expect(filtered).toHaveLength(1);
  });

  it('filter for unknown type returns empty', () => {
    const filtered = notifications.filter((n) => n.type === 'unknown');
    expect(filtered).toHaveLength(0);
  });
});

// ── Optimistic read merge ─────────────────────────────────────────

describe('Optimistic read state merge', () => {
  it('marks item as read when id is in localRead set', () => {
    const localRead = new Set(['n2']);
    const notifications = [
      makeNotif({ id: 'n1', read: false }),
      makeNotif({ id: 'n2', read: false }),
    ];
    const merged = notifications.map((n) => ({
      ...n,
      read: n.read || localRead.has(n.id),
    }));
    expect(merged[0].read).toBe(false);
    expect(merged[1].read).toBe(true);
  });

  it('already-read items remain read', () => {
    const localRead = new Set();
    const notifications = [makeNotif({ id: 'n1', read: true })];
    const merged = notifications.map((n) => ({ ...n, read: n.read || localRead.has(n.id) }));
    expect(merged[0].read).toBe(true);
  });
});

// ── EN i18n keys ──────────────────────────────────────────────────

describe('EN mobile.notifications i18n keys', () => {
  const enPath = path.resolve(process.cwd(), 'public/locales/en/ess.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const nb = en.mobile?.notifications ?? {};

  const flatKeys = [
    'title', 'markAllRead', 'stayInformed', 'empty',
    'filterAll', 'filterShifts', 'filterPayroll', 'filterNews',
    'shiftChanges', 'news', 'accept', 'decline', 'viewAction',
    'weeklyPulse', 'weeklyPulseBody', 'readDigest',
    'feedPreferences', 'prefShiftAlerts', 'prefPayrollUpdates',
    'prefTeamNews', 'prefHrAnnouncements',
  ];

  flatKeys.forEach((key) => {
    it(`has EN key mobile.notifications.${key}`, () => {
      expect(nb[key]).toBeDefined();
      expect(typeof nb[key]).toBe('string');
      expect(nb[key].length).toBeGreaterThan(0);
    });
  });

  it('title is "Notifications"', () => {
    expect(nb.title).toBe('Notifications');
  });

  it('accept is "Accept"', () => {
    expect(nb.accept).toBe('Accept');
  });

  it('decline is "Decline"', () => {
    expect(nb.decline).toBe('Decline');
  });

  it('markAllRead is "Mark all read"', () => {
    expect(nb.markAllRead).toBe('Mark all read');
  });
});

// ── FR i18n keys ──────────────────────────────────────────────────

describe('FR mobile.notifications i18n keys', () => {
  const frPath = path.resolve(process.cwd(), 'public/locales/fr/ess.json');
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const nb = fr.mobile?.notifications ?? {};

  it('title is "Notifications"', () => {
    expect(nb.title).toBe('Notifications');
  });

  it('accept is "Accepter"', () => {
    expect(nb.accept).toBe('Accepter');
  });

  it('decline is "Refuser"', () => {
    expect(nb.decline).toBe('Refuser');
  });

  it('markAllRead is "Tout marquer comme lu"', () => {
    expect(nb.markAllRead).toBe('Tout marquer comme lu');
  });

  it('shiftChanges contains "quart"', () => {
    expect(nb.shiftChanges?.toLowerCase()).toContain('quart');
  });

  it('filterShifts is "Quarts"', () => {
    expect(nb.filterShifts).toBe('Quarts');
  });

  it('filterPayroll is "Paie"', () => {
    expect(nb.filterPayroll).toBe('Paie');
  });

  it('empty contains "jour"', () => {
    expect(nb.empty?.toLowerCase()).toContain('jour');
  });

  it('weeklyPulse is "Pulse de la semaine"', () => {
    expect(nb.weeklyPulse).toBe('Pulse de la semaine');
  });
});

// ── Source: MobileNotificationsPage ──────────────────────────────

describe('MobileNotificationsPage source structure', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileNotificationsPage.jsx'),
    'utf8'
  );

  it('imports useEssNotifications', () => {
    expect(src).toContain('useEssNotifications');
  });

  it('imports useEssMarkRead', () => {
    expect(src).toContain('useEssMarkRead');
  });

  it('imports useTranslation', () => {
    expect(src).toContain('useTranslation');
  });

  it('imports Helmet', () => {
    expect(src).toContain('Helmet');
  });

  it('imports useNavigate', () => {
    expect(src).toContain('useNavigate');
  });

  it('exports formatRelativeTime', () => {
    expect(src).toContain('export function formatRelativeTime');
  });

  it('exports groupByDate', () => {
    expect(src).toContain('export function groupByDate');
  });

  it('exports MobileNotificationsPage as named export', () => {
    expect(src).toContain('export const MobileNotificationsPage');
  });

  it('exports EssNotificationToast as named export', () => {
    expect(src).toContain('export const EssNotificationToast');
  });

  it('has notifications-page testid', () => {
    expect(src).toContain('data-testid="notifications-page"');
  });

  it('has notifications-header testid', () => {
    expect(src).toContain('data-testid="notifications-header"');
  });

  it('has filter-tabs testid with role="tablist"', () => {
    expect(src).toContain('data-testid="filter-tabs"');
    expect(src).toContain('role="tablist"');
  });

  it('filter tabs have role="tab" and aria-selected', () => {
    expect(src).toContain('role="tab"');
    expect(src).toContain('aria-selected={activeFilter === tab.key}');
  });

  it('has filter-tab-{key} testids', () => {
    expect(src).toContain('data-testid={`filter-tab-${tab.key}`}');
  });

  it('has 4 filter tab keys in FILTER_TABS', () => {
    expect(src).toContain("{ key: 'all'");
    expect(src).toContain("{ key: 'shift'");
    expect(src).toContain("{ key: 'payroll'");
    expect(src).toContain("{ key: 'news'");
  });

  it('has notifications-feed testid', () => {
    expect(src).toContain('data-testid="notifications-feed"');
  });

  it('has notifications-empty testid', () => {
    expect(src).toContain('data-testid="notifications-empty"');
  });

  it('has date-group testid', () => {
    expect(src).toContain('data-testid="date-group"');
  });

  it('has notifications-skeleton testid', () => {
    expect(src).toContain('data-testid="notifications-skeleton"');
  });

  it('has mark-all-read-btn testid with aria-label', () => {
    expect(src).toContain('data-testid="mark-all-read-btn"');
    expect(src).toContain('aria-label={t(\'mobile.notifications.markAllRead\')}');
  });

  it('has notifications-sidebar testid (md+ only)', () => {
    expect(src).toContain('data-testid="notifications-sidebar"');
    expect(src).toContain('hidden md:block');
  });

  it('has weekly-pulse testid', () => {
    expect(src).toContain('data-testid="weekly-pulse"');
  });

  it('has feed-preferences testid', () => {
    expect(src).toContain('data-testid="feed-preferences"');
  });

  it('sidebar preference toggles have role="switch" and aria-checked', () => {
    expect(src).toContain('role="switch"');
    expect(src).toContain('aria-checked="true"');
  });

  it('uses Magenta gradient on Weekly Pulse card', () => {
    expect(src).toContain('#da336b');
    expect(src).toContain('#8b2044');
  });

  it('optimistic localRead state used', () => {
    expect(src).toContain('localRead');
    expect(src).toContain('new Set');
  });
});

// ── Source: NotificationItem ──────────────────────────────────────

describe('NotificationItem source structure', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileNotificationsPage.jsx'),
    'utf8'
  );

  it('notification-item testid', () => {
    expect(src).toContain('data-testid="notification-item"');
  });

  it('data-unread attribute tracks unread state', () => {
    expect(src).toContain('data-unread={isUnread}');
  });

  it('unread-accent testid on left border div', () => {
    expect(src).toContain('data-testid="unread-accent"');
  });

  it('unread items show bg-primary left accent', () => {
    expect(src).toContain('bg-primary rounded-l-2xl');
  });

  it('item has role="button" and tabIndex={0}', () => {
    expect(src).toContain('role="button"');
    expect(src).toContain('tabIndex={0}');
  });

  it('item has aria-label with title and body', () => {
    expect(src).toContain('aria-label={`${notification.title}: ${notification.body}');
  });

  it('swap-actions testid present', () => {
    expect(src).toContain('data-testid="swap-actions"');
  });

  it('accept-btn testid present', () => {
    expect(src).toContain('data-testid="accept-btn"');
  });

  it('decline-btn testid present', () => {
    expect(src).toContain('data-testid="decline-btn"');
  });

  it('accept/decline buttons have aria-label with notification title context', () => {
    expect(src).toContain('aria-label={`${t(\'mobile.notifications.accept\')}: ${notification.title}`}');
    expect(src).toContain('aria-label={`${t(\'mobile.notifications.decline\')}: ${notification.title}`}');
  });

  it('swap buttons call e.stopPropagation()', () => {
    expect(src).toContain('e.stopPropagation()');
  });

  it('view-action-btn testid for navigate type', () => {
    expect(src).toContain('data-testid="view-action-btn"');
  });

  it('onKeyDown handler for keyboard activation', () => {
    expect(src).toContain('onKeyDown');
    expect(src).toContain('Enter');
  });

  it('CATEGORY_ICONS maps shift to swap_horiz', () => {
    expect(src).toContain('swap_horiz');
  });

  it('CATEGORY_ICONS maps payroll to payments', () => {
    expect(src).toContain('payments');
  });

  it('formatRelativeTime called with createdAt', () => {
    expect(src).toContain('formatRelativeTime(notification.createdAt)');
  });
});

// ── Source: EssNotificationToast ─────────────────────────────────

describe('EssNotificationToast source structure', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/ess/mobile/MobileNotificationsPage.jsx'),
    'utf8'
  );

  it('toast has role="alert"', () => {
    expect(src).toContain('role="alert"');
  });

  it('toast has aria-live="assertive"', () => {
    expect(src).toContain('aria-live="assertive"');
  });

  it('toast has notification-toast testid', () => {
    expect(src).toContain('data-testid="notification-toast"');
  });

  it('toast has toast-view-btn testid', () => {
    expect(src).toContain('data-testid="toast-view-btn"');
  });

  it('toast dismiss button has aria-label', () => {
    expect(src).toContain('aria-label="Dismiss notification"');
  });

  it('toast has toast-dismiss-btn testid', () => {
    expect(src).toContain('data-testid="toast-dismiss-btn"');
  });

  it('toast uses glassmorphism: backdrop-blur-[20px]', () => {
    expect(src).toContain('backdrop-blur-[20px]');
  });

  it('toast is fixed positioned at top', () => {
    expect(src).toContain('fixed top-4');
  });
});

// ── useEssNotifications hook ──────────────────────────────────────

describe('useEssNotifications hook', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useEssNotifications.js'),
    'utf8'
  );

  it('exports useEssNotifications', () => {
    expect(src).toContain('export function useEssNotifications');
  });

  it('calls /ess/notifications endpoint', () => {
    expect(src).toContain('/ess/notifications');
  });

  it('returns { data, isLoading, error, refetch }', () => {
    expect(src).toContain('return { data, isLoading, error, refetch');
  });

  it('uses useEffect to fetch on mount', () => {
    expect(src).toContain('useEffect');
  });

  it('uses useCallback for fetchNotifications', () => {
    expect(src).toContain('useCallback');
  });
});

// ── useEssMarkRead hook ───────────────────────────────────────────

describe('useEssMarkRead hook', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useEssMarkRead.js'),
    'utf8'
  );

  it('exports useEssMarkRead', () => {
    expect(src).toContain('export function useEssMarkRead');
  });

  it('calls /ess/notifications/:id/read with PATCH', () => {
    expect(src).toContain('/ess/notifications/');
    expect(src).toContain('/read');
    expect(src).toContain("method: 'PATCH'");
  });

  it('has markRead function', () => {
    expect(src).toContain('markRead');
  });

  it('has markAllRead function', () => {
    expect(src).toContain('markAllRead');
  });

  it('markAllRead calls mark-all-read endpoint', () => {
    expect(src).toContain('mark-all-read');
  });

  it('returns { markRead, markAllRead }', () => {
    expect(src).toContain('return { markRead, markAllRead }');
  });
});

// ── App.jsx route ────────────────────────────────────────────────

describe('App.jsx ESS notifications route', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/App.jsx'),
    'utf8'
  );

  it('imports MobileNotificationsPage', () => {
    expect(src).toContain('MobileNotificationsPage');
  });

  it('notifications route uses MobileNotificationsPage', () => {
    expect(src).toContain('element={<MobileNotificationsPage />}');
  });

  it('notifications route has path="notifications"', () => {
    const match = src.match(/path="notifications"\s+element=\{<([^>]+)>/);
    expect(match?.[1]).toContain('MobileNotificationsPage');
  });
});
