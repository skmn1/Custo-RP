import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import useLocale from '../hooks/useLocale';
import { useAuth } from '../hooks/useAuth';

const LanguageSwitcher = ({ className = '' }) => {
  const { t } = useTranslation(['common']);
  const { language, setLocale } = useLocale();
  const isFr = language === 'fr';
  return (
    <div
      className={`inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5 ${className}`}
      role="group"
      aria-label={t('common:nav.language')}
    >
      <button
        type="button"
        onClick={() => setLocale('fr')}
        aria-pressed={isFr}
        aria-label={t('common:nav.switchToFrench')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
          isFr ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={!isFr}
        aria-label={t('common:nav.switchToEnglish')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
          !isFr ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'auth']);
  const { user, logout } = useAuth();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Derive the active view from the current URL pathname
  const currentView = (() => {
    const path = location.pathname;
    if (path.startsWith('/pos')) return 'pos';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/scheduler')) return 'scheduler';
    if (path.startsWith('/employees')) return 'employees';
    if (path.startsWith('/payroll')) return 'payroll';
    return 'scheduler';
  })();

  const setCurrentView = (viewId) => {
    const routes = {
      dashboard: '/dashboard',
      scheduler: '/scheduler',
      employees: '/employees',
      payroll: '/payroll',
      pos: '/pos',
    };
    navigate(routes[viewId] || '/scheduler');
  };

  const navItems = [
    { id: 'pos', labelKey: 'common:nav.pos', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', badge: null },
    { id: 'scheduler', labelKey: 'common:nav.scheduler', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: null },
    { id: 'employees', labelKey: 'common:nav.employees', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', badge: null },
    { id: 'payroll', labelKey: 'common:nav.payroll', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', badge: null },
    { id: 'shifts', labelKey: 'common:nav.shifts', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', badge: null },
    { id: 'reports', labelKey: 'common:nav.reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: '3' },
    { id: 'settings', labelKey: 'common:nav.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', badge: null },
    { id: 'dashboard', labelKey: 'common:nav.dashboard', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z', badge: null },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                {t('common:app.name')}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  data-nav-item={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`${
                    currentView === item.id
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                  } inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 group`}
                >
                  <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {t(item.labelKey)}
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher className="mr-2" />
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                aria-label={t('common:nav.profile')}
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-700">
                  {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '??'}
                </div>
                <span className="text-sm font-medium hidden lg:block">
                  {user ? `${user.firstName} ${user.lastName}` : ''}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('auth:logout.button')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-7 w-7 transition-transform duration-300`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-7 w-7 transition-transform duration-300 rotate-180`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-100`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              data-nav-item={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`${
                currentView === item.id
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } w-full text-left flex items-center px-3 py-2 border-l-4 text-base font-medium transition-all duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {t(item.labelKey)}
              {item.badge && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-3 px-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('common:nav.language')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
