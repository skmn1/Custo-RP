import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCartIcon, MapPinIcon, PhoneIcon, UserIcon, UsersIcon, StarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { usePosLocation } from '../hooks/usePosLocation';
import { useAuth } from '../hooks/useAuth';

const TYPE_COLORS = {
  BUTCHER:    { bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-700 dark:text-red-300',    dot: 'bg-red-400' },
  GROCERY:    { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-400' },
  FAST_FOOD:  { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-400' },
  MIXED:      { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-400' },
};
const TYPE_KEY_MAP = { BUTCHER: 'butcher', GROCERY: 'grocery', FAST_FOOD: 'fastFood', MIXED: 'mixed' };

const StarRatingMini = ({ rating, reviewCount }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarSolid
          key={i}
          className={`w-3.5 h-3.5 ${i <= full ? 'text-yellow-400' : i === full + 1 && half ? 'text-yellow-300' : 'text-gray-200 dark:text-gray-600'}`}
        />
      ))}
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-0.5">{rating.toFixed(1)}</span>
      {reviewCount != null && (
        <span className="text-xs text-gray-400 dark:text-gray-500">({reviewCount})</span>
      )}
    </span>
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
          const tc = TYPE_COLORS[location.type] || TYPE_COLORS.MIXED;
          const hasIncidents = location.openIncidentsCount > 0;
          return (
            <button
              key={location.id}
              onClick={() => navigate(`/app/pos/${location.id}/dashboard`)}
              className="group text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-0 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Coloured top strip */}
              <div className={`h-1.5 w-full ${tc.dot}`} />

              <div className="p-5">
                {/* Header row: type badge + incidents badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
                    {t(`pos:type.${TYPE_KEY_MAP[location.type] || location.type?.toLowerCase()}`)}
                  </span>
                  {hasIncidents && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      {location.openIncidentsCount}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {location.name}
                </h3>

                {/* Info lines */}
                <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                  {location.address && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="truncate">{location.address}</span>
                    </div>
                  )}
                  {location.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 shrink-0 text-gray-400" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                  {location.managerName && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="truncate">{location.managerName}</span>
                    </div>
                  )}
                </div>

                {/* Footer: rating + CTA */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  {location.googleRating != null ? (
                    <StarRatingMini rating={location.googleRating} reviewCount={location.googleReviewCount} />
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600 flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5" />
                      {t('pos:locationCard.noRating', 'No rating yet')}
                    </span>
                  )}
                  <span className="text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    {t('pos:locationCard.openButton')} →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MyPosLocationsPage;
