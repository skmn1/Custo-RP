import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCartIcon, MapPinIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import { usePosTerminal } from '../hooks/usePosTerminal';

const MyTerminalsPage = () => {
  const { t } = useTranslation(['pos', 'common']);
  const navigate = useNavigate();
  const { terminals, isLoading, error } = usePosTerminal();

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

  if (terminals.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('pos:myTerminals.empty')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:myTerminals.emptyDesc')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:myTerminals.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('pos:myTerminals.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {terminals.map((terminal) => (
          <button
            key={terminal.id}
            onClick={() => navigate(`/app/pos/${terminal.id}/dashboard`)}
            className="group text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                <ShoppingCartIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {terminal.name}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  {terminal.type}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {terminal.address && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{terminal.address}</span>
                </div>
              )}
              {terminal.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 shrink-0" />
                  <span>{terminal.phone}</span>
                </div>
              )}
              {terminal.managerName && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <span>{terminal.managerName}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                {t('pos:myTerminals.openDashboard')} →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyTerminalsPage;
