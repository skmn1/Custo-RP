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
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragOverlay ? 1000 : isDragging ? 999 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${shift.color} border-2 rounded-lg p-3 mb-2 transition-all duration-200 relative group touch-none ${
        isDragOverlay 
          ? 'shadow-2xl scale-105 rotate-3 border-indigo-400' 
          : isDragging 
            ? 'shadow-lg scale-105' 
            : 'hover:shadow-lg hover:scale-102 cursor-grab active:cursor-grabbing'
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

      {/* Drag preview indicator */}
      {isDragOverlay && (
        <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg border-2 border-dashed border-white"></div>
      )}
    </div>
  );
};

export default DraggableShift;
