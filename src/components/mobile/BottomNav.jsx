/**
 * BottomNav — Task 64 (B.2) / Task 78 (Nexus Kinetic, 4-tab)
 *
 * Fixed bottom tab bar with 4 primary tabs: Home, Schedule, Requests, Profile.
 * Frosted-glass white background, Magenta (#da336b) active state with pill bg,
 * outline Material Symbol for inactive / filled for active.
 * Permanent labels on all tabs. Safe-area inset respected via pb-safe.
 * Tapping the already-active tab scrolls content to top (iOS convention).
 */
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TAB_ITEMS = [
  { id: 'dashboard', label: 'mobile.nav.dashboard', icon: 'home',            to: '/app/ess/dashboard' },
  { id: 'schedule',  label: 'mobile.nav.schedule',  icon: 'calendar_today',  to: '/app/ess/schedule'  },
  { id: 'requests',  label: 'mobile.nav.requests',  icon: 'pending_actions', to: '/app/ess/requests'  },
  { id: 'profile',   label: 'mobile.nav.profile',   icon: 'person',          to: '/app/ess/profile'   },
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
      className="
        fixed bottom-0 left-0 w-full z-50
        flex justify-around items-center
        px-4 pt-2
        bg-white/80 backdrop-blur-md
        border-t border-zinc-200
        rounded-t-xl
        shadow-[0_-2px_10px_rgba(0,0,0,0.05)]
      "
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
      data-testid="mobile-tab-bar"
    >
      {TAB_ITEMS.map(({ id, label, icon, to }) => {
        const active = location.pathname.startsWith(to);
        return (
          <NavLink
            key={id}
            to={to}
            onClick={(e) => handleTabClick(to, e)}
            aria-current={active ? 'page' : undefined}
            data-testid={`mobile-tab-${id}`}
            className={`
              flex flex-col items-center justify-center min-h-[44px] min-w-[44px]
              transition-all duration-200 active:translate-y-0.5
              ${active
                ? 'text-[#da336b] bg-[#ffdae2] rounded-xl px-3 py-1'
                : 'text-zinc-500 hover:text-[#da336b] px-4 py-1.5'
              }
            `}
          >
            <span
              className="material-symbols-outlined mb-0.5"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="text-[11px] font-semibold tracking-wide uppercase leading-none">
              {t(label)}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
