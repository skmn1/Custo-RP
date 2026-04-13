import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCartIcon, MapPinIcon, PhoneIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { usePosLocation } from '../hooks/usePosLocation';
import { useAuth } from '../hooks/useAuth';

const MyPosLocationsPage = () => {
  const { t } = useTranslation(['pos', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const { posLocations, isLoading, error } = usePosLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (posLocations.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t(isSuperAdmin ? 'pos:myLocations.emptyAdmin' : 'pos:noLocationsAssigned')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t(isSuperAdmin ? 'pos:myLocations.emptyDescAdmin' : 'pos:myLocations.emptyDesc')}
        </p>
        {isSuperAdmin && (
          <Link
            to="/app/pos/admin/assignments"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <UsersIcon className="w-4 h-4" />
            {t('pos:sidebar.manageAccess')}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t(isSuperAdmin ? 'pos:allLocations' : 'pos:myLocations')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t(isSuperAdmin ? 'pos:myLocations.subtitleAdmin' : 'pos:myLocations.subtitle')}
          </p>
        </div>
        {isSuperAdmin && (
          <Link
            to="/app/pos/admin/assignments"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <UsersIcon className="w-4 h-4" />
            {t('pos:sidebar.manageAccess')}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posLocations.map((location) => (
          <button
            key={location.id}
            onClick={() => navigate(`/app/pos/${location.id}/dashboard`)}
            className="group text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                <ShoppingCartIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {location.name}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  {location.type}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {location.address && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{location.address}</span>
                </div>
              )}
              {location.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 shrink-0" />
                  <span>{location.phone}</span>
                </div>
              )}
              {location.managerName && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <span>{location.managerName}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                {t('pos:locationCard.openButton')} →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyPosLocationsPage;
