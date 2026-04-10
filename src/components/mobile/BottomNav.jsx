/**
 * BottomNav — Task 64 (B.2)
 *
 * Fixed bottom tab bar with 5 primary tabs. Uses frosted-glass background,
 * brand tint for active state, and respects safe area insets via pb-safe.
 * Tapping the already-active tab scrolls content to top (iOS convention).
 */
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { QueuedBadge } from './MobileOfflineIndicators';

const TAB_ITEMS = [
  { id: 'dashboard',  label: 'mobile.nav.dashboard',  icon: HomeIcon,          to: '/app/ess/dashboard' },
  { id: 'schedule',   label: 'mobile.nav.schedule',   icon: CalendarDaysIcon,  to: '/app/ess/schedule' },
  { id: 'payslips',   label: 'mobile.nav.payslips',   icon: DocumentTextIcon,  to: '/app/ess/payslips' },
  { id: 'attendance', label: 'mobile.nav.attendance',  icon: ClockIcon,         to: '/app/ess/attendance' },
  { id: 'profile',    label: 'mobile.nav.profile',    icon: UserCircleIcon,    to: '/app/ess/profile' },
];

export const BottomNav = () => {
  const { t } = useTranslation('ess');
  const location = useLocation();

  const handleTabClick = (to, e) => {
    if (location.pathname.startsWith(to)) {
      e.preventDefault();
      document.querySelector('[data-testid="mobile-content"]')?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      role="navigation"
      aria-label={t('mobile.nav.label')}
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        backgroundColor: 'var(--mobile-tab-bg)',
        borderTop: '1px solid var(--mobile-tab-border)',
      }}
      data-testid="mobile-tab-bar"
    >
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {TAB_ITEMS.map(({ id, label, icon: Icon, to }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={id}
              to={to}
              onClick={(e) => handleTabClick(to, e)}
              className="relative flex flex-col items-center justify-center flex-1 min-h-[44px]"
              aria-label={t(label)}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`mobile-tab-${id}`}
            >
              {id === 'profile' && <QueuedBadge />}
              {/* Soft pill behind the active icon */}
              {isActive && (
                <span
                  className="absolute top-1 h-9 w-11 rounded-full"
                  style={{ backgroundColor: 'var(--mobile-tab-active-pill)' }}
                />
              )}
              <Icon
                className="h-6 w-6 relative z-10 transition-colors duration-150"
                style={{
                  color: isActive
                    ? 'var(--mobile-tab-active-icon)'
                    : 'var(--mobile-tab-inactive)',
                }}
              />
              {/* Label visible only for active tab */}
              {isActive && (
                <span
                  className="text-[11px] font-semibold mt-0.5 leading-none"
                  style={{ color: 'var(--mobile-tab-active-label)' }}
                >
                  {t(label)}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
