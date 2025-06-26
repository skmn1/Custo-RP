import React from 'react';
import Modal from '../ui/Modal';

const PayrollDetailsModal = ({ employee, onClose }) => {
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
    <Modal onClose={onClose} title={`Payroll Details - ${name}`}>
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Employee Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{name}</span>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="ml-2 font-medium">{role}</span>
            </div>
            <div>
              <span className="text-gray-600">Department:</span>
              <span className="ml-2 font-medium">{department}</span>
            </div>
            <div>
              <span className="text-gray-600">Base Rate:</span>
              <span className="ml-2 font-medium">${hourlyRate.toFixed(2)}/hour</span>
            </div>
          </div>
        </div>

        {/* Hours Breakdown */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Hours Breakdown</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Regular Hours:</span>
              <span className="ml-2 font-medium">{regularHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="text-gray-600">Overtime Hours:</span>
              <span className="ml-2 font-medium text-orange-600">{overtimeHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="text-gray-600">Double Time Hours:</span>
              <span className="ml-2 font-medium text-red-600">{doubleTimeHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="text-gray-600">Total Hours:</span>
              <span className="ml-2 font-semibold">{totalHours.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* Pay Breakdown */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Pay Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Regular Pay:</span>
              <span className="font-medium">${(regularHours * hourlyRate).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime Pay (1.5x):</span>
              <span className="font-medium">${(overtimeHours * hourlyRate * 1.5).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Double Time Pay (2x):</span>
              <span className="font-medium">${(doubleTimeHours * hourlyRate * 2).toFixed(2)}</span>
            </div>
            {shiftDifferentials > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shift Differentials:</span>
                <span className="font-medium">${shiftDifferentials.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Gross Pay:</span>
              <span className="text-green-600">${grossPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Deductions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Federal Tax:</span>
              <span className="font-medium">-${taxes.federal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">State Tax:</span>
              <span className="font-medium">-${taxes.state.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Social Security:</span>
              <span className="font-medium">-${taxes.socialSecurity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medicare:</span>
              <span className="font-medium">-${taxes.medicare.toFixed(2)}</span>
            </div>
            {deductions.healthInsurance > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Health Insurance:</span>
                <span className="font-medium">-${deductions.healthInsurance.toFixed(2)}</span>
              </div>
            )}
            {deductions.retirement401k > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">401(k):</span>
                <span className="font-medium">-${deductions.retirement401k.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Deductions:</span>
              <span className="text-red-600">-${(grossPay - netPay).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-blue-600 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Net Pay:</span>
            <span className="text-2xl font-bold">${netPay.toFixed(2)}</span>
          </div>
        </div>

        {/* Shifts */}
        {shifts && shifts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Shifts This Period</h3>
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
