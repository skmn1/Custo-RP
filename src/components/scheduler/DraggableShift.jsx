import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TimePickerDropdown = ({ startTime, endTime, onTimeChange, onClose }) => {
  const [currentStartTime, setCurrentStartTime] = useState(startTime);
  const [currentEndTime, setCurrentEndTime] = useState(endTime);
  const dropdownRef = useRef(null);
  
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  const handleValidate = () => {
    onTimeChange(currentStartTime, currentEndTime);
    onClose();
  };

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

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-0 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4"
      onClick={(e) => e.stopPropagation()}
      style={{ minWidth: '320px' }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-sm font-semibold text-gray-800 text-center border-b border-gray-100 pb-2">
          Edit Shift Time
        </div>
        
        {/* Time Selection Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <select
              value={currentStartTime}
              onChange={(e) => {
                const newStart = e.target.value;
                const duration = calculateDuration(currentStartTime, currentEndTime);
                const [hour, min] = newStart.split(':').map(Number);
                const endMinutes = (hour * 60 + min + duration * 60) % (24 * 60);
                const newEndHour = Math.floor(endMinutes / 60);
                const newEndMin = endMinutes % 60;
                const newEnd = `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`;
                setCurrentStartTime(newStart);
                setCurrentEndTime(newEnd);
              }}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <select
              value={currentEndTime}
              onChange={(e) => setCurrentEndTime(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Duration Display */}
        <div className="bg-gray-50 rounded-md p-3 text-center">
          <div className="text-xs font-medium text-gray-600 mb-1">Total Duration</div>
          <div className="text-lg font-semibold text-indigo-600">
            {calculateDuration(currentStartTime, currentEndTime).toFixed(1)} hours
          </div>
        </div>
        
        {/* Validate Button */}
        <div className="flex justify-center pt-2 border-t border-gray-100">
          <button
            onClick={handleValidate}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Validate
          </button>
        </div>
      </div>
    </div>
  );
};

const DraggableShift = ({ shift, employee, isDragOverlay = false, onUpdateShift, onDeleteShift }) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: shift.id,
    data: {
      type: 'shift',
      shift,
      employee,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: 1,
    zIndex: isDragOverlay ? 1000 : isEditingTime ? 100 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleTimeChange = (newStartTime, newEndTime) => {
    if (onUpdateShift) {
      const [startHour, startMin] = newStartTime.split(':').map(Number);
      const [endHour, endMin] = newEndTime.split(':').map(Number);
      let startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;
      
      // Handle overnight shifts
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
      }
      
      const duration = (endMinutes - startMinutes) / 60;
      
      onUpdateShift(shift.id, {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: Math.round(duration * 10) / 10 // Round to 1 decimal place
      });
    }
  };

  // Create drag handlers that don't interfere with time editing
  const dragHandlers = isEditingTime ? {} : { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragHandlers}
      data-testid="shift-card"
      data-shift-type={shift.type}
      data-shift-id={shift.id}
      className={`${shift.color} border-2 rounded-lg p-3 mb-2 relative group touch-none ${
        isDragOverlay 
          ? 'shadow-2xl scale-105 rotate-3 border-indigo-400 transition-all duration-200' 
          : isDragging
            ? '' // No special styling during drag to keep original appearance
            : 'hover:shadow-lg hover:scale-102 cursor-grab active:cursor-grabbing transition-all duration-200'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm font-semibold">{shift.type}</div>
        <div className="text-xs opacity-75">{shift.department}</div>
      </div>
      
      {/* Editable Time Section */}
      <div className="relative">
        <div 
          data-testid="shift-time-display"
          className="text-sm font-medium mb-1 cursor-pointer hover:border hover:border-current rounded px-1 py-0.5 transition-all duration-200 inline-block"
          onClick={(e) => {
            e.stopPropagation();
            if (!isDragOverlay && onUpdateShift) {
              setIsEditingTime(true);
            }
          }}
          title="Click to edit time"
        >
          {shift.startTime} - {shift.endTime}
          <svg className="w-3 h-3 inline ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        
        {/* Time Picker Dropdown */}
        {isEditingTime && !isDragOverlay && (
          <TimePickerDropdown
            startTime={shift.startTime}
            endTime={shift.endTime}
            onTimeChange={handleTimeChange}
            onClose={() => setIsEditingTime(false)}
          />
        )}
      </div>
      
      <div data-testid="shift-duration" className="text-xs opacity-80">{shift.duration}h</div>
      {employee && (
        <div className="text-xs mt-2 font-medium border-t border-current pt-1 opacity-90">
          {employee.name}
        </div>
      )}
      
      {/* Enhanced drag indicator */}
      <div className={`absolute top-2 right-2 transition-opacity ${
        isDragOverlay ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
      }`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
        </svg>
      </div>

      {/* Delete button */}
      {onDeleteShift && !isDragOverlay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteShift(shift.id);
          }}
          className="absolute top-1 right-1 w-5 h-5 bg-white border border-gray-300 text-gray-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shadow-sm hover:shadow-md z-10"
          title="Delete shift"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DraggableShift;
