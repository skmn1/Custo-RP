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
      {/* SVG grain filter — zero-size, aria-hidden, no layout impact.
          Applied to .mobile-section-header via the .mobile-grain class. */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="mobile-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"
                          stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto pb-20" data-testid="mobile-content">
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
