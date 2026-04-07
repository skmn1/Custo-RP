import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleDateFns } from '../../utils/formatLocale';
import Button from '../ui/Button';
import { mayPayrollRecords, junePayrollRecords } from '../../data/payrollRecords';

const PayrollPeriodSelector = ({ selectedPayPeriod, onPeriodChange, onNavigate }) => {
  const { t } = useTranslation(['payroll']);
  const { formatDate } = useLocaleDateFns();
  const handlePrevPeriod = () => {
    onNavigate('prev');
  };

  const handleNextPeriod = () => {
    onNavigate('next');
  };

  const handleCurrentPeriod = () => {
    onNavigate('current');
  };

  const handleHistoricalPeriod = (period) => {
    onPeriodChange(period);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('payroll:period.title')}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">📅</span>
            <span className="font-medium">
              {formatDate(selectedPayPeriod.start, 'MMM dd')} - {formatDate(selectedPayPeriod.end, 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevPeriod}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <span>←</span>
            {t('payroll:period.previous')}
          </Button>
          
          <Button
            onClick={handleCurrentPeriod}
            variant="outline"
            size="sm"
          >
            {t('payroll:period.current')}
          </Button>
          
          <Button
            onClick={handleNextPeriod}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            {t('payroll:period.next')}
            <span>→</span>
          </Button>
        </div>
      </div>

      {/* Quick Historical Period Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">📊 {t('payroll:period.historicalTitle')}</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => handleHistoricalPeriod(mayPayrollRecords.payPeriod)}
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {t('payroll:period.may2025')}
          </Button>
          <Button
            onClick={() => handleHistoricalPeriod(junePayrollRecords.payPeriod)}
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {t('payroll:period.june2025')}
          </Button>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          {t('payroll:period.historicalDesc')}
        </p>
      </div>
    </div>
  );
};

export default PayrollPeriodSelector;
