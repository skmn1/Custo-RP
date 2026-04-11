/**
 * MobileShell — Task 63 / 64
 *
 * Mobile-specific app shell that replaces AppShell on <1024px viewports.
 * Provides a sticky top bar, scrollable content area, and fixed bottom nav.
 * Uses CSS dvh for full viewport height, with vh fallback.
 */
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { MobileTopBar } from './MobileTopBar';
import ScreenTransition from './ScreenTransition';
import { MobileOfflineBanner, useSyncToast } from './MobileOfflineIndicators';
import MobileInstallPrompt from './MobileInstallPrompt';
import { incrementVisitCount } from './MobileInstallPrompt';
import '../../styles/mobile.css';

const MobileShell = () => {
  const { toastElement } = useSyncToast();

  useEffect(() => {
    incrementVisitCount();
  }, []);

  return (
    <div
      className="flex flex-col h-screen h-[100dvh] bg-[var(--mobile-bg)] font-system"
      data-testid="mobile-shell"
    >
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto pb-32 pt-16" data-testid="mobile-content">
        {/* pt-16 clears the fixed top bar (h-16); pb-32 clears the bottom nav + safe area */}
        <ScreenTransition>
          <Outlet />
        </ScreenTransition>
      </main>
      <MobileOfflineBanner />
      <BottomNav />
      {toastElement}
      <MobileInstallPrompt />
    </div>
  );
};

export default MobileShell;
