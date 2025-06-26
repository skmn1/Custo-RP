import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, startOfWeek, addDays, isToday } from 'date-fns';

// Sample employee data with more diverse roles and information
const initialEmployees = [
  {
    id: 'emp1',
    name: 'Sarah Johnson',
    role: 'Senior Nurse',
    avatar: 'SJ',
    color: 'bg-blue-500',
    email: 'sarah.johnson@hospital.com',
    maxHours: 40,
  },
  {
    id: 'emp2',
    name: 'Michael Chen',
    role: 'Doctor',
    avatar: 'MC',
    color: 'bg-green-500',
    email: 'michael.chen@hospital.com',
    maxHours: 50,
  },
  {
    id: 'emp3',
    name: 'Emily Rodriguez',
    role: 'Nurse',
    avatar: 'ER',
    color: 'bg-purple-500',
    email: 'emily.rodriguez@hospital.com',
    maxHours: 36,
  },
  {
    id: 'emp4',
    name: 'David Wilson',
    role: 'Technician',
    avatar: 'DW',
    color: 'bg-orange-500',
    email: 'david.wilson@hospital.com',
    maxHours: 40,
  },
  {
    id: 'emp5',
    name: 'Lisa Thompson',
    role: 'Administrator',
    avatar: 'LT',
    color: 'bg-pink-500',
    email: 'lisa.thompson@hospital.com',
    maxHours: 40,
  },
  {
    id: 'emp6',
    name: 'James Park',
    role: 'Radiologist',
    avatar: 'JP',
    color: 'bg-indigo-500',
    email: 'james.park@hospital.com',
    maxHours: 45,
  },
];

// Sample shift data with more variety
const initialShifts = [
  {
    id: 'shift1',
    employeeId: 'emp1',
    day: 0, // Monday
    startTime: '06:00',
    endTime: '14:00',
    duration: 8,
    type: 'Morning',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    department: 'ICU',
  },
  {
    id: 'shift2',
    employeeId: 'emp1',
    day: 2, // Wednesday
    startTime: '06:00',
    endTime: '14:00',
    duration: 8,
    type: 'Morning',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    department: 'ICU',
  },
  {
    id: 'shift3',
    employeeId: 'emp1',
    day: 4, // Friday
    startTime: '14:00',
    endTime: '22:00',
    duration: 8,
    type: 'Evening',
    color: 'bg-blue-200 border-blue-400 text-blue-900',
    department: 'ICU',
  },
  {
    id: 'shift4',
    employeeId: 'emp2',
    day: 1, // Tuesday
    startTime: '08:00',
    endTime: '18:00',
    duration: 10,
    type: 'Day',
    color: 'bg-green-100 border-green-300 text-green-800',
    department: 'Emergency',
  },
  {
    id: 'shift5',
    employeeId: 'emp2',
    day: 3, // Thursday
    startTime: '08:00',
    endTime: '18:00',
    duration: 10,
    type: 'Day',
    color: 'bg-green-100 border-green-300 text-green-800',
    department: 'Emergency',
  },
  {
    id: 'shift6',
    employeeId: 'emp3',
    day: 0, // Monday
    startTime: '22:00',
    endTime: '06:00',
    duration: 8,
    type: 'Night',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    department: 'General',
  },
  {
    id: 'shift7',
    employeeId: 'emp3',
    day: 2, // Wednesday
    startTime: '14:00',
    endTime: '22:00',
    duration: 8,
    type: 'Evening',
    color: 'bg-purple-200 border-purple-400 text-purple-900',
    department: 'General',
  },
  {
    id: 'shift8',
    employeeId: 'emp4',
    day: 1, // Tuesday
    startTime: '07:00',
    endTime: '15:00',
    duration: 8,
    type: 'Day',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    department: 'Lab',
  },
  {
    id: 'shift9',
    employeeId: 'emp4',
    day: 3, // Thursday
    startTime: '07:00',
    endTime: '15:00',
    duration: 8,
    type: 'Day',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    department: 'Lab',
  },
  {
    id: 'shift10',
    employeeId: 'emp5',
    day: 0, // Monday
    startTime: '09:00',
    endTime: '17:00',
    duration: 8,
    type: 'Admin',
    color: 'bg-pink-100 border-pink-300 text-pink-800',
    department: 'Administration',
  },
  {
    id: 'shift11',
    employeeId: 'emp5',
    day: 2, // Wednesday
    startTime: '09:00',
    endTime: '17:00',
    duration: 8,
    type: 'Admin',
    color: 'bg-pink-100 border-pink-300 text-pink-800',
    department: 'Administration',
  },
  {
    id: 'shift12',
    employeeId: 'emp6',
    day: 1, // Tuesday
    startTime: '10:00',
    endTime: '18:00',
    duration: 8,
    type: 'Day',
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    department: 'Radiology',
  },
];

// Enhanced Draggable Shift Component
const DraggableShift = ({ shift, employee, isDragOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shift.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragOverlay ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${shift.color} border-2 rounded-lg p-3 mb-2 cursor-move hover:shadow-lg transition-all duration-200 relative group ${
        isDragOverlay ? 'shadow-2xl scale-105' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm font-semibold">{shift.type}</div>
        <div className="text-xs opacity-75">{shift.department}</div>
      </div>
      <div className="text-sm font-medium mb-1">
        {shift.startTime} - {shift.endTime}
      </div>
      <div className="text-xs opacity-80">{shift.duration}h</div>
      {employee && (
        <div className="text-xs mt-2 font-medium border-t border-current pt-1 opacity-90">
          {employee.name}
        </div>
      )}
      
      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
        </svg>
      </div>
    </div>
  );
};

// Enhanced Employee Row Component
const EmployeeRow = ({ employee, shifts, weekDays, onDeleteShift }) => {
  const employeeShifts = shifts.filter(shift => shift.employeeId === employee.id);
  const totalHours = employeeShifts.reduce((sum, shift) => sum + shift.duration, 0);
  const isOvertime = totalHours > employee.maxHours;

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
          const dayShifts = shifts.filter(
            shift => shift.employeeId === employee.id && shift.day === dayIndex
          );
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

// Enhanced Main Staff Scheduler Component
const StaffScheduler = () => {
  const [employees] = useState(initialEmployees);
  const [shifts, setShifts] = useState(initialShifts);
  const [activeShift, setActiveShift] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(weekStart, i)
  );

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const shift = shifts.find(s => s.id === active.id);
    setActiveShift(shift);
  }, [shifts]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveShift(null);

    if (!over) return;

    const activeShift = shifts.find(s => s.id === active.id);
    if (!activeShift) return;

    // Improved drop detection
    const overElement = document.elementFromPoint(
      event.activatorEvent?.clientX || 0, 
      event.activatorEvent?.clientY || 0
    );
    
    const dayCell = overElement?.closest('[data-employee-id][data-day]');
    
    if (dayCell) {
      const newEmployeeId = dayCell.getAttribute('data-employee-id');
      const newDay = parseInt(dayCell.getAttribute('data-day'));
      
      if (newEmployeeId && newDay !== null && 
          (newEmployeeId !== activeShift.employeeId || newDay !== activeShift.day)) {
        setShifts(prevShifts => 
          prevShifts.map(shift => 
            shift.id === activeShift.id 
              ? { ...shift, employeeId: newEmployeeId, day: newDay }
              : shift
          )
        );
      }
    }
  }, [shifts]);

  const navigateWeek = useCallback((direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  }, [currentWeek]);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  const deleteShift = useCallback((shiftId) => {
    setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
  }, []);

  const addNewShift = useCallback(() => {
    const shiftTypes = [
      { type: 'Morning', color: 'bg-blue-100 border-blue-300 text-blue-800', start: '06:00', end: '14:00' },
      { type: 'Day', color: 'bg-green-100 border-green-300 text-green-800', start: '08:00', end: '17:00' },
      { type: 'Evening', color: 'bg-orange-100 border-orange-300 text-orange-800', start: '14:00', end: '22:00' },
      { type: 'Night', color: 'bg-purple-100 border-purple-300 text-purple-800', start: '22:00', end: '06:00' },
    ];
    
    const randomShiftType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
    const startHour = parseInt(randomShiftType.start.split(':')[0]);
    const endHour = parseInt(randomShiftType.end.split(':')[0]);
    const duration = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
    
    const newShift = {
      id: `shift${Date.now()}`,
      employeeId: selectedEmployee || employees[0].id,
      day: selectedDay,
      startTime: randomShiftType.start,
      endTime: randomShiftType.end,
      duration: duration,
      type: randomShiftType.type,
      color: randomShiftType.color,
      department: 'General',
    };
    setShifts(prevShifts => [...prevShifts, newShift]);
    setShowAddShiftModal(false);
  }, [selectedEmployee, selectedDay, employees]);

  // Calculate statistics
  const totalHours = shifts.reduce((sum, shift) => sum + shift.duration, 0);
  const averageHoursPerEmployee = employees.length > 0 ? (totalHours / employees.length).toFixed(1) : 0;
  const overtimeEmployees = employees.filter(emp => {
    const empHours = shifts
      .filter(shift => shift.employeeId === emp.id)
      .reduce((sum, shift) => sum + shift.duration, 0);
    return empHours > emp.maxHours;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
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
              <button
                onClick={goToCurrentWeek}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Today
              </button>
              <button
                onClick={() => setShowAddShiftModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Shift</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Week Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm hidden sm:inline">Previous</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Week {Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center space-x-1"
            >
              <span className="text-sm hidden sm:inline">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Calendar Grid */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Enhanced Header Row */}
          <div className="grid grid-cols-8 gap-0 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
            <div className="p-4 border-r border-gray-200 font-semibold text-gray-900 sticky left-0 z-20 bg-white">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Employee</span>
              </div>
            </div>
            {weekDays.map((day, index) => {
              const isTodayCheck = isToday(day);
              return (
                <div key={index} className={`p-4 border-r border-gray-200 text-center ${isTodayCheck ? 'bg-blue-100' : ''}`}>
                  <div className={`font-semibold ${isTodayCheck ? 'text-blue-900' : 'text-gray-900'}`}>
                    <span className="hidden sm:inline">{dayNames[index]}</span>
                    <span className="sm:hidden">{dayAbbreviations[index]}</span>
                  </div>
                  <div className={`text-sm mt-1 ${isTodayCheck ? 'text-blue-700' : 'text-gray-600'}`}>
                    {format(day, 'MMM d')}
                  </div>
                  {isTodayCheck && (
                    <div className="text-xs font-medium text-blue-600 mt-1">Today</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Employee Rows */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
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

        {/* Enhanced Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Staff</dt>
                  <dd className="text-2xl font-bold text-gray-900">{employees.length}</dd>
                  <dd className="text-xs text-gray-600 mt-1">Active employees</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Shifts</dt>
                  <dd className="text-2xl font-bold text-gray-900">{shifts.length}</dd>
                  <dd className="text-xs text-gray-600 mt-1">This week</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalHours}h</dd>
                  <dd className="text-xs text-gray-600 mt-1">{averageHoursPerEmployee}h avg/employee</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${overtimeEmployees > 0 ? 'bg-red-500' : 'bg-green-500'} rounded-lg flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overtime</dt>
                  <dd className={`text-2xl font-bold ${overtimeEmployees > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {overtimeEmployees}
                  </dd>
                  <dd className="text-xs text-gray-600 mt-1">
                    {overtimeEmployees > 0 ? 'employees over limit' : 'all within limits'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Shift</h3>
            
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
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
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
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>
                      {day} ({format(weekDays[index], 'MMM d')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddShiftModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addNewShift}
                disabled={!selectedEmployee}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-md transition-colors duration-200"
              >
                Add Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScheduler;
