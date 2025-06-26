import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { initialEmployees } from '../../data/employees';
import { useShifts } from '../../hooks/useShifts';
import { useWeekNavigation } from '../../hooks/useWeekNavigation';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { generateWeekDays, formatWeekRange, getWeekNumber } from '../../utils/dateUtils';

import Button from '../ui/Button';
import CalendarHeader from './CalendarHeader';
import EmployeeRow from './EmployeeRow';
import DraggableShift from './DraggableShift';
import StatisticsPanel from './StatisticsPanel';
import AddShiftModal from './AddShiftModal';

const StaffScheduler = () => {
  const [employees] = useState(initialEmployees);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);

  const { shifts, addShift, deleteShift, updateShift, moveShift } = useShifts();
  const { currentWeek, navigateWeek, goToCurrentWeek } = useWeekNavigation();
  const { sensors, activeShift, dragOverDropZone, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(shifts, moveShift);

  const weekDays = generateWeekDays(currentWeek);
  const weekStart = weekDays[0];

  // Custom collision detection for better drop zone targeting
  const customCollisionDetection = (args) => {
    // First try pointer detection for more precise targeting
    const pointerIntersections = pointerWithin(args);
    if (pointerIntersections.length > 0) {
      return pointerIntersections;
    }

    // Fallback to rectangle intersection
    const rectIntersections = rectIntersection(args);
    if (rectIntersections.length > 0) {
      return rectIntersections;
    }

    // Final fallback to closest center
    return closestCenter(args);
  };

  const handleAddShift = (employeeId, day) => {
    addShift(employeeId, day);
    setShowAddShiftModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Scheduler</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage staff schedules with drag and drop • {employees.length} employees • {shifts.length} shifts
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={goToCurrentWeek}>
                Today
              </Button>
              <Button onClick={() => setShowAddShiftModal(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Shift
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="ghost" 
              onClick={() => navigateWeek(-1)}
              className="flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm hidden sm:inline">Previous</span>
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatWeekRange(weekStart)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Week {getWeekNumber(weekStart)}
              </p>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigateWeek(1)}
              className="flex items-center space-x-1"
            >
              <span className="text-sm hidden sm:inline">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <CalendarHeader weekDays={weekDays} />
          
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={shifts.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {employees.map(employee => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  shifts={shifts}
                  weekDays={weekDays}
                  onDeleteShift={deleteShift}
                  onAddShift={handleAddShift}
                  onUpdateShift={updateShift}
                  dragOverDropZone={dragOverDropZone}
                />
              ))}
            </SortableContext>
            
            <DragOverlay>
              {activeShift ? (
                <DraggableShift
                  shift={activeShift}
                  employee={employees.find(e => e.id === activeShift.employeeId)}
                  isDragOverlay={true}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <StatisticsPanel employees={employees} shifts={shifts} />
      </div>

      <AddShiftModal
        isOpen={showAddShiftModal}
        onClose={() => setShowAddShiftModal(false)}
        onAddShift={handleAddShift}
        employees={employees}
        weekDays={weekDays}
      />
    </div>
  );
};

export default StaffScheduler;
