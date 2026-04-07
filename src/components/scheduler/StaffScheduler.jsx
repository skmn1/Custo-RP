import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useEmployees } from '../../hooks/useEmployees';
import { useShifts } from '../../hooks/useShifts';
import { useWeekNavigation } from '../../hooks/useWeekNavigation';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { generateWeekDays, getWeekNumber } from '../../utils/dateUtils';
import { useLocaleDateFns } from '../../utils/formatLocale';
import { useSettings } from '../../hooks/useSettings';

import Button from '../ui/Button';
import PermissionGate from '../ui/PermissionGate';
import CalendarHeader from './CalendarHeader';
import EmployeeRow from './EmployeeRow';
import DraggableShift from './DraggableShift';
import StatisticsPanel from './StatisticsPanel';
import AddShiftModal from './AddShiftModal';

const StaffScheduler = () => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { formatDate } = useLocaleDateFns();
  const { settings } = useSettings();
  const { employees: fetchedEmployees, isLoading: employeesLoading } = useEmployees();
  const employees = fetchedEmployees.length > 0 ? fetchedEmployees : initialEmployees;
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);

  const { shifts, addShift, deleteShift, updateShift, moveShift } = useShifts();
  const { currentWeek, navigateWeek, goToCurrentWeek } = useWeekNavigation();
  const { sensors, activeShift, dragOverDropZone, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(shifts, moveShift);

  const weekDays = generateWeekDays(currentWeek, settings?.general?.workWeekStart);
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

  const handleAddShift = (employeeId, day, shiftData = null) => {
    if (shiftData) {
      // Called from AddShiftModal with complete shift data
      addShift(employeeId, day, shiftData);
    } else {
      // Called from quick add (clicking empty cell) - use default values
      addShift(employeeId, day);
    }
    setShowAddShiftModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('scheduler:title')}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('scheduler:subtitleStats', { employees: employees.length, shifts: shifts.length })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={goToCurrentWeek} 
                className="flex items-center space-x-2"
                data-testid="today-button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t('scheduler:today')}</span>
              </Button>
              <PermissionGate permission="schedule:create">
                <Button 
                  onClick={() => setShowAddShiftModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  data-testid="add-shift-button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold">{t('scheduler:addShift')}</span>
                  <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                </Button>
              </PermissionGate>
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
              <span className="text-sm hidden sm:inline">{t('scheduler:previous')}</span>
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(weekStart, 'MMMM d')} - {formatDate(weekDays[6], 'MMMM d, yyyy')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('scheduler:week', { number: getWeekNumber(weekStart) })}
              </p>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigateWeek(1)}
              className="flex items-center space-x-1"
            >
              <span className="text-sm hidden sm:inline">{t('scheduler:next')}</span>
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
