import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { isToday } from 'date-fns';
import DraggableShift from './DraggableShift';
import { getShiftsForEmployeeAndDay, isEmployeeOvertime, getEmployeeTotalHours } from '../../utils/shiftUtils';

const DroppableDay = ({ children, employeeId, dayIndex, isTodayCheck, dragOverDropZone, onAddShift, hasShifts, dayShifts, onDeleteShift, onUpdateShift, employee }) => {
  const [isHovered, setIsHovered] = useState(false);
  const droppableId = `${employeeId}-${dayIndex}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      type: 'dropzone',
      employeeId,
      dayIndex,
    },
  });

  const isHighlighted = isOver || dragOverDropZone === droppableId;
  const showCreateShiftSuggestion = isHovered && !hasShifts && !isHighlighted;

  return (
    <div
      ref={setNodeRef}
      className={`relative p-3 border-r border-gray-200 min-h-32 transition-all duration-200 cursor-pointer ${
        isTodayCheck ? 'bg-blue-50' : 'bg-gray-50'
      } ${
        isHighlighted ? 'bg-indigo-100 border-indigo-300 border-2 shadow-md' : 'hover:bg-gray-100'
      }`}
      data-employee-id={employeeId}
      data-day={dayIndex}
      data-droppable-id={droppableId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !hasShifts && onAddShift && onAddShift(employeeId, dayIndex)}
    >
      {/* Empty state message */}
      {dayShifts.length === 0 && !showCreateShiftSuggestion && !isHighlighted && (
        <div className="text-center text-gray-400 text-xs py-6 border-2 border-dashed border-gray-300 rounded-lg transition-all duration-200 hover:border-green-300 hover:text-green-400">
          <div className="flex flex-col items-center space-y-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>No shifts scheduled</span>
          </div>
        </div>
      )}

      {/* Shifts */}
      <div className="space-y-2">
        {dayShifts.map(shift => (
          <DraggableShift
            key={shift.id}
            shift={shift}
            employee={employee}
            onUpdateShift={onUpdateShift}
            onDeleteShift={onDeleteShift}
          />
        ))}
      </div>

      {children}
      
      {/* Visual drop indicator */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-indigo-200 bg-opacity-30 rounded-md border-2 border-dashed border-indigo-400 pointer-events-none flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm">
            Drop shift here
          </div>
        </div>
      )}

      {/* Create shift suggestion */}
      {showCreateShiftSuggestion && (
        <div className="absolute inset-0 bg-green-50 bg-opacity-90 rounded-md border-2 border-dashed border-green-300 flex items-center justify-center transition-all duration-200">
          <div className="bg-white rounded-lg px-3 py-2 text-sm font-medium text-green-700 shadow-sm flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Click to create shift</span>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeRow = ({ employee, shifts, weekDays, onDeleteShift, onAddShift, onUpdateShift, dragOverDropZone }) => {
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

        {/* Enhanced Day Columns with Droppable Zones */}
        {weekDays.map((day, dayIndex) => {
          const dayShifts = getShiftsForEmployeeAndDay(shifts, employee.id, dayIndex);
          const isTodayCheck = isToday(day);

          return (
            <DroppableDay
              key={dayIndex}
              employeeId={employee.id}
              dayIndex={dayIndex}
              isTodayCheck={isTodayCheck}
              dragOverDropZone={dragOverDropZone}
              onAddShift={onAddShift}
              hasShifts={dayShifts.length > 0}
              dayShifts={dayShifts}
              onDeleteShift={onDeleteShift}
              onUpdateShift={onUpdateShift}
              employee={employee}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeRow;
