import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { mayPayrollRecords, junePayrollRecords } from '../../data/payrollRecords';

const PayrollPeriodSelector = ({ selectedPayPeriod, onPeriodChange, onNavigate }) => {
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
          <h2 className="text-lg font-semibold text-gray-900">Pay Period</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">📅</span>
            <span className="font-medium">
              {format(selectedPayPeriod.start, 'MMM dd')} - {format(selectedPayPeriod.end, 'MMM dd, yyyy')}
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
            Previous
          </Button>
          
          <Button
            onClick={handleCurrentPeriod}
            variant="outline"
            size="sm"
          >
            Current
          </Button>
          
          <Button
            onClick={handleNextPeriod}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Next
            <span>→</span>
          </Button>
        </div>
      </div>

      {/* Quick Historical Period Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">📊 View Historical Data (with mock payroll records)</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => handleHistoricalPeriod(mayPayrollRecords.payPeriod)}
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            May 2025
          </Button>
          <Button
            onClick={() => handleHistoricalPeriod(junePayrollRecords.payPeriod)}
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            June 2025
          </Button>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          These periods contain comprehensive mock payroll data for testing all features
        </p>
      </div>
    </div>
  );
};

export default PayrollPeriodSelector;
