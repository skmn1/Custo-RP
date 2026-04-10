/**
 * MobileShell — Task 63 (D.2)
 *
 * Mobile-specific app shell that replaces AppShell on <1024px viewports.
 * Provides a bottom tab bar + scrollable content area.
 * The system font stack is applied at this root level.
 */
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ClockIcon as ClockIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';
import '../../styles/mobile.css';

const tabs = [
  { to: '/app/ess/dashboard',  labelKey: 'ess:nav.dashboard',  Icon: HomeIcon,           IconActive: HomeIconSolid },
  { to: '/app/ess/schedule',   labelKey: 'ess:nav.schedule',   Icon: CalendarDaysIcon,   IconActive: CalendarDaysIconSolid },
  { to: '/app/ess/payslips',   labelKey: 'ess:nav.payslips',   Icon: DocumentTextIcon,   IconActive: DocumentTextIconSolid },
  { to: '/app/ess/attendance', labelKey: 'ess:nav.attendance', Icon: ClockIcon,          IconActive: ClockIconSolid },
  { to: '/app/ess/profile',    labelKey: 'ess:nav.profile',    Icon: UserCircleIcon,     IconActive: UserCircleIconSolid },
];

const MobileShell = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div
      className="font-system min-h-screen bg-[var(--mobile-bg)] text-[var(--mobile-label-primary)]"
      data-testid="mobile-shell"
    >
      {/* Scrollable page content — padded at bottom for tab bar */}
      <main className="pb-20 pt-safe">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--mobile-bg-elevated)] border-t border-[var(--mobile-separator)] pb-safe"
        data-testid="mobile-tab-bar"
        role="tablist"
        aria-label={t('ess:nav.dashboard')}
      >
        <div className="flex items-center justify-around h-12">
          {tabs.map(({ to, labelKey, Icon, IconActive }) => {
            const isActive =
              location.pathname === to ||
              (to !== '/app/ess/dashboard' && location.pathname.startsWith(to));

            return (
              <NavLink
                key={to}
                to={to}
                role="tab"
                aria-selected={isActive}
                className="flex flex-col items-center justify-center flex-1 h-full touch-target"
              >
                {isActive ? (
                  <IconActive className="h-6 w-6 text-[var(--mobile-tint)]" />
                ) : (
                  <Icon className="h-6 w-6 text-[var(--mobile-label-tertiary)]" />
                )}
                <span
                  className={`text-[10px] mt-0.5 ${
                    isActive
                      ? 'text-[var(--mobile-tint)] font-medium'
                      : 'text-[var(--mobile-label-tertiary)]'
                  }`}
                >
                  {t(labelKey)}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileShell;
