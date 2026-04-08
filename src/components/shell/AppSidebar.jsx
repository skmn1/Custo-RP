import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { getAppById } from '../../apps/registry';
import { getIconComponent } from '../../apps/icons';
import { getAppColor } from '../../apps/colors';

/**
 * Sidebar navigation for the currently active app.
 *
 * @param {string}   appId     — Current app ID from registry
 * @param {Array}    items     — Nav items array: { label, icon, to, roles?, children? }
 * @param {boolean}  collapsed — Whether sidebar is in icon-only mode
 * @param {function} onToggle  — Callback to toggle collapsed state
 * @param {ReactNode} headerSlot — Optional slot rendered below the app header
 */
const AppSidebar = ({ appId, items = [], collapsed, onToggle, mobile = false, headerSlot }) => {
  const { t } = useTranslation(['apps', 'pos']);
  const { user } = useAuth();
  const location = useLocation();

  const app = getAppById(appId);
  const AppIcon = app ? getIconComponent(app.icon, 'solid') : null;
  const appColor = app ? getAppColor(app.color) : null;

  // Filter items by role
  const visibleItems = items.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <aside
      className={`${
        mobile
          ? 'fixed top-14 left-0 bottom-0 z-40 w-60 lg:hidden'
          : `fixed top-14 left-0 bottom-0 z-30 hidden lg:flex ${collapsed ? 'w-16' : 'w-60'}`
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 flex flex-col`}
    >
      {/* App header */}
      {!collapsed && app && appColor && (
        <div className={`px-4 py-4 border-b border-gray-100 dark:border-gray-800`}>
          <div className="flex items-center gap-2.5">
            {AppIcon && (
              <div className={`w-8 h-8 rounded-lg ${appColor.bg} dark:bg-opacity-20 flex items-center justify-center shrink-0`}>
                <AppIcon className={`w-5 h-5 ${appColor.text}`} aria-hidden="true" />
              </div>
            )}
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t(`apps:${app.name}.name`)}
            </span>
          </div>
        </div>
      )}

      {/* Optional header slot (e.g. terminal selector) */}
      {headerSlot}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Sidebar">
        <ul className="space-y-0.5">
          {visibleItems.map((item, idx) => (
            <SidebarItem
              key={idx}
              item={item}
              collapsed={collapsed}
              appColor={appColor}
              currentPath={location.pathname}
            />
          ))}
        </ul>
      </nav>

      {/* User mini-card */}
      {!collapsed && user && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                {`${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-2">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? t('apps:sidebar.expand') : t('apps:sidebar.collapse')}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

/**
 * Individual sidebar nav item with optional children (one level).
 */
const SidebarItem = ({ item, collapsed, appColor, currentPath }) => {
  const { t } = useTranslation(['apps']);
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon ? getIconComponent(item.icon, 'outline') : null;
  const SolidIcon = item.icon ? getIconComponent(item.icon, 'solid') : null;

  const isActive = item.to ? currentPath === item.to || currentPath.startsWith(item.to + '/') : false;
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if a child is active
  const childActive = hasChildren && item.children.some(
    (child) => currentPath === child.to || currentPath.startsWith(child.to + '/')
  );

  const ActiveIcon = isActive && SolidIcon ? SolidIcon : Icon;

  if (hasChildren) {
    const isOpen = expanded || childActive;
    return (
      <li>
        <button
          type="button"
          onClick={() => setExpanded(!isOpen)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            childActive
              ? `${appColor?.bg || 'bg-indigo-50'} ${appColor?.text || 'text-indigo-600'} font-medium`
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? t(item.label) : undefined}
        >
          {ActiveIcon && <ActiveIcon className={`w-5 h-5 shrink-0 ${childActive ? appColor?.text || '' : ''}`} />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{t(item.label)}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {isOpen && !collapsed && (
          <ul className="ml-8 mt-0.5 space-y-0.5">
            {item.children.map((child, idx) => (
              <SidebarItem
                key={idx}
                item={child}
                collapsed={false}
                appColor={appColor}
                currentPath={currentPath}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? `${appColor?.bg || 'bg-indigo-50'} ${appColor?.text || 'text-indigo-600'} font-medium`
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
        } ${collapsed ? 'justify-center px-0' : ''}`}
        title={collapsed ? t(item.label) : undefined}
      >
        {ActiveIcon && <ActiveIcon className={`w-5 h-5 shrink-0 ${isActive ? appColor?.text || '' : ''}`} />}
        {!collapsed && <span className="truncate">{t(item.label)}</span>}
      </NavLink>
    </li>
  );
};

export default AppSidebar;
