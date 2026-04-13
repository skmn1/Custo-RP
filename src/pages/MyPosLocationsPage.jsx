import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCartIcon, MapPinIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePosLocation } from '../hooks/usePosLocation';
import { useAuth } from '../hooks/useAuth';

const TYPE_BADGE = {
  BUTCHER:   'bg-red-100 text-red-700 border-red-200',
  GROCERY:   'bg-green-100 text-green-700 border-green-200',
  FAST_FOOD: 'bg-orange-100 text-orange-700 border-orange-200',
  MIXED:     'bg-purple-100 text-purple-700 border-purple-200',
};
const TYPE_KEY_MAP = { BUTCHER: 'butcher', GROCERY: 'grocery', FAST_FOOD: 'fastFood', MIXED: 'mixed' };

const StarRatingMini = ({ rating, reviewCount }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${i <= full ? 'text-yellow-400' : i === full + 1 && half ? 'text-yellow-300' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
      {reviewCount != null && (
        <span className="text-xs text-gray-400 dark:text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
};

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
        {posLocations.map((location) => {
          const hasIncidents = location.openIncidentsCount > 0;
          const badgeColor = TYPE_BADGE[location.type] || TYPE_BADGE.MIXED;

          return (
            <div
              key={location.id}
              onClick={() => navigate(`/app/pos/${location.id}/dashboard`)}
              className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                location.isActive === false ? 'opacity-60' : ''
              }`}
            >
              {/* Image / Thumbnail Section */}
              <div className="relative h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 22V12h6v10" />
                </svg>

                {/* Rating Pill — top right */}
                {location.googleRating != null && (
                  <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-2.5 py-1 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{location.googleRating.toFixed(1)}</span>
                  </div>
                )}

                {/* Category Badge — bottom left */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                    {t(`pos:type.${TYPE_KEY_MAP[location.type] || location.type?.toLowerCase()}`)}
                  </span>
                  {hasIncidents && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      {location.openIncidentsCount}
                    </span>
                  )}
                </div>

                {/* Inactive overlay */}
                {location.isActive === false && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold px-3 py-1 bg-black/50 rounded-full">
                      {t('pos:status.inactive')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-2 line-clamp-2">
                  {location.name}
                </h3>

                {/* Address */}
                {location.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2 mb-4 leading-relaxed">
                    <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                    <span>{location.address}</span>
                  </p>
                )}

                {/* Two-column info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                      {t('pos:card.managerLabel')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {location.managerName || t('pos:detail.unassigned')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                      {t('pos:card.phoneLabel', 'Phone')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {location.phone || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* Footer */}
              <div className="px-5 py-4 flex items-center justify-between">
                {/* Rating or placeholder */}
                {location.googleRating != null ? (
                  <StarRatingMini rating={location.googleRating} reviewCount={location.googleReviewCount} />
                ) : (
                  <span className="text-xs text-gray-300 dark:text-gray-600">
                    {t('pos:locationCard.noRating', 'No rating yet')}
                  </span>
                )}

                {/* Ghost-pill CTA */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors">
                  {t('pos:locationCard.openButton', 'Open')}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyPosLocationsPage;
