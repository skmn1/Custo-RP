import React from 'react';
import { useTranslation } from 'react-i18next';
import { getIconComponent } from '../../apps/icons';
import { getAppColor } from '../../apps/colors';

/**
 * Interactive tile for a single app in the launcher or switcher.
 *
 * @param {object}  app       — App registry entry
 * @param {object}  badge     — Optional { count, label } for badge pill
 * @param {boolean} mini      — Compact mode for the app switcher panel
 * @param {function} onClick  — Click handler
 */
const AppTile = ({ app, badge, mini = false, onClick }) => {
  const { t } = useTranslation(['apps']);
  const Icon = getIconComponent(app.icon, 'outline');
  const color = getAppColor(app.color);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(app);
    }
  };

  if (mini) {
    return (
      <button
        type="button"
        onClick={() => onClick?.(app)}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 ${color.ring} cursor-pointer`}
        aria-label={t(`apps:${app.name}.name`)}
      >
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${color.bg} dark:bg-opacity-20 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color.text}`} aria-hidden="true" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center leading-tight">
          {t(`apps:${app.name}.name`)}
        </span>
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(app)}
      onKeyDown={handleKeyDown}
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-t-4 ${color.border} border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 p-6 cursor-pointer focus:outline-none focus:ring-2 ${color.ring} focus:ring-offset-2 group`}
      aria-label={t(`apps:${app.name}.name`)}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${color.bg} dark:bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {Icon && <Icon className={`w-7 h-7 ${color.text}`} aria-hidden="true" />}
      </div>

      {/* App name */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        {t(`apps:${app.name}.name`)}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {t(`apps:${app.name}.description`)}
      </p>

      {/* Badge */}
      {badge && badge.count > 0 && (
        <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {badge.count} {badge.label || ''}
        </span>
      )}
    </div>
  );
};

export default AppTile;
