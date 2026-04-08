import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { getAccessibleApps } from '../apps/registry';
import { appsApi } from '../api/appsApi';
import AppTile from '../components/shell/AppTile';

/**
 * Home page showing all accessible apps as a tile grid.
 */
const AppLauncherPage = () => {
  const { t } = useTranslation(['apps']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appSettings } = useSettings();

  const [badges, setBadges] = useState({});

  const apps = user ? getAccessibleApps(user.role) : [];
  const companyName = appSettings?.general?.companyName || 'Staff Scheduler Pro';

  // Fetch badge counts (non-blocking)
  useEffect(() => {
    let cancelled = false;
    appsApi.getBadges()
      .then((res) => {
        if (!cancelled && res.data) setBadges(res.data);
      })
      .catch(() => {}); // silently fail — badges are optional
    return () => { cancelled = true; };
  }, []);

  const handleTileClick = (app) => {
    navigate(app.route);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">S</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {companyName}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {t('apps:launcher.welcome', { name: user?.firstName || '' })}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {t('apps:launcher.subtitle')}
        </p>
      </div>

      {/* App grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {apps.map((app) => (
            <AppTile
              key={app.id}
              app={app}
              badge={badges[app.id]}
              onClick={handleTileClick}
            />
          ))}
        </div>

        {apps.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              {t('apps:launcher.comingSoon')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLauncherPage;
