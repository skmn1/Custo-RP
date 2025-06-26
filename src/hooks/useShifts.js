import { useState, useCallback } from 'react';
import { initialShifts } from '../data/shifts';
import { SHIFT_TYPES } from '../constants/scheduler';
import { generateShiftId, calculateShiftDuration } from '../utils/shiftUtils';

export const useShifts = () => {
  const [shifts, setShifts] = useState(initialShifts);

  const addShift = useCallback((employeeId, day, shiftTypeIndex = null) => {
    const randomShiftType = shiftTypeIndex !== null 
      ? SHIFT_TYPES[shiftTypeIndex]
      : SHIFT_TYPES[Math.floor(Math.random() * SHIFT_TYPES.length)];
    
    const duration = calculateShiftDuration(randomShiftType.start, randomShiftType.end);
    
    const newShift = {
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

    setShifts(prevShifts => [...prevShifts, newShift]);
    return newShift;
  }, []);

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
