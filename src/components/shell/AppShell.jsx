import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { BreadcrumbProvider } from '../../hooks/useBreadcrumb';
import { getAppById } from '../../apps/registry';
import { getAppColor } from '../../apps/colors';
import GlobalTopBar from './GlobalTopBar';
import AppSidebar from './AppSidebar';
import AppGuard from './AppGuard';

const SIDEBAR_KEY = 'app-sidebar-collapsed';

/**
 * App shell layout.
 * Renders GlobalTopBar + AppSidebar + scrollable main content.
 *
 * @param {string} appId        — App id from registry
 * @param {Array}  sidebarItems — Nav items for the sidebar
 */
const AppShell = ({ appId, sidebarItems = [] }) => {
  const app = getAppById(appId);
  const appColor = app ? getAppColor(app.color) : null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Set CSS custom property for app color
  useEffect(() => {
    if (appColor?.css) {
      document.documentElement.style.setProperty('--app-color', appColor.css);
    }
    return () => {
      document.documentElement.style.removeProperty('--app-color');
    };
  }, [appColor]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [appId]);

  return (
    <AppGuard appId={appId}>
      <BreadcrumbProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <GlobalTopBar
            appId={appId}
            onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          {/* Desktop sidebar */}
          <AppSidebar
            appId={appId}
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />

          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
                aria-hidden="true"
              />
              <AppSidebar
                appId={appId}
                items={sidebarItems}
                collapsed={false}
                onToggle={() => setMobileSidebarOpen(false)}
                mobile
              />
            </>
          )}

          {/* Main content */}
          <main
            className={`pt-14 transition-all duration-200 ${
              sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
            }`}
          >
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </BreadcrumbProvider>
    </AppGuard>
  );
};

export default AppShell;
