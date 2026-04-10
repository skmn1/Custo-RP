/**
 * MobileTopBar — Task 64 (A.2)
 *
 * Sticky top bar with frosted-glass effect. Shows the app name on the left
 * and a notification bell with unread badge on the right.
 * Clears the status bar / notch via pt-safe.
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellIcon } from '@heroicons/react/24/outline';
import { useEssNotificationCount } from '../../hooks/useEssNotificationCount';

export const MobileTopBar = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();
  const { unreadCount } = useEssNotificationCount();

  return (
    <div
      className="sticky top-0 z-40 bg-[var(--mobile-bg)]/80 backdrop-blur-lg border-b border-[var(--mobile-separator)] pt-safe"
      data-testid="mobile-top-bar"
    >
      <div className="flex items-center justify-between px-4 h-11">
        <span className="text-mobile-headline text-[var(--mobile-label-primary)]">
          {t('appName')}
        </span>
        <button
          onClick={() => navigate('/app/ess/notifications')}
          className="relative touch-target flex items-center justify-center"
          aria-label={t('mobile.nav.notifications')}
          data-testid="mobile-notification-bell"
        >
          <BellIcon className="h-6 w-6 text-[var(--mobile-label-primary)]" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-mobile-caption font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              data-testid="mobile-notification-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
