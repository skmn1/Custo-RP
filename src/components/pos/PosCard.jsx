import React from 'react';
import Button from '../ui/Button';
import { POS_TYPE_LABELS, POS_TYPE_COLORS } from '../../constants/pos';

const PosCard = ({ pos, onView, onEdit, onDelete }) => {
  const typeColor = POS_TYPE_COLORS[pos.type] || POS_TYPE_COLORS.MIXED;

  return (
    <div
      data-testid="pos-card"
      data-pos-id={pos.id}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col transition-all duration-200 hover:shadow-xl ${
        !pos.isActive ? 'opacity-50' : ''
      }`}
    >
      {/* Header: Type badge + Status dot */}
      <div className="flex items-center justify-between mb-4">
        <span
          data-testid="pos-type-badge"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text} ${typeColor.border} border`}
        >
          {POS_TYPE_LABELS[pos.type] || pos.type}
        </span>
        <span className="flex items-center gap-1.5">
          {!pos.isActive && (
            <span
              data-testid="pos-inactive-badge"
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
            >
              Inactive
            </span>
          )}
          <span
            data-testid="pos-status-dot"
            className={`w-2.5 h-2.5 rounded-full ${
              pos.isActive ? 'bg-green-400' : 'bg-gray-400'
            }`}
          />
        </span>
      </div>

      {/* Name */}
      <h3
        data-testid="pos-name"
        className="text-lg font-bold text-gray-900 mb-3"
      >
        {pos.name}
      </h3>

      {/* Info lines */}
      <div className="space-y-1.5 mb-5 flex-1">
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <span className="shrink-0">📍</span>
          <span data-testid="pos-address">{pos.address}</span>
        </p>
        {pos.phone && (
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <span className="shrink-0">📞</span>
            <span data-testid="pos-phone">{pos.phone}</span>
          </p>
        )}
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <span className="shrink-0">👤</span>
          <span data-testid="pos-manager">
            Manager: {pos.managerName || 'Unassigned'}
          </span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(pos)}
          data-testid="pos-view-btn"
        >
          View
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(pos)}
          data-testid="pos-edit-btn"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(pos)}
          data-testid="pos-delete-btn"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PosCard;
