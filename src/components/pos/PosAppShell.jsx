import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { BreadcrumbProvider } from '../../hooks/useBreadcrumb';
import { getAppById } from '../../apps/registry';
import { getAppColor } from '../../apps/colors';
import GlobalTopBar from '../shell/GlobalTopBar';
import AppSidebar from '../shell/AppSidebar';
import AppGuard from '../shell/AppGuard';
import PosLocationSelector from './PosLocationSelector';
import { PosLocationProvider } from '../../hooks/usePosLocation';
import { useAuth } from '../../hooks/useAuth';

const SIDEBAR_KEY = 'app-sidebar-collapsed';

/**
 * Custom app shell for the PoS app.
 * Wraps content in PosLocationProvider and injects PosLocationSelector into the sidebar.
 * Provides a grouped sidebar: Sales, Operations, People, Finance.
 */
const PosAppShell = () => {
  const app = getAppById('pos');
  const appColor = app ? getAppColor(app.color) : null;
  const { posLocationId } = useParams();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

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

  useEffect(() => {
    if (appColor?.css) {
      document.documentElement.style.setProperty('--app-color', appColor.css);
    }
    return () => {
      document.documentElement.style.removeProperty('--app-color');
    };
  }, [appColor]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [posLocationId]);

  // Dynamic sidebar items scoped to the selected PoS location and role
  const sidebarItems = useMemo(() => {
    const locationsLabel = isSuperAdmin
      ? 'pos:sidebar.allTerminals'
      : 'pos:sidebar.myTerminals';

    const items = [
      { label: locationsLabel, icon: 'ShoppingCartIcon', to: '/app/pos' },
    ];

    if (posLocationId) {
      items.push(
        { label: 'pos:sidebar.dashboard', icon: 'Squares2X2Icon', to: `/app/pos/${posLocationId}/dashboard` },
        { label: 'pos:sidebar.terminal', icon: 'BuildingStorefrontIcon', to: `/app/pos/${posLocationId}/detail` },
        { label: 'pos:sidebar.stockLookup', icon: 'ArchiveBoxIcon', to: `/app/pos/${posLocationId}/stock` },
        { label: 'pos:sidebar.reports', icon: 'ChartBarIcon', to: `/app/pos/${posLocationId}/reports` },
      );
    }

    if (isSuperAdmin) {
      items.push(
        { label: 'pos:sidebar.manageAccess', icon: 'UsersIcon', to: '/app/pos/admin/assignments' },
      );
    }

    return items;
  }, [posLocationId, isSuperAdmin]);

  return (
    <AppGuard appId="pos">
      <PosLocationProvider>
        <BreadcrumbProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <GlobalTopBar
              appId="pos"
              onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            />

            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <AppSidebar
                appId="pos"
                items={sidebarItems}
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                headerSlot={<PosLocationSelector collapsed={sidebarCollapsed} />}
              />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-hidden="true"
                />
                <AppSidebar
                  appId="pos"
                  items={sidebarItems}
                  collapsed={false}
                  onToggle={() => setMobileSidebarOpen(false)}
                  mobile
                  headerSlot={<PosLocationSelector collapsed={false} />}
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
      </PosLocationProvider>
    </AppGuard>
  );
};

export default PosAppShell;
