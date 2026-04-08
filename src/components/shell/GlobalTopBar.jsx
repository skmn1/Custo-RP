import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Squares2X2Icon, BellIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import { getAppById } from '../../apps/registry';
import { getIconComponent } from '../../apps/icons';
import { getAppColor } from '../../apps/colors';
import AppSwitcher from './AppSwitcher';

/**
 * Global top bar — persistent across all app pages.
 *
 * Left:   Company logo/name | separator | current app badge | app-switcher button
 * Center: Breadcrumb (if set by the active page)
 * Right:  Notification bell | User avatar + menu
 */
const GlobalTopBar = ({ appId, onToggleSidebar }) => {
  const { t, i18n } = useTranslation(['apps', 'common']);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { appSettings } = useSettings();
  const { breadcrumbs } = useBreadcrumb();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const app = getAppById(appId);
  const AppIcon = app ? getIconComponent(app.icon, 'solid') : null;
  const appColor = app ? getAppColor(app.color) : null;
  const companyName = appSettings?.general?.companyName || 'Staff Scheduler Pro';

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLanguage = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40 flex items-center px-4 gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Company name */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="hidden md:inline">{companyName}</span>
        </button>

        {/* Separator */}
        {app && <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />}

        {/* Current app badge */}
        {app && appColor && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${appColor.bg} dark:bg-opacity-20`}>
            {AppIcon && <AppIcon className={`w-4 h-4 ${appColor.text}`} aria-hidden="true" />}
            <span className={`text-sm font-medium ${appColor.text}`}>
              {t(`apps:${app.name}.name`)}
            </span>
          </div>
        )}

        {/* App switcher button */}
        <button
          type="button"
          onClick={() => setSwitcherOpen(!switcherOpen)}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t('apps:topbar.openSwitcher')}
          aria-expanded={switcherOpen}
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>

        {/* Center: Breadcrumb */}
        <div className="flex-1 hidden md:flex items-center justify-center gap-1 min-w-0">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
              {item.to ? (
                <button
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 truncate"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Spacer when no breadcrumbs */}
        {breadcrumbs.length === 0 && <div className="flex-1" />}

        {/* Notification bell */}
        <button
          type="button"
          className="relative p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t('apps:topbar.notifications')}
        >
          <BellIcon className="w-5 h-5" />
        </button>

        {/* User avatar + menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('apps:topbar.userMenu')}
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{userInitials}</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.firstName || ''}
            </span>
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('apps:topbar.profile')}
              </button>
              <button
                type="button"
                onClick={() => { toggleLanguage(); setUserMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('apps:topbar.switchLanguage')} ({i18n.language === 'fr' ? 'EN' : 'FR'})
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {t('apps:topbar.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* App Switcher overlay */}
      <AppSwitcher
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
      />
    </>
  );
};

export default GlobalTopBar;
