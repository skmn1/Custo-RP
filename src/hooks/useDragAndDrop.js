import { useState, useCallback } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const useDragAndDrop = (shifts, moveShift) => {
  const [activeShift, setActiveShift] = useState(null);

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
        moveShift(activeShift.id, newEmployeeId, newDay);
      }
    }
  }, [shifts, moveShift]);

  return {
    sensors,
    activeShift,
    handleDragStart,
    handleDragEnd,
  };
};
