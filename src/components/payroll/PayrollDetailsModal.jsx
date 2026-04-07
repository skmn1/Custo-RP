import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';

const PayrollDetailsModal = ({ employee, onClose }) => {
  const { t } = useTranslation(['payroll']);
  const {
    name,
    role,
    department,
    hourlyRate,
    totalHours,
    regularHours,
    overtimeHours,
    doubleTimeHours,
    grossPay,
    netPay,
    taxes,
    deductions,
    shifts,
    shiftDifferentials
  } = employee;

  return (
    <Modal onClose={onClose} title={t('payroll:details.title', { name })}>
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{t('payroll:details.employeeInformation')}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('payroll:details.name')}:</span>
              <span className="ml-2 font-medium">{name}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:details.role')}:</span>
              <span className="ml-2 font-medium">{role}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:details.department')}:</span>
              <span className="ml-2 font-medium">{department}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:details.baseRate')}:</span>
              <span className="ml-2 font-medium">${hourlyRate.toFixed(2)}{t('payroll:details.perHour')}</span>
            </div>
          </div>
        </div>

        {/* Hours Breakdown */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{t('payroll:details.hoursBreakdown')}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('payroll:details.regularHours')}:</span>
              <span className="ml-2 font-medium">{regularHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:details.overtimeHours')}:</span>
              <span className="ml-2 font-medium text-orange-600">{overtimeHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:details.doubleTimeHours')}:</span>
              <span className="ml-2 font-medium text-red-600">{doubleTimeHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="text-gray-600">{t('payroll:details.totalHours')}:</span>
              <span className="ml-2 font-semibold">{totalHours.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* Pay Breakdown */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{t('payroll:details.payBreakdown')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.regularPay')}:</span>
              <span className="font-medium">${(regularHours * hourlyRate).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.overtimePay')}:</span>
              <span className="font-medium">${(overtimeHours * hourlyRate * 1.5).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.doubleTimePay')}:</span>
              <span className="font-medium">${(doubleTimeHours * hourlyRate * 2).toFixed(2)}</span>
            </div>
            {shiftDifferentials > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('payroll:details.shiftDifferentials')}:</span>
                <span className="font-medium">${shiftDifferentials.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>{t('payroll:details.grossPay')}:</span>
              <span className="text-green-600">${grossPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{t('payroll:details.deductions')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.federalTax')}:</span>
              <span className="font-medium">-${taxes.federal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.stateTax')}:</span>
              <span className="font-medium">-${taxes.state.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.socialSecurity')}:</span>
              <span className="font-medium">-${taxes.socialSecurity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('payroll:details.medicare')}:</span>
              <span className="font-medium">-${taxes.medicare.toFixed(2)}</span>
            </div>
            {deductions.healthInsurance > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('payroll:details.healthInsurance')}:</span>
                <span className="font-medium">-${deductions.healthInsurance.toFixed(2)}</span>
              </div>
            )}
            {deductions.retirement401k > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('payroll:details.retirement401k')}:</span>
                <span className="font-medium">-${deductions.retirement401k.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>{t('payroll:details.totalDeductions')}:</span>
              <span className="text-red-600">-${(grossPay - netPay).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-blue-600 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">{t('payroll:details.netPay')}:</span>
            <span className="text-2xl font-bold">${netPay.toFixed(2)}</span>
          </div>
        </div>

        {/* Shifts */}
        {shifts && shifts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{t('payroll:details.shiftsThisPeriod')}</h3>
            <div className="space-y-2">
              {shifts.map((shift, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                  <div>
                    <span className="font-medium">{shift.date}</span>
                    <span className="text-gray-600 ml-2">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{shift.duration.toFixed(1)}h</div>
                    {shift.type !== 'Regular' && (
                      <div className="text-xs text-blue-600">{shift.type}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PayrollDetailsModal;
