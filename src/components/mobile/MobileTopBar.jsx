/**
 * MobileTopBar / TopAppBar — Task 64 (A.2) / Task 77 (Nexus Kinetic)
 *
 * Sticky top bar with Nexus Kinetic Magenta branding. Shows the app name
 * on the left and a Material Symbols notification bell with unread badge
 * on the right.
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEssNotificationCount } from '../../hooks/useEssNotificationCount';

export const MobileTopBar = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { unreadCount } = useEssNotificationCount();

  return (
    <header
      className="sticky top-0 z-40 pt-safe"
      style={{
        backgroundColor: 'var(--mobile-topbar-bg)',
        borderBottom: '1px solid var(--mobile-topbar-border)',
      }}
      data-testid="mobile-top-bar"
    >
      <div className="flex items-center justify-between px-4 h-11">
        <span
          className="text-mobile-headline font-semibold"
          style={{ color: 'var(--mobile-label-primary)', fontFamily: 'var(--mobile-font-headline)' }}
        >
          {t('appName')}
        </span>
        <button
          onClick={() => navigate('/app/ess/notifications')}
          className="relative touch-target flex items-center justify-center"
          aria-label={t('mobile.nav.notifications')}
          data-testid="mobile-notification-bell"
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--mobile-topbar-icon)' }}>
            notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-white text-mobile-caption font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              style={{ backgroundColor: 'var(--mobile-primary)' }}
              data-testid="mobile-notification-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

/**
 * TopAppBar — Task 77 (D.3)
 *
 * Standard top app bar for all sprint 22 screens. Shows avatar + ESS brand
 * on the left and a notification bell on the right.
 */
export const TopAppBar = ({ showNotifications = true }) => {
  const navigate = useNavigate();
  const { unreadCount } = useEssNotificationCount();

  return (
    <header className="bg-white fixed top-0 w-full z-50 border-b border-[var(--mobile-border-card)] shadow-sm flex items-center justify-between px-4 h-16">
      <div className="flex items-center gap-3">
        <h1
          className="text-xl font-extrabold tracking-tight"
          style={{ color: 'var(--mobile-primary)', fontFamily: 'var(--mobile-font-headline)' }}
        >
          ESS
        </h1>
      </div>
      {showNotifications && (
        <button
          onClick={() => navigate('/app/ess/notifications')}
          className="relative p-2 rounded-full transition-colors active:scale-95"
          style={{ color: 'var(--mobile-label-secondary)' }}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              style={{ backgroundColor: 'var(--mobile-primary)' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </header>
  );
};

export default MobileTopBar;
