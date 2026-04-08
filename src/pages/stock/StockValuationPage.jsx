import React from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyEuroIcon } from '@heroicons/react/24/outline';

const StockValuationPage = () => {
  const { t } = useTranslation('common');

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <CurrencyEuroIcon className="w-10 h-10 text-orange-500 dark:text-orange-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {t('nav.valuation')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Stock valuation reporting is coming soon. This feature will provide FIFO, LIFO, and weighted-average cost calculations across all locations.
      </p>
    </div>
  );
};

export default StockValuationPage;
