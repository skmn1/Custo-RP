import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLocaleDateFns } from '../../utils/formatLocale';

const AddShiftModal = ({ isOpen, onClose, onAddShift, employees, weekDays }) => {
  const { t } = useTranslation(['scheduler']);
  const { formatDate } = useLocaleDateFns();
  const dayNamesLong = t('scheduler:days.long', { returnObjects: true });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [shiftType, setShiftType] = useState('Regular');
  const [department, setDepartment] = useState('General');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  
  // Generate time options (every 30 minutes)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  const calculateDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const handleSubmit = () => {
    if (selectedEmployee && startTime && endTime) {
      const duration = calculateDuration(startTime, endTime);
      onAddShift(selectedEmployee, selectedDay, {
        type: shiftType,
        department,
        startTime,
        endTime,
        duration: Math.round(duration * 10) / 10
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedEmployee('');
    setSelectedDay(0);
    setShiftType('Regular');
    setDepartment('General');
    setStartTime('09:00');
    setEndTime('17:00');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={t('scheduler:addNewShift')}
      size="xl"
      showValidate={true}
      onValidate={handleSubmit}
      validateText={t('scheduler:addShift')}
      validateDisabled={!selectedEmployee || !startTime || !endTime}
    >
      <div className="space-y-6">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('scheduler:employee')}</label>
          <select
            data-testid="employee-select"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">{t('scheduler:selectEmployee')}</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.role}
              </option>
            ))}
          </select>
        </div>
        
        {/* Day Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('scheduler:day')}</label>
          <select
            data-testid="day-select"
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            {dayNamesLong.map((day, index) => (
              <option key={index} value={index}>
                {day} ({formatDate(weekDays[index], 'MMM d')})
              </option>
            ))}
          </select>
        </div>

        {/* Shift Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('scheduler:shiftType')}</label>
            <select
              data-testid="shift-type-select"
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="Regular">{t('scheduler:shiftTypes.Regular')}</option>
              <option value="Overtime">{t('scheduler:shiftTypes.Overtime')}</option>
              <option value="Training">{t('scheduler:shiftTypes.Training')}</option>
              <option value="Meeting">{t('scheduler:shiftTypes.Meeting')}</option>
              <option value="Break">{t('scheduler:shiftTypes.Break')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('scheduler:department')}</label>
            <select
              data-testid="department-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="General">{t('scheduler:departments.General')}</option>
              <option value="Sales">{t('scheduler:departments.Sales')}</option>
              <option value="Kitchen">{t('scheduler:departments.Kitchen')}</option>
              <option value="Service">{t('scheduler:departments.Service')}</option>
              <option value="Management">{t('scheduler:departments.Management')}</option>
              <option value="Cleaning">{t('scheduler:departments.Cleaning')}</option>
            </select>
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('scheduler:timeSchedule')}</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('scheduler:startTime')}</label>
              <select
                data-testid="start-time-select"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('scheduler:endTime')}</label>
              <select
                data-testid="end-time-select"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Duration Display */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-indigo-800">{t('scheduler:totalDuration')}</span>
            </div>
            <span className="text-lg font-bold text-indigo-600">
              {t('scheduler:durationHours', { value: calculateDuration(startTime, endTime).toFixed(1) })}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddShiftModal;
