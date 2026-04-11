import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useEssDashboard } from '../../hooks/useEssDashboard';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import StaleDataIndicator from '../../components/ess/StaleDataIndicator';
import EssOfflineFallback from '../../components/ess/EssOfflineFallback';
import WelcomeHeader from '../../components/ess/dashboard/WelcomeHeader';
import QuickStats from '../../components/ess/dashboard/QuickStats';
import UpcomingShiftsWidget from '../../components/ess/dashboard/UpcomingShiftsWidget';
import NotificationsWidget from '../../components/ess/dashboard/NotificationsWidget';
import LatestPayslipWidget from '../../components/ess/dashboard/LatestPayslipWidget';
import ProfileWidget from '../../components/ess/dashboard/ProfileWidget';
import QuickAccessBar from '../../components/ess/dashboard/QuickAccessBar';
import MobileDashboard from '../../components/ess/dashboard/MobileDashboard';
import { MobileDashboardPage } from '../ess/mobile/MobileDashboardPage';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const EssDashboardPage = () => {
  const { t } = useTranslation('ess');
  const { user } = useAuth();
  const { dashboard, notifications, isLoading, error, refetch } = useEssDashboard();
  const { isOnline } = useEssConnectivity();
  const isMobile = useMobileLayout();

  // Task 80: Nexus Kinetic Nexus Kinetic mobile dashboard replaces task-65 cold-palette version
  if (isMobile) return <MobileDashboardPage />;

  const firstName = dashboard?.greeting?.firstName || user?.firstName || '';
  const photoUrl = dashboard?.greeting?.photoUrl || null;
  const isCached = dashboard?.__swCacheHit === true;
  const fetchedAt = dashboard?.__swFetchedAt ?? null;

  // No data and offline — show fallback
  if (!isOnline && !dashboard && !isLoading) {
    return <EssOfflineFallback />;
  }

  // Full error — retry page
  if (error && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 mb-4">{t('dashboard.unableToLoad')}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {t('dashboard.retry')}
        </button>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const d = dashboard || {};

  return (
    <div className="space-y-6">
      <WelcomeHeader firstName={firstName} photoUrl={photoUrl} />
      <StaleDataIndicator isCached={isCached} fetchedAt={fetchedAt} />

      <QuickStats
        shifts={d.upcomingShifts}
        payslip={d.latestPayslip}
        attendance={d.attendance}
        restricted={d.payslipRestricted}
      />

      {/* Widget Grid — 2-column on desktop, single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingShiftsWidget
          shifts={d.upcomingShifts}
          error={d.upcomingShifts === undefined && error}
        />
        <NotificationsWidget
          notifications={notifications}
          unreadCount={d.unreadNotifications}
          error={notifications === undefined && error}
        />
        <LatestPayslipWidget
          payslip={d.latestPayslip}
          restricted={d.payslipRestricted}
          error={d.latestPayslip === undefined && !d.payslipRestricted && error}
        />
        <ProfileWidget
          completeness={d.profileCompletenessPct}
          pendingRequests={d.pendingProfileRequests}
          error={d.profileCompletenessPct === undefined && error}
        />
      </div>

      <QuickAccessBar />
    </div>
  );
};

export default EssDashboardPage;
