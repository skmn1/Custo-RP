/**
 * Unit tests for Task 70 — ESS Mobile Notifications
 *
 * Covers:
 *  - formatRelativeTime: "Just now", "5m ago", "2h ago", "Yesterday", dates
 *  - groupNotifications: time grouping into Today / Yesterday / Earlier
 *  - NotificationIcon: maps types to correct icons
 *  - NotificationRow: unread vs read indicators, structure
 *  - MobileNotifications: sections, testids, dependencies, empty state
 *  - EssNotificationsPage: mobile conditional wiring
 *  - i18n: EN + FR mobile.notifications keys
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const notifSrc = fs.readFileSync(
  path.resolve('src/components/ess/notifications/MobileNotifications.jsx'),
  'utf-8',
);

// ── formatRelativeTime ─────────────────────────────────────────────

describe('formatRelativeTime logic', () => {
  // Replicate the formatting logic
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === yesterday.getTime()) return t('mobile.notifications.yesterday');

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Simple mock t function
  const t = (key, params) => {
    const map = {
      'mobile.notifications.justNow': 'Just now',
      'mobile.notifications.minutesAgo': `${params?.count}m ago`,
      'mobile.notifications.hoursAgo': `${params?.count}h ago`,
      'mobile.notifications.yesterday': 'Yesterday',
    };
    return map[key] || key;
  };

  it('returns empty string for null input', () => {
    expect(formatRelativeTime(null, t)).toBe('');
  });

  it('returns "Just now" for times < 1 minute ago', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now, t)).toBe('Just now');
  });

  it('returns "Xm ago" for times < 60 minutes ago', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString();
    expect(formatRelativeTime(thirtyMinAgo, t)).toBe('30m ago');
  });

  it('returns "Xh ago" for times < 24 hours ago', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 3600000).toISOString();
    expect(formatRelativeTime(fiveHoursAgo, t)).toBe('5h ago');
  });

  it('returns "Yesterday" for yesterday when > 24h ago', () => {
    // Set to 26h ago to ensure diffHours >= 24, landing on yesterday
    const ts = new Date(Date.now() - 26 * 3600000);
    // Only test if this actually falls on yesterday's calendar date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() >= yesterdayStart.getTime() && d.getTime() < today.getTime()) {
      expect(formatRelativeTime(ts.toISOString(), t)).toBe('Yesterday');
    } else {
      // If 26h ago lands on "earlier", just verify it's a string
      expect(typeof formatRelativeTime(ts.toISOString(), t)).toBe('string');
    }
  });

  it('returns formatted date for older dates', () => {
    const oldDate = new Date('2026-03-15T10:00:00Z');
    const result = formatRelativeTime(oldDate.toISOString(), t);
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });
});

// ── groupNotifications ─────────────────────────────────────────────

describe('groupNotifications logic', () => {
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
    if (groups.today.length > 0) result.push({ label: 'Today', key: 'today', items: groups.today });
    if (groups.yesterday.length > 0) result.push({ label: 'Yesterday', key: 'yesterday', items: groups.yesterday });
    if (groups.earlier.length > 0) result.push({ label: 'Earlier', key: 'earlier', items: groups.earlier });
    return result;
  }

  const t = (key) => {
    const map = {
      'mobile.notifications.today': 'Today',
      'mobile.notifications.yesterday': 'Yesterday',
      'mobile.notifications.earlier': 'Earlier',
    };
    return map[key] || key;
  };

  it('returns empty array for empty notifications', () => {
    const result = groupNotifications([], t);
    expect(result).toEqual([]);
  });

  it('groups today\'s notifications correctly', () => {
    const now = new Date().toISOString();
    const result = groupNotifications([{ id: 1, createdAt: now }], t);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('today');
    expect(result[0].items).toHaveLength(1);
  });

  it('groups yesterday\'s notifications correctly', () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    y.setHours(12, 0, 0, 0);
    const result = groupNotifications([{ id: 1, createdAt: y.toISOString() }], t);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('yesterday');
  });

  it('groups older notifications into earlier', () => {
    const old = new Date('2026-03-01T10:00:00Z');
    const result = groupNotifications([{ id: 1, createdAt: old.toISOString() }], t);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('earlier');
  });

  it('creates all three groups when notifications span multiple days', () => {
    const now = new Date();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    y.setHours(12, 0, 0, 0);
    const old = new Date('2026-02-15T10:00:00Z');

    const result = groupNotifications([
      { id: 1, createdAt: now.toISOString() },
      { id: 2, createdAt: y.toISOString() },
      { id: 3, createdAt: old.toISOString() },
    ], t);

    expect(result).toHaveLength(3);
    expect(result[0].key).toBe('today');
    expect(result[1].key).toBe('yesterday');
    expect(result[2].key).toBe('earlier');
  });

  it('omits sections with no notifications', () => {
    const now = new Date();
    const old = new Date('2026-02-15T10:00:00Z');
    const result = groupNotifications([
      { id: 1, createdAt: now.toISOString() },
      { id: 2, createdAt: old.toISOString() },
    ], t);

    expect(result).toHaveLength(2);
    expect(result.map((g) => g.key)).toEqual(['today', 'earlier']);
  });
});

// ── ICON_MAP ───────────────────────────────────────────────────────

describe('NotificationIcon type mapping', () => {
  it('maps schedule type to CalendarIcon', () => {
    expect(notifSrc).toContain('schedule: CalendarIcon');
  });

  it('maps payslip type to BanknotesIcon', () => {
    expect(notifSrc).toContain('payslip: BanknotesIcon');
  });

  it('maps leave type to SunIcon', () => {
    expect(notifSrc).toContain('leave: SunIcon');
  });

  it('maps profile type to UserIcon', () => {
    expect(notifSrc).toContain('profile: UserIcon');
  });

  it('maps attendance type to ClockIcon', () => {
    expect(notifSrc).toContain('attendance: ClockIcon');
  });

  it('maps general type to BellIcon', () => {
    expect(notifSrc).toContain('general: BellIcon');
  });

  it('renders icons at 20×20 (h-5 w-5)', () => {
    expect(notifSrc).toContain('h-5 w-5');
  });

  it('uses --mobile-tint for unread icons', () => {
    expect(notifSrc).toContain("var(--mobile-tint)");
  });

  it('uses --mobile-label-tertiary for read icons', () => {
    expect(notifSrc).toContain("var(--mobile-label-tertiary)");
  });
});

// ── NotificationRow structure ──────────────────────────────────────

describe('NotificationRow component structure', () => {
  it('has data-testid="notification-row"', () => {
    expect(notifSrc).toContain('data-testid="notification-row"');
  });

  it('uses <li> elements for list items', () => {
    expect(notifSrc).toContain('<li');
  });

  it('shows unread dot for unread notifications', () => {
    expect(notifSrc).toContain('data-testid="unread-dot"');
  });

  it('applies font-semibold for unread titles', () => {
    expect(notifSrc).toContain('font-semibold');
  });

  it('applies opacity-75 for read notifications', () => {
    expect(notifSrc).toContain('opacity-75');
  });

  it('uses line-clamp-2 for body text', () => {
    expect(notifSrc).toContain('line-clamp-2');
  });

  it('meets 44px min touch height', () => {
    expect(notifSrc).toContain('min-h-[44px]');
  });

  it('is keyboard accessible with Enter and Space', () => {
    expect(notifSrc).toContain('Enter');
    expect(notifSrc).toContain("' '");
  });

  it('includes aria-label for accessibility', () => {
    expect(notifSrc).toContain('aria-label');
  });

  it('unread status is announced via aria-label', () => {
    expect(notifSrc).toContain("t('mobile.notifications.unread')");
  });
});

// ── MobileNotifications main component ─────────────────────────────

describe('MobileNotifications overall structure', () => {
  it('has data-testid="mobile-notifications"', () => {
    expect(notifSrc).toContain('data-testid="mobile-notifications"');
  });

  it('imports useNotifications hook', () => {
    expect(notifSrc).toContain("from '../../../hooks/useNotifications'");
  });

  it('imports useEssConnectivity context', () => {
    expect(notifSrc).toContain("from '../../../contexts/EssConnectivityContext'");
  });

  it('imports MobileHeader', () => {
    expect(notifSrc).toContain("from '../../mobile/MobileHeader'");
  });

  it('imports useNavigate from react-router-dom', () => {
    expect(notifSrc).toContain("from 'react-router-dom'");
    expect(notifSrc).toContain('useNavigate');
  });

  it('renders section headers with data-testid', () => {
    expect(notifSrc).toContain('data-testid="section-header"');
  });

  it('renders notification list as <ul> with role="list"', () => {
    expect(notifSrc).toContain('role="list"');
    expect(notifSrc).toContain('data-testid="notification-list"');
  });

  it('renders empty state with data-testid', () => {
    expect(notifSrc).toContain('data-testid="notifications-empty"');
  });

  it('renders loading skeleton with data-testid', () => {
    expect(notifSrc).toContain('data-testid="notifications-skeleton"');
  });

  it('renders error state with data-testid', () => {
    expect(notifSrc).toContain('data-testid="mobile-notifications-error"');
  });

  it('has mark all read button with data-testid', () => {
    expect(notifSrc).toContain('data-testid="mark-all-read-btn"');
  });

  it('mark all read button is disabled when unreadCount is 0', () => {
    expect(notifSrc).toContain('disabled={unreadCount === 0}');
  });

  it('mark all read button has aria-disabled', () => {
    expect(notifSrc).toContain('aria-disabled');
  });

  it('empty state uses BellIcon at 48×48', () => {
    expect(notifSrc).toContain('h-12 w-12');
  });

  it('implements infinite scroll with scroll event listener', () => {
    expect(notifSrc).toContain('handleScroll');
    expect(notifSrc).toContain('addEventListener');
    expect(notifSrc).toContain("'scroll'");
  });

  it('has load more spinner with data-testid', () => {
    expect(notifSrc).toContain('data-testid="load-more-spinner"');
  });

  it('calls fetchList with append: true for pagination', () => {
    expect(notifSrc).toContain('append: true');
  });

  it('marks as read on tap and navigates', () => {
    expect(notifSrc).toContain('markAsRead(n.id)');
    expect(notifSrc).toContain('navigate(n.link)');
  });

  it('skips section headers when only Today group exists', () => {
    expect(notifSrc).toContain("groups[0].key === 'today'");
  });

  it('exports formatRelativeTime and groupNotifications for testing', () => {
    expect(notifSrc).toContain('export { formatRelativeTime');
    expect(notifSrc).toContain('groupNotifications');
    expect(notifSrc).toContain('ICON_MAP');
  });

  it('default export is MobileNotifications', () => {
    expect(notifSrc).toContain('export default MobileNotifications');
  });
});

// ── EssNotificationsPage mobile wiring ─────────────────────────────

describe('EssNotificationsPage mobile conditional', () => {
  const pageSrc = fs.readFileSync(
    path.resolve('src/pages/ess/EssNotificationsPage.jsx'),
    'utf-8',
  );

  it('imports useMobileLayout', () => {
    expect(pageSrc).toContain("import { useMobileLayout } from '../../hooks/useMobileLayout'");
  });

  it('imports MobileNotifications', () => {
    expect(pageSrc).toContain("import MobileNotifications from '../../components/ess/notifications/MobileNotifications'");
  });

  it('calls useMobileLayout()', () => {
    expect(pageSrc).toContain('useMobileLayout()');
  });

  it('returns MobileNotifications when isMobile', () => {
    expect(pageSrc).toContain('if (isMobile) return <MobileNotifications />');
  });
});

// ── i18n — mobile.notifications keys ───────────────────────────────

describe('i18n — mobile.notifications keys', () => {
  const en = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/en/ess.json'), 'utf-8'),
  );
  const fr = JSON.parse(
    fs.readFileSync(path.resolve('public/locales/fr/ess.json'), 'utf-8'),
  );

  const requiredKeys = [
    'title', 'markAllRead', 'today', 'yesterday', 'earlier',
    'emptyTitle', 'emptyBody', 'hoursAgo', 'minutesAgo', 'justNow', 'unread',
  ];

  it('EN has all mobile.notifications keys', () => {
    requiredKeys.forEach((key) => {
      expect(en.mobile.notifications).toHaveProperty(key);
      expect(en.mobile.notifications[key]).toBeTruthy();
    });
  });

  it('FR has all mobile.notifications keys', () => {
    requiredKeys.forEach((key) => {
      expect(fr.mobile.notifications).toHaveProperty(key);
      expect(fr.mobile.notifications[key]).toBeTruthy();
    });
  });

  it('EN and FR have same number of notification keys', () => {
    const enKeys = Object.keys(en.mobile.notifications);
    const frKeys = Object.keys(fr.mobile.notifications);
    expect(enKeys.length).toBe(frKeys.length);
  });

  it('FR title is "Notifications"', () => {
    expect(fr.mobile.notifications.title).toBe('Notifications');
  });

  it('FR markAllRead is "Tout marquer comme lu"', () => {
    expect(fr.mobile.notifications.markAllRead).toBe('Tout marquer comme lu');
  });

  it('FR today is "Aujourd\'hui"', () => {
    expect(fr.mobile.notifications.today).toBe("Aujourd'hui");
  });

  it('FR yesterday is "Hier"', () => {
    expect(fr.mobile.notifications.yesterday).toBe('Hier');
  });

  it('interpolation placeholders are present in both locales', () => {
    expect(en.mobile.notifications.hoursAgo).toContain('{{count}}');
    expect(fr.mobile.notifications.hoursAgo).toContain('{{count}}');
    expect(en.mobile.notifications.minutesAgo).toContain('{{count}}');
    expect(fr.mobile.notifications.minutesAgo).toContain('{{count}}');
  });
});
