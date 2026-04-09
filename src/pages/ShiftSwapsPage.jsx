import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

/**
 * Shift Swap Requests page.
 * - Admins / planners see all swap requests.
 * - Employees see incoming requests, their own requests, and available shifts.
 */
const ShiftSwapsPage = () => {
  const { t } = useTranslation(['swaps', 'common', 'planning']);
  const { user, isEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming');

  // Placeholder data
  const incomingSwaps = [
    {
      id: 1,
      requesterName: 'Alice Martin',
      theirShift: 'Mon 08:00–16:00',
      yourShift: 'Wed 14:00–22:00',
      status: 'pending',
    },
  ];

  const myRequests = [
    {
      id: 2,
      targetName: 'Bob Dupont',
      theirShift: 'Fri 06:00–14:00',
      yourShift: 'Fri 14:00–22:00',
      status: 'pending',
    },
  ];

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  const tabs = [
    { key: 'incoming', label: t('swaps:tab.incoming') },
    { key: 'myRequests', label: t('swaps:tab.myRequests') },
    { key: 'available', label: t('swaps:tab.available') },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('swaps:title')}
          </h1>
        </div>
        <Button variant="primary" size="sm">
          {t('swaps:btn.newSwap')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-medium transition border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingSwaps.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">{t('swaps:emptyState.noIncoming')}</p>
          ) : (
            incomingSwaps.map((swap) => (
              <div key={swap.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {t('swaps:wantsToSwap', { name: swap.requesterName })}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('swaps:theirShift')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{swap.theirShift}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('swaps:yourShift')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{swap.yourShift}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm">{t('swaps:btn.accept')}</Button>
                  <Button variant="secondary" size="sm">{t('swaps:btn.decline')}</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'myRequests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">{t('swaps:emptyState.noRequests')}</p>
          ) : (
            myRequests.map((swap) => (
              <div key={swap.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('swaps:wantsToSwap', { name: swap.targetName })}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor[swap.status]}`}>
                    {t(`swaps:status.${swap.status}`)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('swaps:yourShift')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{swap.yourShift}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('swaps:theirShift')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{swap.theirShift}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('swaps:emptyState.noAvailable')}</p>
        </div>
      )}
    </div>
  );
};

export default ShiftSwapsPage;
