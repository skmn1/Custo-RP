import React from 'react';
import { isToday } from 'date-fns';
import DraggableShift from './DraggableShift';
import { getShiftsForEmployeeAndDay, isEmployeeOvertime, getEmployeeTotalHours } from '../../utils/shiftUtils';

const EmployeeRow = ({ employee, shifts, weekDays, onDeleteShift }) => {
  const employeeShifts = shifts.filter(shift => shift.employeeId === employee.id);
  const totalHours = getEmployeeTotalHours(shifts, employee.id);
  const isOvertime = isEmployeeOvertime(shifts, employee.id, employee.maxHours);

  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <div className="grid grid-cols-8 gap-0">
        {/* Enhanced Employee Info Column */}
        <div className="p-4 border-r border-gray-200 bg-white sticky left-0 z-10 min-w-0">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${employee.color} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
              {employee.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {employee.name}
              </div>
              <div className="text-xs text-gray-600">{employee.role}</div>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`text-xs font-semibold ${isOvertime ? 'text-red-600' : 'text-indigo-600'}`}>
                  {totalHours}h/{employee.maxHours}h
                </div>
                {isOvertime && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    OT
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {employeeShifts.length} shift{employeeShifts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Day Columns */}
        {weekDays.map((day, dayIndex) => {
          const dayShifts = getShiftsForEmployeeAndDay(shifts, employee.id, dayIndex);
          const isTodayCheck = isToday(day);

          return (
            <div
              key={dayIndex}
              className={`p-3 border-r border-gray-200 min-h-32 transition-colors duration-200 ${
                isTodayCheck ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              data-employee-id={employee.id}
              data-day={dayIndex}
            >
              {dayShifts.length === 0 && (
                <div className="text-center text-gray-400 text-xs py-4 border-2 border-dashed border-gray-300 rounded-lg">
                  Drop shift here
                </div>
              )}
              {dayShifts.map(shift => (
                <div key={shift.id} className="relative group">
                  <DraggableShift
                    shift={shift}
                    employee={employee}
                  />
                  <button
                    onClick={() => onDeleteShift(shift.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center"
                    title="Delete shift"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeRow;
