import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableShift = ({ shift, employee, isDragOverlay = false }) => {
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
    zIndex: isDragOverlay ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
      <div className="text-sm font-medium mb-1">
        {shift.startTime} - {shift.endTime}
      </div>
      <div className="text-xs opacity-80">{shift.duration}h</div>
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
    </div>
  );
};

export default DraggableShift;
