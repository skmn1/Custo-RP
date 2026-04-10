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
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--mobile-bg)]/80 backdrop-blur-lg border-t border-[var(--mobile-separator)] pb-safe"
      data-testid="mobile-tab-bar"
    >
      <div className="flex justify-around items-center h-12 max-w-lg mx-auto">
        {TAB_ITEMS.map(({ id, label, icon: Icon, to }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={id}
              to={to}
              onClick={(e) => handleTabClick(to, e)}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full"
              aria-current={isActive ? 'page' : undefined}
              data-testid={`mobile-tab-${id}`}
            >
              <Icon
                className={`h-6 w-6 transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--mobile-tint)]'
                    : 'text-[var(--mobile-label-tertiary)]'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--mobile-tint)]'
                    : 'text-[var(--mobile-label-tertiary)]'
                }`}
              >
                {t(label)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
