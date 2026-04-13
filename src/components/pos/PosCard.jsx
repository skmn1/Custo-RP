import React from 'react';
import { useTranslation } from 'react-i18next';
import { POS_TYPE_COLORS } from '../../constants/pos';

const TYPE_KEY_MAP = { BUTCHER: 'butcher', GROCERY: 'grocery', FAST_FOOD: 'fastFood', MIXED: 'mixed' };

// Type color map for card category badges
const TYPE_BADGE_COLORS = {
  BUTCHER: 'bg-red-100 text-red-700 border-red-200',
  GROCERY: 'bg-green-100 text-green-700 border-green-200',
  FAST_FOOD: 'bg-orange-100 text-orange-700 border-orange-200',
  MIXED: 'bg-purple-100 text-purple-700 border-purple-200',
};

const StarRating = ({ rating, count }) => {
  if (rating == null) return null;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? 'text-yellow-400'
                : i === fullStars && hasHalf
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {count != null && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </div>
  );
};

const PosCard = ({ pos, onView, onEdit, onDelete }) => {
  const { t } = useTranslation(['pos']);
  const typeColor = POS_TYPE_COLORS[pos.type] || POS_TYPE_COLORS.MIXED;

  return (
    <div
      data-testid="pos-card"
      data-pos-id={pos.id}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] ${
        !pos.isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Image Section with Overlaid Badges */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
        {/* Store image placeholder or actual image */}
        <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.325 15.582c.572-1.179.817-2.77.817-4.582 0-5.523-4.477-10-10-10S1 5.477 1 11c0 1.812.245 3.403.817 4.582M21 21H3" />
          </svg>
        </div>

        {/* Rating Pill - Top Right */}
        {pos.googleRating != null && (
          <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{pos.googleRating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Category Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <span
            data-testid="pos-type-badge"
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              TYPE_BADGE_COLORS[pos.type] || TYPE_BADGE_COLORS.MIXED
            }`}
          >
            {t(`pos:type.${TYPE_KEY_MAP[pos.type]}`) || pos.type}
          </span>
        </div>

        {/* Inactive Indicator */}
        {!pos.isActive && (
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
        <h3
          data-testid="pos-name"
          className="text-base font-bold text-gray-900 dark:text-gray-50 mb-2 line-clamp-2"
        >
          {pos.name}
        </h3>

        {/* Address with Pin Icon */}
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span data-testid="pos-address" className="text-xs leading-relaxed">
            {pos.address}
          </span>
        </p>

        {/* Two-Column Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Manager */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              {t('pos:card.managerLabel')}
            </p>
            <p
              data-testid="pos-manager"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {pos.managerName || t('pos:detail.unassigned')}
            </p>
          </div>
          {/* Phone */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              {t('pos:card.phoneLabel', 'Phone')}
            </p>
            <p
              data-testid="pos-phone"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {pos.phone || '—'}
            </p>
          </div>
        </div>

        {/* Google Rating Display */}
        {pos.googleRating != null && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              {t('pos:card.rating', 'Rating')}
            </p>
            <StarRating rating={pos.googleRating} count={pos.googleReviewCount} />
          </div>
        )}
      </div>

      {/* Light Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800" />

      {/* Footer: Avatars + Action Button */}
      <div className="px-5 py-4 flex items-center justify-between">
        {/* Avatar Stack Placeholder */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-white"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button - Ghost Pill Style */}
        <button
          onClick={() => onView(pos)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors duration-200"
          title={t('pos:btn.view')}
        >
          {t('pos:btn.view', 'View')}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Hidden Edit/Delete actions (accessible via context menu or detail view) */}
      <div className="hidden group-hover:flex absolute top-2 right-2 gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-1">
        <button
          onClick={() => onEdit(pos)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          title={t('pos:btn.edit')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(pos)}
          className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
          title={t('pos:btn.delete')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PosCard;
