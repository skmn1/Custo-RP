import { useState, useCallback } from 'react';
import { initialShifts } from '../data/shifts';
import { SHIFT_TYPES } from '../constants/scheduler';
import { generateShiftId, calculateShiftDuration } from '../utils/shiftUtils';

export const useShifts = () => {
  const [shifts, setShifts] = useState(initialShifts);

  const addShift = useCallback((employeeId, day, customShiftData = null) => {
    let newShift;
    
    if (customShiftData) {
      // Use provided shift data from AddShiftModal
      newShift = {
        id: generateShiftId(),
        employeeId,
        day,
        startTime: customShiftData.startTime,
        endTime: customShiftData.endTime,
        duration: customShiftData.duration,
        type: customShiftData.type,
        department: customShiftData.department,
        color: getShiftColor(customShiftData.type),
      };
    } else {
      // Use random shift type for quick add
      const randomShiftType = SHIFT_TYPES[Math.floor(Math.random() * SHIFT_TYPES.length)];
      const duration = calculateShiftDuration(randomShiftType.start, randomShiftType.end);
      
      newShift = {
        id: generateShiftId(),
        employeeId,
        day,
        startTime: randomShiftType.start,
        endTime: randomShiftType.end,
        duration,
        type: randomShiftType.type,
        color: randomShiftType.color,
        department: 'General',
      };
    }

    setShifts(prevShifts => [...prevShifts, newShift]);
    return newShift;
  }, []);

  // Helper function to get color based on shift type
  const getShiftColor = (shiftType) => {
    const colorMap = {
      'Regular': 'bg-blue-100 border-blue-300 text-blue-800',
      'Overtime': 'bg-red-100 border-red-300 text-red-800',
      'Training': 'bg-green-100 border-green-300 text-green-800',
      'Meeting': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'Break': 'bg-gray-100 border-gray-300 text-gray-800',
    };
    return colorMap[shiftType] || 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const deleteShift = useCallback((shiftId) => {
    setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
  }, []);

  const updateShift = useCallback((shiftId, updates) => {
    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === shiftId 
          ? { ...shift, ...updates }
          : shift
      )
    );
  }, []);

  const moveShift = useCallback((shiftId, newEmployeeId, newDay) => {
    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === shiftId 
          ? { ...shift, employeeId: newEmployeeId, day: newDay }
          : shift
      )
    );
  }, []);

  return {
    shifts,
    addShift,
    deleteShift,
    updateShift,
    moveShift,
  };
};
