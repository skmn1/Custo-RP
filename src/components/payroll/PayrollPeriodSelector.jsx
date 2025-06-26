import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';

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

  return (
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
  );
};

export default PayrollPeriodSelector;
