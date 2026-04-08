import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { getAccessibleApps } from '../../apps/registry';
import AppTile from './AppTile';

/**
 * App Switcher panel — slide-in overlay showing all accessible apps.
 * Triggered from the GlobalTopBar grid icon.
 */
const AppSwitcher = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['apps']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const panelRef = useRef(null);

  const accessibleApps = user ? getAccessibleApps(user.role) : [];

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Delay to avoid closing on the same click that opens
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, onClose]);

  const handleAppClick = (app) => {
    onClose();
    navigate(app.route);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={t('apps:switcher.title')}
        className="fixed top-14 left-0 sm:left-auto sm:right-4 w-full sm:w-[420px] max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 rounded-b-xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-y-auto animate-in slide-in-from-top-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('apps:switcher.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('common:actions.close')}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* App grid */}
        <div className="p-4 grid grid-cols-3 gap-3">
          {accessibleApps.map((app) => (
            <AppTile
              key={app.id}
              app={app}
              mini
              onClick={handleAppClick}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AppSwitcher;
