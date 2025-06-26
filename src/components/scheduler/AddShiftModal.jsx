import React, { useState } from 'react';
import { format } from 'date-fns';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { DAY_NAMES } from '../../constants/scheduler';

const AddShiftModal = ({ isOpen, onClose, onAddShift, employees, weekDays }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  const handleSubmit = () => {
    if (selectedEmployee) {
      onAddShift(selectedEmployee, selectedDay);
      setSelectedEmployee('');
      setSelectedDay(0);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedEmployee('');
    setSelectedDay(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Shift">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.role}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DAY_NAMES.map((day, index) => (
              <option key={index} value={index}>
                {day} ({format(weekDays[index], 'MMM d')})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedEmployee}>
          Add Shift
        </Button>
      </div>
    </Modal>
  );
};

export default AddShiftModal;
