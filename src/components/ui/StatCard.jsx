import React from 'react';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, subtitle, icon, color = 'blue', change, description }) => {
  const { t } = useTranslation(['common']);
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
  };

  const getChangeColor = (changeValue) => {
    if (changeValue > 0) return 'text-green-600';
    if (changeValue < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = (changeValue) => {
    if (changeValue > 0) return '↗️';
    if (changeValue < 0) return '↘️';
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white text-lg`}>
            {typeof icon === 'string' ? (
              <span>{icon}</span>
            ) : (
              icon
            )}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            {subtitle && (
              <dd className="text-xs text-gray-600 mt-1">{subtitle}</dd>
            )}
            {description && (
              <dd className="text-xs text-gray-600 mt-1">{description}</dd>
            )}
            {change !== undefined && change !== 0 && (
              <dd className={`text-xs mt-1 flex items-center gap-1 ${getChangeColor(change)}`}>
                <span>{getChangeIcon(change)}</span>
                <span>{t('common:stats.changeFromLastPeriod', { change: Math.abs(change).toFixed(1) })}</span>
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
