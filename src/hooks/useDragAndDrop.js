import { useState, useCallback } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  getClientRect,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const useDragAndDrop = (shifts, moveShift) => {
  const [activeShift, setActiveShift] = useState(null);
  const [dragOverDropZone, setDragOverDropZone] = useState(null);

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
    setDragOverDropZone(null);
  }, [shifts]);

  const handleDragOver = useCallback((event) => {
    const { over } = event;
    if (over && over.data?.current?.type === 'dropzone') {
      setDragOverDropZone(over.id);
    } else {
      setDragOverDropZone(null);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over, delta } = event;
    setActiveShift(null);
    setDragOverDropZone(null);

    if (!over) {
      // Enhanced drop detection for when over is null
      const activeShift = shifts.find(s => s.id === active.id);
      if (!activeShift) return;

      // Get the current mouse position
      const rect = active.rect.current.translated;
      if (!rect) return;

      // Find the element at the drop position
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const elementBelow = document.elementFromPoint(centerX, centerY);
      const dayCell = elementBelow?.closest('[data-employee-id][data-day]');
      
      if (dayCell) {
        const newEmployeeId = dayCell.getAttribute('data-employee-id');
        const newDay = parseInt(dayCell.getAttribute('data-day'));
        
        if (newEmployeeId && newDay !== null && 
            (newEmployeeId !== activeShift.employeeId || newDay !== activeShift.day)) {
          moveShift(activeShift.id, newEmployeeId, newDay);
        }
      }
      return;
    }

    const activeShift = shifts.find(s => s.id === active.id);
    if (!activeShift) return;

    // Handle drop zone drops
    if (over.data?.current?.type === 'dropzone') {
      const [employeeId, dayIndex] = over.id.split('-');
      const newDay = parseInt(dayIndex);
      
      if (employeeId && newDay !== null && 
          (employeeId !== activeShift.employeeId || newDay !== activeShift.day)) {
        moveShift(activeShift.id, employeeId, newDay);
      }
      return;
    }

    // Fallback to element detection
    const dayCell = over.node?.current?.closest('[data-employee-id][data-day]') || 
                   document.querySelector(`[data-droppable-id="${over.id}"]`);
    
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
    dragOverDropZone,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
