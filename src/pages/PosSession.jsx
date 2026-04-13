import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlayCircleIcon, StopCircleIcon } from '@heroicons/react/24/outline';
import { posApi } from '../api/posApi';

const PosSession = () => {
  const { posLocationId } = useParams();
  const { t } = useTranslation(['pos']);
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    posApi
      .dashboardKpis(posLocationId)
      .then((data) => { if (!cancelled) setKpis(data); })
      .catch(() => { if (!cancelled) setKpis(null); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [posLocationId]);

  const sessionOpen = Boolean(kpis?.sessionOpen);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('pos:session.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="max-w-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            {sessionOpen ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                  <PlayCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {t('pos:locationStatus.open')}
                </p>
                {kpis.sessionOpenedAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('pos:session.openedAt', { time: kpis.sessionOpenedAt })}
                  </p>
                )}
                <button className="mt-4 px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                  {t('pos:session.close')}
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <StopCircleIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {t('pos:locationStatus.closed')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('pos:locationCard.noSession')}
                </p>
                <button className="px-6 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                  {t('pos:session.open')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PosSession;
